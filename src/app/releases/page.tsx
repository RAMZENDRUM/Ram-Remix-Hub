import { ReleaseList } from "@/components/releases/ReleaseList";
import { getLocalTracks } from "@/lib/localData";

export const dynamic = 'force-dynamic';

export default async function ReleasesPage() {
    let tracks: any[] = [];

    try {
        const { prisma } = await import("@/lib/prisma");
        const rawTracks = await prisma.track.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                ratings: {
                    select: { rating: true }
                }
            }
        });

        if (rawTracks && rawTracks.length > 0) {
            tracks = rawTracks.map(track => ({
                ...track,
                createdAt: track.createdAt.toISOString()
            }));
        }
    } catch (error) {
        // DB offline: fallback to bundled tracks
    }

    if (tracks.length === 0) {
        tracks = getLocalTracks().map(track => ({
            ...track,
            ratings: [],
        }));
    }

    return (
        <div className="min-h-screen bg-black text-white pt-20 pb-20">
            <ReleaseList initialTracks={tracks} />
        </div>
    );
}
