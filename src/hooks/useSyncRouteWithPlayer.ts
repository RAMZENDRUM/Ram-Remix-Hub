import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePlayer } from "@/context/PlayerContext";

export function useSyncRouteWithPlayer() {
    const router = useRouter();
    const pathname = usePathname();
    const { currentTrack } = usePlayer();

    useEffect(() => {
        if (!currentTrack) return;

        // only do this on `/remix/...` pages
        if (!pathname.startsWith("/remix")) return;

        // If we are already on the correct page, do nothing
        if (pathname === `/remix/${currentTrack.id}`) return;

        router.replace(`/remix/${currentTrack.id}`);
    }, [currentTrack?.id, pathname, router]);
}
