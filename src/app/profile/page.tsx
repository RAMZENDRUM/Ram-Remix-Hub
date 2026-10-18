import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreatorDashboard } from "@/components/profile/CreatorDashboard";
import { ListenerProfile } from "@/components/profile/ListenerProfile";
import { getCreatorOverview } from "@/lib/profileOverview";
import { getLocalUserByEmail } from "@/lib/localData";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/auth");
    }

    let user: any = null;

    // Try DB if available
    try {
        const { prisma } = await import("@/lib/prisma");
        if (session.user.email) {
            user = await prisma.user.findUnique({
                where: { email: session.user.email },
            });
        }
    } catch (e) {
        // DB offline
    }

    // Fallback to local user or session data
    if (!user && session.user.email) {
        user = getLocalUserByEmail(session.user.email);
    }

    if (!user) {
        user = {
            id: (session.user as any).id || "user-session-id",
            name: session.user.name || "Music Lover",
            email: session.user.email,
            role: (session.user as any).role || "LISTENER",
            image: session.user.image || null,
            favoriteGenres: [],
        };
    }

    const role = user.role || "LISTENER";
    let parsedUser = { ...user };

    if (parsedUser.createdAt && typeof parsedUser.createdAt !== 'string') {
        parsedUser.createdAt = parsedUser.createdAt.toISOString();
    }
    if (parsedUser.updatedAt && typeof parsedUser.updatedAt !== 'string') {
        parsedUser.updatedAt = parsedUser.updatedAt.toISOString();
    }

    if (typeof user.favoriteGenres === 'string') {
        try {
            parsedUser.favoriteGenres = JSON.parse(user.favoriteGenres);
        } catch (e) {
            parsedUser.favoriteGenres = [];
        }
    } else if (!user.favoriteGenres) {
        parsedUser.favoriteGenres = [];
    }

    if (role === "ADMIN" || role === "CREATOR") {
        const overview = await getCreatorOverview(user.id);
        return <CreatorDashboard user={parsedUser} overview={overview} />;
    }

    return <ListenerProfile user={parsedUser} />;
}
