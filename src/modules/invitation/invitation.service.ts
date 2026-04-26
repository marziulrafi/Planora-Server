import { prisma } from "../../lib/prisma";

class InvitationError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

const sendInvitation = async (payload: {
    senderId: string;
    email: string;
    eventId: string;
}) => {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const event = await prisma.event.findUniqueOrThrow({ where: { id: payload.eventId } });

    if (event.ownerId !== payload.senderId) {
        throw new InvitationError("Only the event owner can send invitations", 403);
    }

    const receiver = await prisma.user.findUnique({
        where: { email: normalizedEmail },
    });
    if (!receiver) {
        throw new InvitationError("User not found", 404);
    }
    if (payload.senderId === receiver.id) {
        throw new InvitationError("You cannot invite yourself", 400);
    }

    const existing = await prisma.invitation.findUnique({
        where: {
            receiverId_eventId: {
                receiverId: receiver.id,
                eventId: payload.eventId,
            },
        },
    });
    if (existing) throw new InvitationError("Invitation already sent to this user for this event", 409);

    return await prisma.invitation.create({
        data: {
            senderId: payload.senderId,
            receiverId: receiver.id,
            eventId: payload.eventId,
        },
    });
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
        include: {
            event: {
                select: {
                    id: true,
                    type: true,
                },
            },
        },
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
                userId_eventId: { userId, eventId: invitation.event.id },
            },
            create: {
                userId,
                eventId: invitation.event.id,
                status: invitation.event.type === "PUBLIC" ? "APPROVED" : "APPROVED",
            },
            update: { status: "APPROVED" },
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