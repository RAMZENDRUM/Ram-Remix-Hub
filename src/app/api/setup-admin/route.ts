import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const email = "ramzendrum@gmail.com";
        const password = "admin"; // Reset to this simple password

        const passwordHash = await bcrypt.hash(password, 10);

        // Upsert: Update if exists, Create if not
        await prisma.user.upsert({
            where: { email },
            update: {
                passwordHash, // Update password
            },
            create: {
                name: "Ram Admin",
                email,
                passwordHash,
            },
        });

        return NextResponse.json({ message: "Admin password reset successfully! Login with: ramzendrum@gmail.com / admin" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to reset admin", details: error }, { status: 500 });
    }
}
