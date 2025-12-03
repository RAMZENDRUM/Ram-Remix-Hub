import { prisma } from "@/lib/prisma";

export async function getCreatorOverview(userId: string) {
    // All tracks by this uploader
    const tracks = await prisma.track.findMany({
        where: {
            // Assuming 'artist' field is used for now as uploaderId might not be fully implemented in Track model yet
            // If uploaderId exists, use that. Based on schema, Track doesn't have uploaderId yet.
            // We will assume for now that we want to fetch all tracks. 
            // TODO: Add uploaderId to Track model to filter by user.
        },
        select: {
            id: true,
            title: true,
            artist: true,
            coverImageUrl: true,
            // plays: true, // Track model doesn't have plays yet
            // downloads: true, // Track model doesn't have downloads yet
            ratings: { select: { rating: true } }, // Rating model has 'rating' field, not 'value'
        },
    });

    // Mocking plays/downloads since they aren't in schema yet
    const tracksWithStats = tracks.map(t => ({
        ...t,
        plays: Math.floor(Math.random() * 5000),
        downloads: Math.floor(Math.random() * 1000),
    }));

    const totalReleases = tracks.length;
    const totalPlays = tracksWithStats.reduce((sum, t) => sum + t.plays, 0);
    const totalDownloads = tracksWithStats.reduce((sum, t) => sum + t.downloads, 0);

    const allRatings = tracks.flatMap((t) => t.ratings.map((r) => r.rating));
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
                t.ratings.length === 0
                    ? null
                    : t.ratings.reduce((s, r) => s + r.rating, 0) / t.ratings.length,
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
