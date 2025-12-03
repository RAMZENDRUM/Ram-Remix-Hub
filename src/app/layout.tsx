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

import { RainBackground } from "@/components/ui/rain-background";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white relative`}>
        <RainBackground
          intensity={50}
          speed={0.2}
          angle={0}
          color="rgba(255, 255, 255, 0.1)"
          dropSize={{ min: 1, max: 2 }}
          lightningEnabled={false}
          lightningFrequency={0}
          thunderEnabled={false}
          thunderVolume={0}
          thunderDelay={0}
          className="fixed inset-0 pointer-events-none z-[-1]"
        />
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
