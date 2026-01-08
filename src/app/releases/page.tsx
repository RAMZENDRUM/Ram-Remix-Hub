import { prisma } from "@/lib/prisma";
import { ReleaseList } from "@/components/releases/ReleaseList";

export const dynamic = 'force-dynamic';

export default async function ReleasesPage() {
    try {
        const rawTracks = await prisma.track.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                ratings: {
                    select: { rating: true }
                }
            }
        });

        // Serialize dates
        const tracks = rawTracks.map(track => ({
            ...track,
            createdAt: track.createdAt.toISOString()
        }));

        return (
            <div className="min-h-screen bg-black text-white pt-20 pb-20">
                <ReleaseList initialTracks={tracks} />
            </div>
        );
    } catch (error) {
        console.error("Failed to load Releases:", error);
        return (
            <div className="min-h-screen bg-black text-white pt-20 pb-20 flex items-center justify-center">
                <p className="text-neutral-400">Unable to load releases. Please try again later.</p>
            </div>
        );
    }
}
