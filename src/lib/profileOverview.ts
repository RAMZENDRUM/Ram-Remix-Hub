import { getAllLocalTracks } from "@/lib/localData";

export async function getCreatorOverview(userId: string) {
    let tracks: any[] = [];

    try {
        const { prisma } = await import("@/lib/prisma");
        const dbTracks = await prisma.track.findMany({
            select: {
                id: true,
                title: true,
                artist: true,
                coverImageUrl: true,
                ratings: { select: { rating: true } },
            },
        });
        if (dbTracks && dbTracks.length > 0) {
            tracks = dbTracks;
        }
    } catch (e) {
        // DB offline: fallback to bundled tracks
    }

    if (tracks.length === 0) {
        tracks = getAllLocalTracks().map(t => ({
            id: t.id,
            title: t.title,
            artist: t.artist,
            coverImageUrl: t.coverImageUrl,
            ratings: [],
        }));
    }

    // Mocking plays/downloads for creator insights
    const tracksWithStats = tracks.map(t => ({
        ...t,
        plays: Math.floor(Math.random() * 5000),
        downloads: Math.floor(Math.random() * 1000),
    }));

    const totalReleases = tracks.length;
    const totalPlays = tracksWithStats.reduce((sum, t) => sum + t.plays, 0);
    const totalDownloads = tracksWithStats.reduce((sum, t) => sum + t.downloads, 0);

    const allRatings = tracks.flatMap((t) => (t.ratings || []).map((r: any) => r.rating));
    const avgRating =
        allRatings.length === 0
            ? null
            : allRatings.reduce((s, v) => s + v, 0) / allRatings.length;

    const topTracks = [...tracksWithStats]
        .sort((a, b) => b.plays - a.plays)
        .slice(0, 3)
        .map((t) => ({
            id: t.id,
            title: t.title,
            artistName: t.artist,
            coverUrl: t.coverImageUrl,
            plays: t.plays,
            downloads: t.downloads,
            avgRating:
                (t.ratings || []).length === 0
                    ? null
                    : t.ratings.reduce((s: number, r: any) => s + r.rating, 0) / t.ratings.length,
        }));

    return {
        stats: {
            totalReleases,
            totalPlays,
            totalDownloads,
            avgRating,
        },
        topTracks,
    };
}
