import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        console.log("[UPLOAD_SIGN] Request body:", body);
        const { folder } = body;

        // Security: Only allow uploads to specific folders for users
        if (!folder || !folder.startsWith('ram-remix-hub/avatars')) {
            return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
        }

        const timestamp = Math.round((new Date).getTime() / 1000);

        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            folder: folder,
        }, cloudinary.config().api_secret!);

        const response = {
            timestamp,
            signature,
            cloudName: cloudinary.config().cloud_name,
            apiKey: cloudinary.config().api_key
        };
        console.log("[UPLOAD_SIGN] Response:", response);
        return NextResponse.json(response);
    } catch (error) {
        console.error("Signature error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
