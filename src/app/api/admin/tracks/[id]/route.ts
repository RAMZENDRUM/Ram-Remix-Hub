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
        const formData = await req.formData();

        // Get existing track
        const existingTrack = await prisma.track.findUnique({
            where: { id },
        });

        if (!existingTrack) {
            return NextResponse.json({ error: "Track not found" }, { status: 404 });
        }

        const artist = formData.get("artist") as string;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const genre = formData.get("genre") as string;
        const type = formData.get("type") as string;
        const unlisted = formData.get("unlisted") === "true";

        const audioFile = formData.get("audioFile") as File | null;
        const coverImageFile = formData.get("coverImageFile") as File | null;

        let audioUrl = existingTrack.audioUrl;
        let coverImageUrl = existingTrack.coverImageUrl;

        // Helper to upload to Cloudinary (reused logic)
        const uploadToCloudinary = async (file: File, folder: string, resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto') => {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            return new Promise<string>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: `ram-remix-hub/${folder}`,
                        resource_type: resourceType,
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result?.secure_url || "");
                    }
                );
                uploadStream.end(buffer);
            });
        };

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

        // Handle Audio Replacement
        if (audioFile && audioFile.size > 0) {
            // Delete old audio
            await deleteFromCloudinary(existingTrack.audioUrl, 'video');
            // Upload new audio
            audioUrl = await uploadToCloudinary(audioFile, "audio", "video");
        }

        // Handle Cover Image Replacement
        if (coverImageFile && coverImageFile.size > 0) {
            // Delete old cover if exists
            if (existingTrack.coverImageUrl) {
                await deleteFromCloudinary(existingTrack.coverImageUrl, 'image');
            }
            // Upload new cover
            coverImageUrl = await uploadToCloudinary(coverImageFile, "covers", "image");
        }

        const updatedTrack = await prisma.track.update({
            where: { id },
            data: {
                title,
                artist,
                description,
                genre,
                type,
                isUnlisted: unlisted,
                audioUrl,
                coverImageUrl,
            },
        });

        return NextResponse.json({ success: true, track: updatedTrack });

    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
