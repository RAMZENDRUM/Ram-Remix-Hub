import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch liked tracks
        // We need to use 'any' for now if types aren't fully generated, but ideally we shouldn't.
        // Assuming the relation 'likes' exists on User as defined in previous steps.
        const likedTracks = await (prisma as any).like.findMany({
            where: {
                userId: user.id,
            },
            include: {
                track: true, // Include the track details
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Map to a cleaner format if needed
        const tracks = likedTracks.map((like: any) => like.track);

        return NextResponse.json(tracks);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
