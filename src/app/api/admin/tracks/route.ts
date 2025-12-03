import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import cloudinary from "@/lib/cloudinary";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.email !== 'ramzendrum@gmail.com') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tracks = await prisma.track.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(tracks);
    } catch (error) {
        console.error("Fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.email !== 'ramzendrum@gmail.com') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const artist = formData.get("artist") as string;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const genre = formData.get("genre") as string;
        const type = formData.get("type") as string;
        const unlisted = formData.get("unlisted") === "true";

        const audioFile = formData.get("audioFile") as File | null;
        const coverImageFile = formData.get("coverImageFile") as File | null;

        if (!title || !description || !artist || !genre || !audioFile) {
            return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
        }

        // Helper to upload to Cloudinary
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
                        if (error) {
                            console.error("Cloudinary upload error:", error);
                            reject(error);
                        } else {
                            resolve(result?.secure_url || "");
                        }
                    }
                );
                uploadStream.end(buffer);
            });
        };

        let audioUrl = "";
        let coverImageUrl = "";

        // Upload Audio
        if (audioFile && audioFile.size > 0) {
            audioUrl = await uploadToCloudinary(audioFile, "audio", "video"); // 'video' handles audio in Cloudinary
        }

        // Upload Cover Image
        if (coverImageFile && coverImageFile.size > 0) {
            coverImageUrl = await uploadToCloudinary(coverImageFile, "covers", "image");
        }

        const track = await prisma.track.create({
            data: {
                title,
                artist,
                description,
                genre,
                type,
                isUnlisted: unlisted,
                audioUrl,
                coverImageUrl: coverImageUrl || null,
            },
        });

        return NextResponse.json({ success: true, track }, { status: 201 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
