import { EventType, Prisma } from "../../../generated/prisma";
import { prisma } from "../../lib/prisma";

const createEvent = async (payload: {
    title: string;
    description: string;
    venue?: string;
    eventLink?: string;
    date: Date;
    time: string;
    type: EventType;
    fee: number;
    ownerId: string;
}) => {
    return await prisma.event.create({ data: payload });
};

const getAllEvents = async (query: {
    search?: string;
    type?: EventType;
    fee?: "free" | "paid";
    page?: number;
    limit?: number;
}) => {
    const { search, type, fee, page = 1, limit = 9 } = query;

    const where: Prisma.EventWhereInput = {};

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { owner: { name: { contains: search, mode: "insensitive" } } },
        ];
    }
    if (type) where.type = type;
    if (fee === "free") where.fee = 0;
    if (fee === "paid") where.fee = { gt: 0 };

    const [data, total] = await Promise.all([
        prisma.event.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                owner: { select: { id: true, name: true, image: true } },
                _count: { select: { participants: true } },
            },
        }),
        prisma.event.count({ where }),
    ]);

    return { data, total, page, limit };
};

const getFeaturedEvent = async () => {
    return await prisma.event.findFirst({
        where: { isFeatured: true },
        include: {
            owner: { select: { id: true, name: true, image: true } },
        },
    });
};

const getUpcomingEvents = async () => {
    return await prisma.event.findMany({
        where: {
            type: "PUBLIC",
            date: { gte: new Date() },
        },
        take: 9,
        orderBy: { date: "asc" },
        include: {
            owner: { select: { id: true, name: true } },
        },
    });
};

const getEventById = async (id: string) => {
    return await prisma.event.findUniqueOrThrow({
        where: { id },
        include: {
            owner: { select: { id: true, name: true, image: true } },
            participants: {
                include: {
                    user: { select: { id: true, name: true, image: true } },
                },
            },
            reviews: {
                include: {
                    user: { select: { id: true, name: true, image: true } },
                },
                orderBy: { createdAt: "desc" },
            },
            _count: { select: { participants: true } },
        },
    });
};

const updateEvent = async (
    id: string,
    ownerId: string,
    data: Prisma.EventUpdateInput
) => {
    const event = await prisma.event.findFirst({ where: { id, ownerId } });
    if (!event) throw new Error("Event not found or you are not the owner");

    return await prisma.event.update({ where: { id }, data });
};

const deleteEvent = async (id: string, userId: string, role: string) => {
    const event = await prisma.event.findUniqueOrThrow({ where: { id } });

    if (event.ownerId !== userId && role !== "ADMIN") {
        throw new Error("You are not authorized to delete this event");
    }

    return await prisma.event.delete({ where: { id } });
};

const setFeaturedEvent = async (id: string) => {
    await prisma.event.updateMany({ data: { isFeatured: false } });
    return await prisma.event.update({
        where: { id },
        data: { isFeatured: true },
    });
};

export const EventService = {
    createEvent,
    getAllEvents,
    getFeaturedEvent,
    getUpcomingEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    setFeaturedEvent,
};