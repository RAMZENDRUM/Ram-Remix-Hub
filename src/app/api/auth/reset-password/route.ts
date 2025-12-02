import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
        }

        // Find the token in the database
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
        });

        if (!verificationToken) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        // Check if token has expired
        if (new Date() > verificationToken.expires) {
            // Optionally delete expired token
            await prisma.verificationToken.delete({ where: { token } });
            return NextResponse.json({ error: "Token has expired" }, { status: 400 });
        }

        // Hash the new password
        const passwordHash = await bcrypt.hash(password, 10);

        // Update the user's password
        await prisma.user.update({
            where: { email: verificationToken.identifier },
            data: { passwordHash },
        });

        // Delete the used token
        await prisma.verificationToken.delete({
            where: { token },
        });

        return NextResponse.json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
