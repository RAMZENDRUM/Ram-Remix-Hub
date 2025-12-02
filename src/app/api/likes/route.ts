import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Assuming authOptions is exported from here

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { trackId } = await request.json();
        if (!trackId) {
            return NextResponse.json({ error: 'Track ID is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if already liked
        // Using 'any' cast because Prisma Client might not be regenerated yet
        const existingLike = await (prisma as any).like.findUnique({
            where: {
                userId_trackId: {
                    userId: user.id,
                    trackId: trackId,
                },
            },
        });

        if (existingLike) {
            // Unlike
            await (prisma as any).like.delete({
                where: {
                    id: existingLike.id,
                },
            });
            return NextResponse.json({ liked: false });
        } else {
            // Like
            await (prisma as any).like.create({
                data: {
                    userId: user.id,
                    trackId: trackId,
                },
            });
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const trackId = searchParams.get('trackId');

        if (!trackId) {
            return NextResponse.json({ error: 'Track ID is required' }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ liked: false });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ liked: false });
        }

        const like = await (prisma as any).like.findUnique({
            where: {
                userId_trackId: {
                    userId: user.id,
                    trackId: trackId,
                },
            },
        });

        return NextResponse.json({ liked: !!like });
    } catch (error) {
        console.error('Error checking like status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
