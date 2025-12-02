import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
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

        let audioUrl = "";
        let coverImageUrl = "";

        // Handle Audio Upload
        if (audioFile && audioFile.size > 0) {
            const buffer = Buffer.from(await audioFile.arrayBuffer());
            const filename = `${Date.now()}-${audioFile.name.replace(/\s/g, '-')}`;
            const uploadDir = path.join(process.cwd(), "public/uploads/audio");

            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, filename), buffer);
            audioUrl = `/uploads/audio/${filename}`;
        }

        // Handle Cover Image Upload
        if (coverImageFile && coverImageFile.size > 0) {
            const buffer = Buffer.from(await coverImageFile.arrayBuffer());
            const filename = `${Date.now()}-${coverImageFile.name.replace(/\s/g, '-')}`;
            const uploadDir = path.join(process.cwd(), "public/uploads/covers");

            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, filename), buffer);
            coverImageUrl = `/uploads/covers/${filename}`;
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
