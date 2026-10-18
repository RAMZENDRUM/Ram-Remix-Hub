import { NextResponse } from "next/server";
import { getLocalTrackById } from "@/lib/localData";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        try {
            const { prisma } = await import("@/lib/prisma");
            const track = await prisma.track.findUnique({
                where: { id },
            });

            if (track) {
                return NextResponse.json({
                    ...track,
                    createdAt: track.createdAt.toISOString(),
                    updatedAt: track.updatedAt.toISOString(),
                });
            }
        } catch (dbErr) {
            // DB offline: fallback to bundled tracks
        }

        const localTrack = getLocalTrackById(id);
        if (!localTrack) {
            return NextResponse.json({ error: "Track not found" }, { status: 404 });
        }

        return NextResponse.json(localTrack);
    } catch (error) {
        console.error("Error fetching track:", error);
        return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }
}
