import { EventType, Prisma } from "../../../generated/prisma";
import { prisma } from "../../lib/prisma";

const normalizeTimeTo24Hour = (time: string) => {
    const trimmedTime = time.trim();
    const match = trimmedTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

    if (!match) return trimmedTime;

    const [, rawHour, minute, meridiem] = match;
    let hour = Number(rawHour);
    const upperMeridiem = meridiem.toUpperCase();

    if (upperMeridiem === "AM" && hour === 12) hour = 0;
    if (upperMeridiem === "PM" && hour !== 12) hour += 12;

    return `${String(hour).padStart(2, "0")}:${minute}`;
};

const buildIsoDateTime = (date?: string | Date, time?: string) => {
    if (!date) throw new Error("date is required");
    if (!time) throw new Error("time is required");

    const datePart = date instanceof Date ? date.toISOString().split("T")[0] : String(date).trim();
    const normalizedTime = normalizeTimeTo24Hour(String(time));
    const parsedDate = new Date(`${datePart} ${normalizedTime}`);
    if (Number.isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date or time format");
    }
    const isoDate = parsedDate.toISOString();

    console.log("ISO Date:", isoDate);
    return isoDate;
};

const createEvent = async (payload: {
    title: string;
    description: string;
    venue?: string;
    eventLink?: string;
    date: string | Date;
    time: string;
    type: EventType;
    fee: number;
    ownerId: string;
}) => {
    const isoDate = buildIsoDateTime(payload.date, payload.time);
    return await prisma.event.create({
        data: {
            ...payload,
            date: isoDate,
        },
    });
};

const getAllEvents = async (query: {
    search?: string;
    type?: EventType;
    fee?: "free" | "paid";
    page?: number | string;
    limit?: number | string;
}) => {
    const page = Number(query.page ?? 1) || 1;
    const limit = Number(query.limit ?? 9) || 9;
    const { search, type, fee } = query;

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
            _count: { select: { participants: true } },
        },
    });
};

const getUpcomingEvents = async () => {
    return await prisma.event.findMany({
        where: {
            date: { gte: new Date() },
        },
        take: 9,
        orderBy: { date: "asc" },
        include: {
            owner: { select: { id: true, name: true, image: true } },
            _count: { select: { participants: true } },
        },
    });
};

const getMyEvents = async (ownerId: string) => {
    return await prisma.event.findMany({
        where: { ownerId },
        orderBy: { createdAt: "desc" },
        include: {
            owner: { select: { id: true, name: true, image: true } },
            _count: { select: { participants: true } },
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
    data: Prisma.EventUpdateInput & { date?: string | Date; time?: string }
) => {
    const event = await prisma.event.findFirst({ where: { id, ownerId } });
    if (!event) throw new Error("Event not found or you are not the owner");

    const updatePayload: Prisma.EventUpdateInput = { ...data };

    if (data.date !== undefined || data.time !== undefined) {
        const dateValue =
            data.date !== undefined ? data.date : event.date;
        const timeValue =
            data.time !== undefined ? data.time : event.time;

        if (!dateValue) throw new Error("date is required");
        if (!timeValue) throw new Error("time is required");

        const isoDate = buildIsoDateTime(dateValue as string | Date, String(timeValue));
        updatePayload.date = isoDate;
    }

    return await prisma.event.update({ where: { id }, data: updatePayload });
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
    getMyEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    setFeaturedEvent,
};