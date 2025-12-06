import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper to match user's requested auth
async function getCurrentUserId() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
        throw new Error("Unauthorized");
    }
    // Need user ID, session usually has it or we look it up
    if (session.user.id) return session.user.id;

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("User not found");
    return user.id;
}

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Fix for Next.js 15
) {
    try {
        const { id } = await params;
        const playlist = await prisma.playlist.findUnique({
            where: { id },
            include: {
                tracks: {
                    orderBy: {
                        createdAt: "asc" // Tracks in implicit m-n are ordered by... implicit join table or just arbitrary. 
                        // Prisma implicit m-n doesn't support 'addedAt'.
                        // We will sort by track creation for now, or arbitrary.
                        // Ideally we'd use explicitly defined Relation Table for sort order.
                    }
                },
                owner: true,
            },
        });

        if (!playlist) {
            return NextResponse.json(
                { error: "Playlist not found" },
                { status: 404 }
            );
        }

        const currentUserId = await getCurrentUserId().catch(() => null);

        const payload = {
            id: playlist.id,
            name: playlist.name,
            coverUrl: playlist.coverUrl || playlist.tracks[0]?.coverImageUrl || null,
            ownerName: playlist.owner?.name ?? "Unknown",
            isOwner: currentUserId === playlist.ownerId,
            tracks: playlist.tracks.map((track) => ({
                id: track.id,
                title: track.title,
                artist: track.artist ?? "Unknown",
                // Implicit m-n: we don't have addedAt. Use track created date.
                addedAt: track.createdAt.toISOString(),
                // Add required fields
                coverImageUrl: track.coverImageUrl,
                audioUrl: track.audioUrl
            })),
        };

        return NextResponse.json(payload);
    } catch (err) {
        console.error("GET /api/playlists/[id] error:", err);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = await getCurrentUserId();

        const playlist = await prisma.playlist.findUnique({
            where: { id },
            select: { ownerId: true },
        });

        if (!playlist || playlist.ownerId !== userId) {
            return NextResponse.json(
                { error: "Not allowed" },
                { status: 403 }
            );
        }

        // Implicit m-n handles relation cleanup mostly, but we trigger delete
        await prisma.playlist.delete({
            where: { id },
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("DELETE /api/playlists/[id] error:", err);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
