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
        const { displayName, age, country, favoriteGenres } = body;

        // Basic validation
        if (!displayName || displayName.trim() === "") {
            return new NextResponse("Display name is required", { status: 400 });
        }

        if (age && (age < 13 || age > 120)) {
            return new NextResponse("Invalid age", { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                name: displayName,
                age: age ? parseInt(age) : null,
                country: country,
                favoriteGenres: favoriteGenres,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("[PROFILE_UPDATE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
