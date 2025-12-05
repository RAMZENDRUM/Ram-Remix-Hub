import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/home/HomeClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PreAuthLanding from "@/components/landing/PreAuthLanding";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <PreAuthLanding />;
  }

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
