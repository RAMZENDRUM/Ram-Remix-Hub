import { NextResponse } from "next/server";
import { getLocalTracks } from "@/lib/localData";

export async function GET() {
    try {
        try {
            const { prisma } = await import("@/lib/prisma");
            const dbTracks = await prisma.track.findMany({
                where: { isUnlisted: false },
                orderBy: { createdAt: 'desc' },
            });
            if (dbTracks && dbTracks.length > 0) {
                return NextResponse.json(dbTracks);
            }
        } catch (dbErr) {
            // DB offline: fallback to bundled tracks
        }

        const localTracks = getLocalTracks();
        return NextResponse.json(localTracks);
    } catch (error) {
        console.error("Error in /api/tracks:", error);
        return NextResponse.json(getLocalTracks());
    }
}
