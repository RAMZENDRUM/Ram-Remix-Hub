import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getLocalUserByEmail, addLocalUser } from "@/lib/localData";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if exists in local bundled data
        if (getLocalUserByEmail(normalizedEmail)) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Try Prisma if available
        try {
            const { prisma } = await import("@/lib/prisma");
            const existingUser = await prisma.user.findUnique({
                where: { email: normalizedEmail },
            });

            if (existingUser) {
                return NextResponse.json(
                    { error: "User already exists" },
                    { status: 400 }
                );
            }

            const user = await prisma.user.create({
                data: {
                    name,
                    email: normalizedEmail,
                    passwordHash,
                },
            });

            // Also mirror in local store
            addLocalUser({ name, email: normalizedEmail, passwordHash });

            return NextResponse.json(
                { message: "User created successfully", user: { id: user.id, email: user.email } },
                { status: 201 }
            );
        } catch (dbErr) {
            // DB offline: save directly to local user store
            const user = addLocalUser({ name, email: normalizedEmail, passwordHash });
            return NextResponse.json(
                { message: "User created successfully", user: { id: user.id, email: user.email } },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Registration failed" },
            { status: 500 }
        );
    }
}
