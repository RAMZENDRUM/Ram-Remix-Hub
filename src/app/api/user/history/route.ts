import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const historySchema = z.object({
    trackId: z.string(),
    durationMs: z.number().optional().default(180000),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            // Silently fail for guests
            return NextResponse.json({ ok: true });
        }

        const body = await req.json();
        const { trackId, durationMs } = historySchema.parse(body);
        const userId = session.user.id;

        // Check for stale client to avoid crash
        if (!(prisma as any).userTrackStat) {
            console.error("UserTrackStat model missing in Prisma Client. Please run `npx prisma generate` and restart server.");
            return NextResponse.json({ ok: false, error: "DB_SYNC_REQUIRED" }, { status: 503 });
        }

        // Upsert stats
        await prisma.userTrackStat.upsert({
            where: {
                userId_trackId: {
                    userId,
                    trackId
                }
            },
            create: {
                userId,
                trackId,
                playCount: 1,
                lastPlayedAt: new Date(),
                totalPlayTimeMs: durationMs
            },
            update: {
                playCount: { increment: 1 },
                lastPlayedAt: new Date(),
                totalPlayTimeMs: { increment: durationMs }
            }
        });

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("History sync error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
