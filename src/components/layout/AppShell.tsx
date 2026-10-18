"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { SiteFooter } from "@/components/layout/footer";
import GlobalPlayer from "@/components/player/GlobalPlayer";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Only hide navbar & footer on /auth page
    const isAuthPage = pathname === "/auth";

    if (isAuthPage) {
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
