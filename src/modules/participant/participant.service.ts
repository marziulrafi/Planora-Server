import { prisma } from "../../lib/prisma";

const joinFreePublicEvent = async (userId: string, eventId: string) => {
    const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });

    if (event.type !== "PUBLIC" || event.fee > 0) {
        throw new Error("This endpoint is only for free public events");
    }
    if (event.ownerId === userId) {
        throw new Error("You cannot join your own event");
    }

    const existing = await prisma.participant.findUnique({
        where: { userId_eventId: { userId, eventId } },
    });
    if (existing) throw new Error("You have already joined this event");

    return await prisma.participant.create({
        data: { userId, eventId, status: "APPROVED" },
    });
};

const requestToJoin = async (userId: string, eventId: string) => {
    const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });

    if (event.ownerId === userId) {
        throw new Error("You cannot join your own event");
    }

    const existing = await prisma.participant.findUnique({
        where: { userId_eventId: { userId, eventId } },
    });
    if (existing) throw new Error("You have already requested to join this event");

    return await prisma.participant.create({
        data: { userId, eventId, status: "PENDING" },
    });
};

const createParticipant = async (
    userId: string,
    payload: { eventId: string; action: "join" | "request" }
) => {
    const event = await prisma.event.findUniqueOrThrow({ where: { id: payload.eventId } });

    if (event.ownerId === userId) {
        throw new Error("You cannot join your own event");
    }

    const existing = await prisma.participant.findUnique({
        where: { userId_eventId: { userId, eventId: payload.eventId } },
    });
    if (existing) throw new Error("You have already joined or requested this event");

    if (payload.action === "join") {
        if (event.type !== "PUBLIC") {
            throw new Error("Only public events can be joined directly");
        }
        if (event.fee > 0) {
            throw new Error("Paid events require payment before joining");
        }
        return await prisma.participant.create({
            data: { userId, eventId: payload.eventId, status: "APPROVED" },
        });
    }

    if (payload.action === "request") {
        if (event.fee > 0) {
            throw new Error("Paid events require payment before requesting access");
        }
        return await prisma.participant.create({
            data: { userId, eventId: payload.eventId, status: "PENDING" },
        });
    }

    throw new Error("Invalid participant action");
};

const approveParticipant = async (
    eventId: string,
    targetUserId: string,
    requesterId: string
) => {
    const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });

    if (event.ownerId !== requesterId) {
        throw new Error("Only the event owner can approve participants");
    }

    return await prisma.participant.update({
        where: { userId_eventId: { userId: targetUserId, eventId } },
        data: { status: "APPROVED" },
    });
};

const rejectParticipant = async (
    eventId: string,
    targetUserId: string,
    requesterId: string
) => {
    const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });

    if (event.ownerId !== requesterId) {
        throw new Error("Only the event owner can reject participants");
    }

    return await prisma.participant.update({
        where: { userId_eventId: { userId: targetUserId, eventId } },
        data: { status: "REJECTED" },
    });
};

const banParticipant = async (
    eventId: string,
    targetUserId: string,
    requesterId: string
) => {
    const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });

    if (event.ownerId !== requesterId) {
        throw new Error("Only the event owner can ban participants");
    }

    return await prisma.participant.update({
        where: { userId_eventId: { userId: targetUserId, eventId } },
        data: { status: "BANNED" },
    });
};

const getParticipantsByEvent = async (eventId: string, requesterId: string) => {
    const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });

    if (event.ownerId !== requesterId) {
        throw new Error("Only the event owner can view participants");
    }

    return await prisma.participant.findMany({
        where: { eventId },
        include: {
            user: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
    });
};

/**
 * Returns Participant[] (with event included) for the current user.
 * Only includes events the user joined (not owned).
 * Ownership is managed separately via GET /events/my.
 */
const getMyJoinedEvents = async (userId: string) => {
    return await prisma.participant.findMany({
        where: { userId },
        include: {
            event: {
                include: {
                    owner: { select: { id: true, name: true, image: true } },
                    _count: { select: { participants: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
};

export const ParticipantService = {
    joinFreePublicEvent,
    createParticipant,
    requestToJoin,
    approveParticipant,
    rejectParticipant,
    banParticipant,
    getParticipantsByEvent,
    getMyJoinedEvents,
};