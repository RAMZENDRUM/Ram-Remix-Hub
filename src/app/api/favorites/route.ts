import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    // @ts-ignore - session.user.id is injected but types might fail in CI
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { trackId } = await req.json();

    if (!trackId) {
        return NextResponse.json({ error: "trackId is required" }, { status: 400 });
    }

    // Check if already favourite
    const existing = await prisma.like.findFirst({
        where: {
            userId: userId,
            trackId,
        },
    });

    let isFavorite = false;

    if (existing) {
        // remove
        await prisma.like.delete({ where: { id: existing.id } });
        isFavorite = false;
    } else {
        // add
        await prisma.like.create({
            data: {
                userId: userId,
                trackId,
            },
        });
        isFavorite = true;
    }

    return NextResponse.json({ isFavorite });
}
