import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreatorDashboard } from "@/components/profile/CreatorDashboard";
import { ListenerProfile } from "@/components/profile/ListenerProfile";
import Link from "next/link";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth");
    }

    // TODO: Replace this with actual role from DB when available
    // const role = (session.user as any).role ?? "listener";
    let role = "listener";
    if (session.user?.email === 'ramzendrum@gmail.com') {
        role = "admin";
    }

    if (role === "admin" || role === "creator") {
        return <CreatorDashboard user={session.user} />;
    }

    // normal user
    return <ListenerProfile user={session.user} />;
}
