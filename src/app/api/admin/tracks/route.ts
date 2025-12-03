import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import cloudinary from "@/lib/cloudinary";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.email !== 'ramzendrum@gmail.com') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tracks = await prisma.track.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(tracks);
    } catch (error) {
        console.error("Fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.email !== 'ramzendrum@gmail.com') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            artist,
            title,
            description,
            genre,
            type,
            unlisted,
            audioUrl,
            coverImageUrl
        } = body;

        if (!title || !description || !artist || !genre || !audioUrl) {
            return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
        }

        const track = await prisma.track.create({
            data: {
                title,
                artist,
                description,
                genre,
                type,
                isUnlisted: Boolean(unlisted),
                audioUrl,
                coverImageUrl: coverImageUrl || null,
            },
        });

        return NextResponse.json({ success: true, track }, { status: 201 });
    } catch (error) {
        console.error("Create track error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
