import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/providers/SessionProvider";
import { SiteFooter } from "@/components/layout/footer";
import GlobalPlayer from "@/components/player/GlobalPlayer";
import { PlayerProvider } from "@/context/PlayerContext";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "Ram Remix Hub",
  description: "Experience the Sound of Future",
};

import AnoAI from "@/components/AnoAI";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { GlobalSpotlight } from "@/components/ui/global-spotlight";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white relative`}>
        <GlobalSpotlight />
        <AnoAI />
        <div className="relative z-10">
          <Providers>
            <PlayerProvider>
              <ToastProvider>
                {session && <Navbar />}
                <main style={{ minHeight: '100vh', paddingTop: '64px', paddingBottom: '100px' }}>
                  {children}
                </main>
                {session && <GlobalPlayer />}
                <SiteFooter />
              </ToastProvider>
            </PlayerProvider>
          </Providers>
        </div>
      </body>
    </html>
  );
}
