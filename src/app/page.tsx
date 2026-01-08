import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/home/HomeClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PreAuthLanding from "@/components/landing/PreAuthLanding";

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return <PreAuthLanding />;
    }

    const rawTracks = await prisma.track.findMany({
      orderBy: { createdAt: 'desc' },
      // Select only fields needed for the home page to reduce payload
      select: {
        id: true,
        title: true,
        artist: true,
        coverImageUrl: true,
        isUnlisted: true,
        createdAt: true,
      }
    });

    // Serialize dates to strings to avoid passing non-serializable data to Client Components
    const tracks = rawTracks.map(track => ({
      ...track,
      createdAt: track.createdAt.toISOString()
    }));

    return <HomeClient initialRemixes={tracks} />;
  } catch (error) {
    console.error("Failed to load Home page data:", error);
    // In case of database or auth error, fallback safely
    // You might want to show an error state or the landing page
    return <PreAuthLanding />;
  }
}
