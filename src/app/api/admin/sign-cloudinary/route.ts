import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.email !== 'ramzendrum@gmail.com') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { folder } = body;

        const timestamp = Math.round((new Date).getTime() / 1000);

        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            folder: folder,
        }, cloudinary.config().api_secret!);

        return NextResponse.json({
            timestamp,
            signature,
            cloudName: cloudinary.config().cloud_name,
            apiKey: cloudinary.config().api_key
        });
    } catch (error) {
        console.error("Signature error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
