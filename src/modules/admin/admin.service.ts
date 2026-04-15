import { prisma } from "../../lib/prisma";

const getAllUsers = async (query: { search?: string; page?: number; limit?: number }) => {
    const { search, page = 1, limit = 10 } = query;

    const where = search
        ? {
            OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
            ],
        }
        : {};

    const [data, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
                _count: { select: { ownedEvents: true, participants: true } },
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
    ]);

    return { data, total, page, limit };
};

const deleteUser = async (userId: string) => {
    return await prisma.user.delete({ where: { id: userId } });
};

const getAllEventsAdmin = async (query: { search?: string; page?: number; limit?: number }) => {
    const { search, page = 1, limit = 10 } = query;

    const where = search
        ? { title: { contains: search, mode: "insensitive" as const } }
        : {};

    const [data, total] = await Promise.all([
        prisma.event.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            include: {
                owner: { select: { id: true, name: true, email: true } },
                _count: { select: { participants: true } },
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.event.count({ where }),
    ]);

    return { data, total, page, limit };
};

const deleteEventAdmin = async (eventId: string) => {
    return await prisma.event.delete({ where: { id: eventId } });
};

const getDashboardStats = async () => {
    const [totalUsers, totalEvents, totalPayments, recentEvents] = await Promise.all([
        prisma.user.count(),
        prisma.event.count(),
        prisma.payment.aggregate({
            where: { status: "SUCCESS" },
            _sum: { amount: true },
            _count: true,
        }),
        prisma.event.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                owner: { select: { id: true, name: true } },
                _count: { select: { participants: true } },
            },
        }),
    ]);

    return {
        totalUsers,
        totalEvents,
        totalRevenue: totalPayments._sum.amount ?? 0,
        totalPayments: totalPayments._count,
        recentEvents,
    };
};

export const AdminService = {
    getAllUsers,
    deleteUser,
    getAllEventsAdmin,
    deleteEventAdmin,
    getDashboardStats,
};