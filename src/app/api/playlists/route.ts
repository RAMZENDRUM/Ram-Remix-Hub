import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    try {
        // 1. Fetch Curated (Admin) Playlists
        const curatedPlaylists = await prisma.playlist.findMany({
            where: { isCurated: true },
            include: {
                tracks: {
                    select: { id: true, coverImageUrl: true }
                },
                _count: {
                    select: { tracks: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 2. Fetch User Playlists (if logged in)
        let userPlaylists: any[] = [];
        if (session && session.user && session.user.email) {
            userPlaylists = await prisma.playlist.findMany({
                where: {
                    owner: { email: session.user.email },
                    isCurated: false
                },
                include: {
                    tracks: {
                        select: { id: true, coverImageUrl: true }
                    },
                    _count: {
                        select: { tracks: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        // Transform to simplified interface
        const transform = (pl: any) => ({
            id: pl.id,
            name: pl.name,
            count: pl._count.tracks,
            cover: pl.coverUrl || (pl.tracks[0]?.coverImageUrl) || null,
            isCurated: pl.isCurated
        });

        return NextResponse.json({
            curated: curatedPlaylists.map(transform),
            user: userPlaylists.map(transform)
        });

    } catch (error) {
        console.error("Failed to fetch playlists", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name } = body;

        console.log("Create Playlist Request:", { email: session.user.email, name });

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const playlist = await prisma.playlist.create({
            data: {
                name,
                ownerId: user.id,
                isCurated: false,
            }
        });

        console.log("Playlist Created:", playlist.id);

        return NextResponse.json(playlist);

    } catch (error: any) {
        console.error("Failed to create playlist ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
