import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const tracks = await prisma.track.findMany({
            where: { isUnlisted: false },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(tracks);
    } catch (error) {
        console.error("Error fetching tracks:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
