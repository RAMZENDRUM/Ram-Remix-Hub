import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLocalUserByEmail } from "@/lib/localData";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const { prisma } = await import("@/lib/prisma");
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                    profileImageUrl: true,
                }
            });

            if (user) {
                return NextResponse.json(user);
            }
        } catch (dbErr) {
            // DB offline: fallback to local/session data
        }

        const localUser = getLocalUserByEmail(session.user.email);
        return NextResponse.json({
            id: (session.user as any).id || localUser?.id || "user-id",
            name: session.user.name || localUser?.name || "Music Lover",
            email: session.user.email,
            image: session.user.image || localUser?.image || null,
            role: (session.user as any).role || localUser?.role || "LISTENER",
            profileImageUrl: null,
        });
    } catch (error) {
        console.error("Error in /api/user/me:", error);
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}
