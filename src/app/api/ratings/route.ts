import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const { trackId, rating, feedback } = body;

        if (!trackId || !rating) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const userId = session?.user?.email || null; // Use email as ID for now or guest

        // Check if user already rated this track (if logged in)
        if (userId) {
            const existingRating = await prisma.rating.findFirst({
                where: {
                    trackId,
                    userId,
                },
            });

            if (existingRating) {
                // Update existing rating
                const updated = await prisma.rating.update({
                    where: { id: existingRating.id },
                    data: { rating, feedback },
                });
                return NextResponse.json(updated);
            }
        }

        // Create new rating
        const newRating = await prisma.rating.create({
            data: {
                trackId,
                userId,
                rating,
                feedback,
            },
        });

        return NextResponse.json(newRating, { status: 201 });

    } catch (error) {
        console.error("Rating error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const trackId = searchParams.get("trackId");

        if (!trackId) {
            return NextResponse.json({ error: "Track ID required" }, { status: 400 });
        }

        const ratings = await prisma.rating.findMany({
            where: { trackId },
            orderBy: { createdAt: "desc" },
        });

        const count = ratings.length;
        const average = count > 0
            ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / count
            : 0;

        return NextResponse.json({
            average: parseFloat(average.toFixed(1)),
            count,
            reviews: ratings.filter(r => r.feedback),
        });

    } catch (error) {
        console.error("Fetch rating error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
