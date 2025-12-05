import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const likeSchema = z.object({
    trackId: z.string(),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { trackId } = likeSchema.parse(body);

        const userId = session.user.id;

        // Check if already liked
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_trackId: {
                    userId,
                    trackId
                }
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: {
                    userId_trackId: {
                        userId,
                        trackId
                    }
                }
            });
            return NextResponse.json({ liked: false });
        } else {
            // Like
            await prisma.like.create({
                data: {
                    userId,
                    trackId
                }
            });
            return NextResponse.json({ liked: true });
        }

    } catch (error) {
        console.error("Like toggle error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ likes: [] });
        }

        const likes = await prisma.like.findMany({
            where: { userId: session.user.id },
            select: { trackId: true }
        });

        return NextResponse.json({ likes: likes.map(l => l.trackId) });
    } catch (error) {
        return NextResponse.json({ likes: [] });
    }
}
