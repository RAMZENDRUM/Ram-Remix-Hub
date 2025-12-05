import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        console.log("[PROFILE_UPDATE] Request body:", body);
        const { displayName, age, country, favoriteGenres, profileImageUrl } = body;

        // Basic validation
        if (!displayName || displayName.trim() === "") {
            return new NextResponse("Display name is required", { status: 400 });
        }

        if (age && (age < 3 || age > 120)) {
            return new NextResponse("Invalid age (must be 3+)", { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!existingUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Use raw SQL to bypass stale Prisma Client types (dev server lock prevents regeneration)
        const now = new Date();
        const genresJson = favoriteGenres ? JSON.stringify(favoriteGenres) : null;
        const ageVal = age !== null && age !== undefined ? parseInt(String(age)) : null;

        await prisma.$executeRaw`
            UPDATE "User" 
            SET "name" = ${displayName}, 
                "age" = ${ageVal}, 
                "country" = ${country}, 
                "favoriteGenres" = ${genresJson}, 
                "profileImageUrl" = ${profileImageUrl}, 
                "image" = ${profileImageUrl || null},
                "updatedAt" = ${now}
            WHERE "id" = ${session.user.id}
        `;

        // Fetch the updated user to return
        const updatedUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("[PROFILE_UPDATE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        await prisma.user.delete({
            where: { id: session.user.id },
        });

        return new NextResponse("User deleted", { status: 200 });
    } catch (error) {
        console.error("[PROFILE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
