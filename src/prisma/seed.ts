import "dotenv/config";
import { Role } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";

async function main() {
    const name = "Admin";
    const email = process.env.ADMIN_EMAIL!;
    const password = process.env.ADMIN_PASSWORD!;

    if (!email || !password) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        if (existing.role !== Role.ADMIN) {
            await prisma.user.update({
                where: { email },
                data: { role: Role.ADMIN },
            });
            console.log("✅ Existing user elevated to ADMIN:", email);
        } else {
            console.log("⏭️  Admin already exists. Skipping...");
        }
        return;
    }

    const result = await auth.api.signUpEmail({
        body: { name, email, password },
    });

    if (!result?.user) {
        throw new Error("Better Auth signUpEmail returned no user");
    }

    await prisma.user.update({
        where: { id: result.user.id },
        data: {
            role: Role.ADMIN,
            status: "ACTIVE",
        },
    });

    console.log("✅ Admin seeded successfully:", email);
}

main()
    .catch((err) => {
        console.error("❌ Seed failed:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });