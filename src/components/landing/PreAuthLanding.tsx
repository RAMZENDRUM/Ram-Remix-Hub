"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { BrandLogo } from "@/components/BrandLogo";
import ShaderBackground from "@/components/ShaderBackground";
import ShinyButton from "@/components/ui/ShinyButton";

import Link from "next/link";

import { SiteFooter } from "@/components/layout/footer";

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
        <div className="relative min-h-screen overflow-x-hidden bg-[#05060D]">
            {/* HEADER NAV */}
            <header className="absolute top-0 left-0 right-0 w-full z-50 flex items-center justify-between px-4 py-4 md:px-12 md:py-6">
                <div className="flex items-center gap-3">
                    <div className="scale-75 md:scale-90 origin-left">
                        <BrandLogo variant="nav" />
                    </div>
                </div>

                <nav className="flex items-center gap-4 md:gap-8">
                    <Link
                        href="/about-website"
                        className="text-[10px] md:text-xs font-light tracking-widest text-neutral-500 hover:text-white transition-colors uppercase whitespace-nowrap"
                    >
                        About Website
                    </Link>
                    <Link
                        href="/about"
                        className="text-[10px] md:text-xs font-light tracking-widest text-neutral-500 hover:text-white transition-colors uppercase whitespace-nowrap"
                    >
                        About Me
                    </Link>
                </nav>
            </header>

            <ShaderBackground />

            {/* Noise Texture Overlay for Premium Feel - Optimized opacity */}
            <div className="absolute inset-0 z-[1] opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat"></div>

            {/* HERO CONTENT */}
            <div className="relative z-10 flex flex-col items-center -mt-10 px-4 pt-28 md:pt-40">

                {/* HEADLINE */}
                <div className="flex flex-col items-center text-center animate-fadeIn max-w-6xl mx-auto">
                    {/* Eyebrow Removed for cleaner look */}

                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 md:mb-12 font-[family-name:var(--font-outfit)] text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d48bff] to-[#8bd7ff] drop-shadow-[0_0_25px_rgba(140,92,255,0.15)]">
                        YOUR MUSIC. YOUR RULES.
                    </h1>

                    <p className="text-sm md:text-lg text-[#c0c6f0] max-w-xl mx-auto font-light leading-relaxed tracking-wide opacity-70 mb-10 md:mb-16 px-4">
                        Mix, stream, curate and share — powered by AI personalization.
                    </p>
                </div>

                {/* CTA SECTION */}
                <div className="flex flex-col items-center gap-6 mt-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <button
                        onClick={handleLoginClick}
                        className="
                            group relative px-10 py-3.5 rounded-full 
                            bg-white/5 backdrop-blur-xl
                            border border-white/10
                            transition-all duration-300 ease-out
                            hover:-translate-y-0.5
                            hover:shadow-[0_0_20px_rgba(123,47,247,0.25)]
                            hover:bg-white/10
                            overflow-hidden
                        "
                    >
                        <span className="relative z-10 text-white font-bold tracking-[0.15em] text-xs md:text-sm uppercase transition-colors duration-300">
                            Login / Sign Up
                        </span>

                        {/* Shimmer (reduced intensity) */}
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-0" />
                    </button>

                    <p className="text-[9px] md:text-[10px] text-[#2FD8F5] font-bold tracking-[0.2em] uppercase opacity-70 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                        No ads. No interruptions. Always premium.
                    </p>
                </div>

                {/* FEATURE PANEL */}
                <div className="w-full max-w-5xl px-4 mt-32 md:mt-52 pb-32 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {[
                            {
                                title: "Exclusive Remix Library",
                                desc: "Handpicked remixes found nowhere else.",
                                icon: "Music"
                            },
                            {
                                title: "Personalized Playlists",
                                desc: "Auto-curated from your mood & tempo.",
                                icon: "ListMusic"
                            },
                            {
                                title: "Artist Studio",
                                desc: "Upload vocals and craft signature mixes.",
                                icon: "Mic2"
                            }
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-4 p-5 rounded-[26px] bg-gradient-to-br from-[#090915] to-[#05060d] border border-white/[0.06] shadow-xl hover:-translate-y-1 transition-transform duration-300 group">
                                <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-[#8b4cff]/10 to-[#2fd8f5]/10 flex items-center justify-center text-[#2FD8F5]/80 group-hover:text-[#2FD8F5] group-hover:scale-105 transition-all duration-300">
                                    {feature.icon === "Music" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                                    )}
                                    {feature.icon === "ListMusic" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15V6" /><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /><path d="M12 12H3" /><path d="M16 6H3" /><path d="M12 18H3" /></svg>
                                    )}
                                    {feature.icon === "Mic2" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" /><circle cx="17" cy="7" r="5" /></svg>
                                    )}
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-sm font-bold text-white tracking-wide">{feature.title}</span>
                                    <span className="text-xs text-[#9aa1d8] leading-tight mt-1">{feature.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <SiteFooter />
        </div>
    );
};

export default PreAuthLanding;
