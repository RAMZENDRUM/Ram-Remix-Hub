import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/providers/SessionProvider";
import { SiteFooter } from "@/components/layout/footer";
import { PlayerProvider } from "@/context/PlayerContext";
import { ToastProvider } from "@/context/ToastContext";
import { UserProvider } from "@/context/UserContext";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Ram Remix Hub",
  description: "Experience the Sound of Future",
};

import AnoAI from "@/components/AnoAI";

import { Inter, Outfit } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";



import { RainBackground } from "@/components/ui/rain-background";


import { LanguageProvider } from "@/context/LanguageContext";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} ${outfit.variable} bg-black text-white relative`}>
        <RainBackground
          intensity={100}
          speed={0.2}
          angle={10}
          color="rgba(174, 194, 224, 0.6)"
          dropSize={{ min: 1, max: 2 }}
          lightningEnabled={false}
          thunderEnabled={false}
          className="fixed inset-0 pointer-events-none z-[-1]"
        />

        <AnoAI />
        <div className="relative z-10">
          <Providers>
            <UserProvider>
              <PlayerProvider>
                <ToastProvider>
                  <LanguageProvider>
                    <AppShell>
                      {children}
                    </AppShell>
                  </LanguageProvider>
                </ToastProvider>
              </PlayerProvider>
            </UserProvider>
          </Providers>
        </div>
      </body>
    </html>
  );
}
