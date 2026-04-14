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

const getMyJoinedEvents = async (userId: string) => {
    return await prisma.participant.findMany({
        where: { userId },
        include: {
            event: {
                include: {
                    owner: { select: { id: true, name: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
};



export const ParticipantService = {
    joinFreePublicEvent,
    requestToJoin,
    approveParticipant,
    rejectParticipant,
    banParticipant,
    getParticipantsByEvent,
    getMyJoinedEvents,
};