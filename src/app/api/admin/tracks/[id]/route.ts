import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.email !== 'ramzendrum@gmail.com') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // 1. Find the track to get the URLs
        const track = await prisma.track.findUnique({
            where: { id },
        });

        if (!track) {
            return NextResponse.json({ error: "Track not found" }, { status: 404 });
        }

        // 2. Helper to extract public_id from Cloudinary URL
        const deleteFromCloudinary = async (url: string, resourceType: 'image' | 'video') => {
            if (!url.includes('cloudinary.com')) return;

            try {
                // Example URL: https://res.cloudinary.com/demo/video/upload/v12345678/ram-remix-hub/audio/filename.mp3
                // We need: ram-remix-hub/audio/filename
                const parts = url.split('/');
                const filenameWithExt = parts[parts.length - 1];
                const folderPath = parts.slice(parts.indexOf('ram-remix-hub'), parts.length - 1).join('/');
                const filename = filenameWithExt.split('.')[0];
                const publicId = `${folderPath}/${filename}`;

                await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
            } catch (err) {
                console.error(`Failed to delete ${resourceType} from Cloudinary:`, err);
            }
        };

        // 3. Delete Audio (stored as 'video' in Cloudinary)
        if (track.audioUrl) {
            await deleteFromCloudinary(track.audioUrl, 'video');
        }

        // 4. Delete Cover Image
        if (track.coverImageUrl) {
            await deleteFromCloudinary(track.coverImageUrl, 'image');
        }

        // 5. Delete from Database
        await prisma.track.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.email !== 'ramzendrum@gmail.com') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        // Get existing track
        const existingTrack = await prisma.track.findUnique({
            where: { id },
        });

        if (!existingTrack) {
            return NextResponse.json({ error: "Track not found" }, { status: 404 });
        }

        const {
            artist,
            title,
            description,
            genre,
            type,
            unlisted,
            audioUrl,       // New URL or null
            coverImageUrl   // New URL or null
        } = body;

        // Helper to delete from Cloudinary
        const deleteFromCloudinary = async (url: string, resourceType: 'image' | 'video') => {
            if (!url || !url.includes('cloudinary.com')) return;
            try {
                const parts = url.split('/');
                const filenameWithExt = parts[parts.length - 1];
                const folderPath = parts.slice(parts.indexOf('ram-remix-hub'), parts.length - 1).join('/');
                const filename = filenameWithExt.split('.')[0];
                const publicId = `${folderPath}/${filename}`;
                await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
            } catch (err) {
                console.error(`Failed to delete old ${resourceType}:`, err);
            }
        };

        let finalAudioUrl = existingTrack.audioUrl;
        let finalCoverImageUrl = existingTrack.coverImageUrl;

        // Handle Audio Replacement
        if (audioUrl) {
            // Delete old audio if it exists and is different
            if (existingTrack.audioUrl && existingTrack.audioUrl !== audioUrl) {
                await deleteFromCloudinary(existingTrack.audioUrl, 'video');
            }
            finalAudioUrl = audioUrl;
        }

        // Handle Cover Image Replacement
        if (coverImageUrl) {
            // Delete old cover if exists and is different
            if (existingTrack.coverImageUrl && existingTrack.coverImageUrl !== coverImageUrl) {
                await deleteFromCloudinary(existingTrack.coverImageUrl, 'image');
            }
            finalCoverImageUrl = coverImageUrl;
        }

        const updatedTrack = await prisma.track.update({
            where: { id },
            data: {
                title,
                artist,
                description,
                genre,
                type,
                isUnlisted: Boolean(unlisted),
                audioUrl: finalAudioUrl,
                coverImageUrl: finalCoverImageUrl,
            },
        });

        return NextResponse.json({ success: true, track: updatedTrack });

    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
