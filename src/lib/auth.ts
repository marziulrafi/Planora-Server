import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    trustedOrigins: [process.env.APP_URL!],

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