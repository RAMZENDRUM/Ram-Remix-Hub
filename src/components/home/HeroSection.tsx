import React from 'react';
import Link from 'next/link';
import EliteVisualizer from '@/components/EliteVisualizer';

type HeroSectionProps = {
    user?: { name?: string | null; email?: string | null } | null;
    currentTrack?: {
        title: string;
        artist?: string | null;
        coverImageUrl?: string | null;
    } | null;
    duration: number;
    currentTime: number;
};

const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export function HeroSection({ user, currentTrack, duration, currentTime }: HeroSectionProps) {
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <section className="relative grid gap-12 lg:grid-cols-[1.2fr_1fr] items-center py-20">
            {/* Left: Content aligns left */}
            <div className="space-y-8 text-left animate-fadeIn">

                {/* Indicators Container */}
                <div className="flex items-center gap-3">
                    {/* Live Indicator */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-purple-200 tracking-wider">STUDIO ACTIVE</span>
                    </div>

                    {/* Welcome Pill */}
                    {user && (
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Welcome, {user.name || 'Ram'}</span>
                        </div>
                    )}
                </div>

                {/* Main Headline with Purple Shade Gradient */}
                <h1 className="text-6xl sm:text-7xl lg:text-9xl font-bold tracking-tighter leading-[0.9] drop-shadow-2xl">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-400">
                        Remixes. Refined.
                    </span>
                </h1>

                {/* Subtext with Purple Highlight */}
                <p className="max-w-xl text-lg sm:text-xl text-white/60 font-normal leading-relaxed">
                    Signature edits and BGMs crafted by Ram — designed for those who chase <span className="text-purple-300 font-medium tracking-wide">sound perfection</span>.
                </p>

                {/* Buttons with Purple Accents */}
                {/* Buttons with Purple Accents - Hidden for Admin */}
                {(!user || (user.email !== 'ramzendrum@gmail.com' && (user as any).role !== 'ADMIN')) && (
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <button className="group relative px-8 py-4 rounded-full bg-white text-black font-semibold text-sm tracking-wide transition-all active:scale-95 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                            <span className="relative z-10">Listen Now</span>
                        </button>

                        <Link href="/releases" className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium text-sm tracking-wide backdrop-blur-md hover:bg-white/10 transition-all hover:border-purple-500/30 hover:text-purple-100 active:scale-95">
                            Explore Releases
                        </Link>
                    </div>
                )}
            </div>

            {/* Right: Restricted Visualizer Area */}
            <div className="relative flex items-center justify-center lg:justify-end lg:-translate-x-6">
                {/* neon backlight */}
                <div className="absolute h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.4),transparent_55%)] blur-2xl opacity-70" />

                {currentTrack ? (
                    <div className="relative flex flex-col items-center gap-4">
                        <div className="circular-visualizer relative z-10">
                            <EliteVisualizer
                                coverUrl={currentTrack.coverImageUrl || undefined}
                                size={260}
                            />
                        </div>
                        <div
                            className="
                    min-w-[260px]
                    rounded-2xl
                    bg-slate-900/60
                    px-5 py-4
                    shadow-[0_0_35px_rgba(56,189,248,0.35)]
                    backdrop-blur
                    translate-y-[-12px]
                    z-20
                    border border-white/10
                    "
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1 text-left">
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
                                        Now Playing
                                    </p>
                                    <p className="text-sm font-semibold text-slate-50 line-clamp-1">
                                        {currentTrack?.title ?? "—"}
                                    </p>
                                    <p className="text-xs text-slate-400 line-clamp-1">
                                        {currentTrack?.artist ?? ""}
                                    </p>
                                </div>

                                <div className="mt-[2px] flex items-center rounded-full border border-slate-700/70 bg-slate-900/80 px-2 py-[2px]">
                                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                                    <span className="text-[10px] font-medium tracking-[0.18em] text-slate-300">
                                        ACTIVE
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar & Time */}
                            <div className="mt-3 space-y-1">
                                <div className="h-[3px] w-full rounded-full bg-slate-800 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400 transition-all duration-300 ease-linear"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[9px] text-slate-500 font-medium tracking-wide">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative h-56 w-56 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.7)] flex items-center justify-center text-center text-xs text-white/50">
                        <div className="pulse-soft h-52 w-52 rounded-full border border-white/10 flex items-center justify-center">
                            <span className="px-6 text-white/60">
                                Select a track to start visualizer
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
