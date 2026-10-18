import HomeClient from "@/components/home/HomeClient";
import { getLocalTracks } from "@/lib/localData";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let tracks: any[] = [];

  // Try Prisma first if database is available
  try {
    const { prisma } = await import("@/lib/prisma");
    const rawTracks = await prisma.track.findMany({
      orderBy: { createdAt: 'desc' },
      where: { isUnlisted: false },
      select: {
        id: true,
        title: true,
        artist: true,
        coverImageUrl: true,
        isUnlisted: true,
        createdAt: true,
      }
    });

    if (rawTracks && rawTracks.length > 0) {
      tracks = rawTracks.map(track => ({
        ...track,
        createdAt: track.createdAt.toISOString()
      }));
    }
  } catch (error) {
    // Database offline: safe silent fallback to bundled data
  }

  // Fallback to bundled local track data (runs anywhere without DB or laptop running)
  if (tracks.length === 0) {
    tracks = getLocalTracks().map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      coverImageUrl: track.coverImageUrl,
      isUnlisted: !!track.isUnlisted,
      createdAt: track.createdAt,
    }));
  }

  return <HomeClient initialRemixes={tracks} />;
}
