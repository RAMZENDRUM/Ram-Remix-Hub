import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const track = await prisma.track.findUnique({
            where: { id },
        });

        if (!track) {
            return NextResponse.json({ error: "Track not found" }, { status: 404 });
        }

        return NextResponse.json(track);
    } catch (error) {
        console.error("Error fetching track:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
