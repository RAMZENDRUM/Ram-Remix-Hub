import { prisma } from "@/lib/prisma";
import { ReleaseList } from "@/components/releases/ReleaseList";

export const dynamic = 'force-dynamic';

export default async function ReleasesPage() {
    const tracks = await prisma.track.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            ratings: {
                select: { rating: true }
            }
        }
    });

    return (
        <div className="min-h-screen bg-black text-white pt-20 pb-20">
            <ReleaseList initialTracks={tracks} />
        </div>
    );
}
