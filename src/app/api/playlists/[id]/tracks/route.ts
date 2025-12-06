import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getCurrentUserId() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
        throw new Error("Unauthorized");
    }
    if (session.user.id) return session.user.id;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("User not found");
    return user.id;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Handle ADD TRACK logic here to keep consistent
        const { id } = await params;
        const userId = await getCurrentUserId();
        const body = await req.json();
        const { trackId } = body;

        const playlist = await prisma.playlist.findUnique({
            where: { id },
            select: { ownerId: true }
        });

        if (!playlist || playlist.ownerId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.playlist.update({
            where: { id },
            data: {
                tracks: {
                    connect: { id: trackId }
                }
            }
        });

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("POST /api/playlists/[id]/tracks error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = await getCurrentUserId();
        const body = await req.json();
        const trackId: string | undefined = body?.trackId;

        if (!trackId) {
            return NextResponse.json(
                { error: "trackId required" },
                { status: 400 }
            );
        }

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

        // Implicit m-n disconnect
        await prisma.playlist.update({
            where: { id },
            data: {
                tracks: {
                    disconnect: { id: trackId }
                }
            }
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("DELETE /api/playlists/[id]/tracks error:", err);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
