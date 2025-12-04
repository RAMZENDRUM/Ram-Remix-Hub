import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreatorDashboard } from "@/components/profile/CreatorDashboard";
import { ListenerProfile } from "@/components/profile/ListenerProfile";
import { getCreatorOverview } from "@/lib/profileOverview";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        redirect("/auth");
    }

    // Fetch fresh user data to get latest profile updates (age, country, etc.)
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        redirect("/auth");
    }

    const role = (user as any).role;

    // Parse favoriteGenres if it's a string (JSON)
    let parsedUser = { ...user } as any;
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

    // normal user
    return <ListenerProfile user={parsedUser} />;
}
