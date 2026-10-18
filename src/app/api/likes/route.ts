import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isTrackLiked, toggleTrackLike } from '@/lib/localData';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email || "guest@ramremixhub.com";
        const userId = (session?.user as any)?.id || "guest-user";

        const { trackId } = await request.json();
        if (!trackId) {
            return NextResponse.json({ error: 'Track ID is required' }, { status: 400 });
        }

        try {
            const { prisma } = await import('@/lib/prisma');
            const user = await prisma.user.findUnique({
                where: { email: userEmail },
            });

            if (user) {
                const existingLike = await (prisma as any).like.findUnique({
                    where: {
                        userId_trackId: {
                            userId: user.id,
                            trackId: trackId,
                        },
                    },
                });

                if (existingLike) {
                    await (prisma as any).like.delete({
                        where: { id: existingLike.id },
                    });
                    toggleTrackLike(userId, trackId);
                    return NextResponse.json({ liked: false });
                } else {
                    await (prisma as any).like.create({
                        data: {
                            userId: user.id,
                            trackId: trackId,
                        },
                    });
                    toggleTrackLike(userId, trackId);
                    return NextResponse.json({ liked: true });
                }
            }
        } catch (dbErr) {
            // DB offline: fallback to local in-memory store
        }

        const liked = toggleTrackLike(userId, trackId);
        return NextResponse.json({ liked });
    } catch (error) {
        console.error('Error toggling like:', error);
        return NextResponse.json({ liked: true });
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
        const userId = (session?.user as any)?.id || "guest-user";
        const userEmail = session?.user?.email;

        if (userEmail) {
            try {
                const { prisma } = await import('@/lib/prisma');
                const user = await prisma.user.findUnique({
                    where: { email: userEmail },
                });

                if (user) {
                    const like = await (prisma as any).like.findUnique({
                        where: {
                            userId_trackId: {
                                userId: user.id,
                                trackId: trackId,
                            },
                        },
                    });
                    return NextResponse.json({ liked: !!like });
                }
            } catch (dbErr) {
                // DB offline
            }
        }

        const liked = isTrackLiked(userId, trackId);
        return NextResponse.json({ liked });
    } catch (error) {
        return NextResponse.json({ liked: false });
    }
}
