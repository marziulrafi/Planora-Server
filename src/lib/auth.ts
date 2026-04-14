import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    trustedOrigins: [
        process.env.APP_URL!,
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:4000",
        "http://127.0.0.1:3000"
    ],

    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "USER",
                required: false,
                input: false,
            },
            status: {
                type: "string",
                defaultValue: "ACTIVE",
                required: false,
                input: false,
            },
            phone: {
                type: "string",
                required: false,
                input: true,
            },
        }
    },
    emailAndPassword: {
        enabled: true,
    },
});