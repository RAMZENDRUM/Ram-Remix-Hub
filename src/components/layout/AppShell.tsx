"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { SiteFooter } from "@/components/layout/footer";
import GlobalPlayer from "@/components/player/GlobalPlayer";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { status } = useSession();

    // Hide navbar/footer on /auth, and on / (home) if not authenticated
    const isAuthPage = pathname === "/auth";
    const isLandingPage = pathname === "/" && status === "unauthenticated";
    const isPublic = isAuthPage || isLandingPage;

    if (isPublic) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar />
            <main style={{ minHeight: '100vh', paddingTop: '64px', paddingBottom: '100px' }}>
                {children}
            </main>
            <GlobalPlayer />
            <SiteFooter />
        </>
    );
}
