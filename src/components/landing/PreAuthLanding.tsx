"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { BrandLogo } from "@/components/BrandLogo";
import ShaderBackground from "@/components/ShaderBackground";
import ShinyButton from "@/components/ui/ShinyButton";

const PreAuthLanding: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl");

    const { data: session, status } = useSession();

    // If logic is handled in Parent (page.tsx), we might not need this useEffect redirect here.
    // But for safety, if this component is mounted and user becomes auth, we redirect.
    useEffect(() => {
        if (status === "authenticated") {
            window.location.reload();
        }
    }, [status]);

    const handleLoginClick = () => {
        if (callbackUrl) {
            router.push(`/auth?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        } else {
            router.push("/auth");
        }
    };

    if (status === "authenticated") {
        return null; // Parent should show Home
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Animated WebGL background */}
            <ShaderBackground />

            {/* Content layer */}
            <div className="relative z-10 flex min-h-screen flex-col items-center">
                {/* LOGO + TITLE – top centre */}
                <div className="mt-14 flex flex-col items-center gap-6 text-center">
                    <div className="scale-125 origin-top">
                        <BrandLogo variant="hero" />
                    </div>

                    <p className="max-w-md text-xs sm:text-sm text-slate-200/70 font-medium tracking-wide">
                        Sign in to unlock your personal remixes, playlists, and a premium
                        listening experience.
                    </p>
                </div>

                {/* LOGIN BUTTON – slightly below centre */}
                <div className="flex flex-1 items-center justify-center">
                    <div className="relative top-10">
                        <button
                            onClick={handleLoginClick}
                            className="
                                group relative px-8 py-2.5 rounded-full 
                                bg-white/5 backdrop-blur-md
                                border border-white/20
                                transition-all duration-300 ease-out
                                hover:border-purple-500/80 hover:bg-purple-500/10
                                hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]
                                overflow-hidden
                            "
                        >
                            <span className="relative z-10 text-white/90 group-hover:text-white font-medium tracking-[0.2em] text-xs uppercase transition-colors duration-300">
                                Login / Sign Up
                            </span>

                            {/* Animated sheen effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreAuthLanding;
