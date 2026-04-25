import { prisma } from "../../lib/prisma";

const getMe = async (userId: string) => {
    return await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            phone: true,
            status: true,
            createdAt: true,
            _count: {
                select: {
                    ownedEvents: true,
                    participants: true,
                    reviews: true,
                },
            },
        },
    });
};

const updateProfile = async (
    userId: string,
    data: { name?: string; image?: string; phone?: string }
) => {
    return await prisma.user.update({
        where: { id: userId },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
            role: true,
            status: true,
            updatedAt: true,
        },
    });
};

export const AuthService = {
    getMe,
    updateProfile,
};