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

import { Inter, Outfit, Zen_Dots } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const zenDots = Zen_Dots({ weight: "400", subsets: ["latin"], variable: "--font-zen-dots" });

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { LanguageProvider } from "@/context/LanguageContext";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} ${outfit.variable} ${zenDots.variable} bg-black text-white relative`}>
        <div className="relative z-10 min-h-screen bg-[#05060D]">
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
