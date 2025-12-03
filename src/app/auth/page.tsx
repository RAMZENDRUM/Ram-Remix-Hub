"use client";

import { Suspense } from "react";
import LoginCard from "@/components/auth/LoginCard";
import HolographicWave from "@/components/ui/holographic-wave";

export default function AuthPage() {
    return (
        <main className="min-h-screen text-white flex flex-col relative overflow-hidden bg-transparent">
            {/* Header */}
            <div className="absolute top-8 left-0 right-0 z-20 flex justify-center px-4 text-center">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-[#C69AFF] bg-clip-text text-transparent tracking-tight drop-shadow-[0_0_12px_rgba(198,154,255,.35)]">
                    Ram Remix Hub
                </h1>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4 px-4 lg:px-12 relative z-10 max-w-7xl mx-auto w-full mt-20 lg:mt-0">
                {/* Left: Visualizer Section */}
                <div className="relative w-full lg:w-[55%] aspect-video lg:aspect-auto lg:h-[500px] flex justify-center lg:justify-end">
                    <div className="w-full h-full max-w-2xl">
                        <HolographicWave />
                    </div>
                </div>

                {/* Right: Login Card */}
                <div className="w-full lg:w-[35%] flex justify-center lg:justify-start lg:-ml-8">
                    <Suspense fallback={<div>Loading...</div>}>
                        <LoginCard />
                    </Suspense>
                </div>
            </div>
        </main>
    );
}
