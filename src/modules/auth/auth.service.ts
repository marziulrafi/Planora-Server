import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

const register = async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
}) => {
    const existing = await prisma.user.findUnique({
        where: { email: payload.email },
    });
    if (existing) throw new Error("Email already in use");

    const response = await auth.api.signUpEmail({
        body: {
            name: payload.name,
            email: payload.email,
            password: payload.password,
            phone: payload.phone,
        },
    });

    return {
        user: response.user,
        token: response.token,
    };
};

const login = async (payload: { email: string; password: string }) => {
    const response = await auth.api.signInEmail({
        body: {
            email: payload.email,
            password: payload.password,
        },
    });

    if (!response) throw new Error("Invalid email or password");

    return {
        user: response.user,
        token: response.token,
    };
};

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
    register,
    login,
    getMe,
    updateProfile,
};