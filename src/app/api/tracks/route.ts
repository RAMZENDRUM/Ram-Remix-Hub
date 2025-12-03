import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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
