import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/home/HomeClient";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const tracks = await prisma.track.findMany({
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

  return <HomeClient initialRemixes={tracks} />;
}
