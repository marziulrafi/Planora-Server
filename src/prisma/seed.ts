import "dotenv/config";
import { Role } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { AuthService } from "../modules/auth/auth.service";


async function main() {
    const email = process.env.ADMIN_EMAIL!;
    const password = process.env.ADMIN_PASSWORD!;

    const existing = await prisma.user.findUnique({
        where: { email },
    });

    if (existing) {
        console.log("Admin already exists. Skipping...");
        return;
    }

    // ✅ Create user via better-auth
    const { user } = await AuthService.register({
        name: "Admin",
        email,
        password,
    });

    // ✅ Promote to ADMIN
    await prisma.user.update({
        where: { id: user.id },
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