import { prisma } from "../../lib/prisma";

const sendInvitation = async (payload: {
    senderId: string;
    receiverId: string;
    eventId: string;
}) => {
    const event = await prisma.event.findUniqueOrThrow({ where: { id: payload.eventId } });

    if (event.ownerId !== payload.senderId) {
        throw new Error("Only the event owner can send invitations");
    }
    if (payload.senderId === payload.receiverId) {
        throw new Error("You cannot invite yourself");
    }

    await prisma.user.findUniqueOrThrow({ where: { id: payload.receiverId } });

    const existing = await prisma.invitation.findUnique({
        where: {
            receiverId_eventId: {
                receiverId: payload.receiverId,
                eventId: payload.eventId,
            },
        },
    });
    if (existing) throw new Error("Invitation already sent to this user for this event");

    return await prisma.invitation.create({ data: payload });
};

const getMyInvitations = async (userId: string) => {
    return await prisma.invitation.findMany({
        where: { receiverId: userId },
        include: {
            event: {
                include: {
                    owner: { select: { id: true, name: true, image: true } },
                },
            },
            sender: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
    });
};

const acceptInvitation = async (invitationId: string, userId: string) => {
    const invitation = await prisma.invitation.findUniqueOrThrow({
        where: { id: invitationId },
    });

    if (invitation.receiverId !== userId) {
        throw new Error("This invitation does not belong to you");
    }
    if (invitation.status !== "PENDING") {
        throw new Error(`Invitation is already ${invitation.status.toLowerCase()}`);
    }

    const [updated] = await prisma.$transaction([
        prisma.invitation.update({
            where: { id: invitationId },
            data: { status: "ACCEPTED" },
        }),
        prisma.participant.upsert({
            where: {
                userId_eventId: { userId, eventId: invitation.eventId },
            },
            create: { userId, eventId: invitation.eventId, status: "PENDING" },
            update: { status: "PENDING" },
        }),
    ]);

    return updated;
};

const declineInvitation = async (invitationId: string, userId: string) => {
    const invitation = await prisma.invitation.findUniqueOrThrow({
        where: { id: invitationId },
    });

    if (invitation.receiverId !== userId) {
        throw new Error("This invitation does not belong to you");
    }
    if (invitation.status !== "PENDING") {
        throw new Error(`Invitation is already ${invitation.status.toLowerCase()}`);
    }

    return await prisma.invitation.update({
        where: { id: invitationId },
        data: { status: "DECLINED" },
    });
};

export const InvitationService = {
    sendInvitation,
    getMyInvitations,
    acceptInvitation,
    declineInvitation,
};