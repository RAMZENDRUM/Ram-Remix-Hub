import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreatorDashboard } from "@/components/profile/CreatorDashboard";
import { ListenerProfile } from "@/components/profile/ListenerProfile";
import { getCreatorOverview } from "@/lib/profileOverview";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth");
    }

    // Fetch fresh user data to get latest profile updates (age, country, etc.)
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        redirect("/auth");
    }

    const role = user.role;

    if (role === "ADMIN" || role === "CREATOR") {
        const overview = await getCreatorOverview(user.id);
        return <CreatorDashboard user={user} overview={overview} />;
    }

    // normal user
    return <ListenerProfile user={user} />;
}
