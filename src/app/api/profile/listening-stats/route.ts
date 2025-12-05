import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ tracks: [] }, { status: 401 });
        }

        const userId = session.user.id;

        // 1. Fetch Likes (Source of Truth for Favorites)
        const likes = await prisma.like.findMany({
            where: { userId },
            include: { track: true },
            orderBy: { createdAt: 'desc' }
        });

        // 2. Fetch Stats (Source of Truth for History)
        // Using explicit cast to avoid build errors if Prisma client types are stale due to file locking
        let stats: any[] = [];
        try {
            if ((prisma as any).userTrackStat) {
                stats = await (prisma as any).userTrackStat.findMany({
                    where: { userId },
                    include: { track: true }
                });
            }
        } catch (e) {
            console.warn("Stats table likely missing or client not generated", e);
        }

        const trackMap = new Map<string, any>();

        // Process Likes
        for (const l of likes) {
            trackMap.set(l.trackId, {
                trackId: l.track.id,
                title: l.track.title,
                artist: l.track.artist || "Ram",
                coverUrl: l.track.coverImageUrl,
                isFavorite: true,
                totalPlayTimeMs: 0,
                lastPlayedAt: null // Decoupled: Likes do not imply play history
            });
        }

        // Process History (Merge/Overwrite)
        for (const s of stats) {
            const existing = trackMap.get(s.trackId);
            if (existing) {
                // Update existing liked track with real stats
                existing.totalPlayTimeMs = s.totalPlayTimeMs;
                existing.lastPlayedAt = s.lastPlayedAt.toISOString();
            } else {
                // Add unliked track found in history
                trackMap.set(s.trackId, {
                    trackId: s.track.id,
                    title: s.track.title,
                    artist: s.track.artist || "Ram",
                    coverUrl: s.track.coverImageUrl,
                    isFavorite: false,
                    totalPlayTimeMs: s.totalPlayTimeMs,
                    lastPlayedAt: s.lastPlayedAt.toISOString()
                });
            }
        }

        const tracks = Array.from(trackMap.values());
        return NextResponse.json({ tracks });

    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
