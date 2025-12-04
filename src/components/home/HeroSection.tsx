import React from 'react';
import Link from 'next/link';
import EliteVisualizer from '@/components/EliteVisualizer';

type HeroSectionProps = {
    user?: { name?: string | null } | null;
    currentTrack?: {
        title: string;
        artist?: string | null;
        coverImageUrl?: string | null;
    } | null;
    duration: number;
    currentTime: number;
};

export function HeroSection({ user, currentTrack, duration, currentTime }: HeroSectionProps) {
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <section className="relative grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center">
            {/* Left: text + CTAs */}
            <div className="space-y-6">
                {user && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1 text-xs text-white/60 backdrop-blur-sm border border-white/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
                        <span>Welcome back, {user.name || 'Ram'}</span>
                    </div>
                )}

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                    <span className="block text-white">Remix the</span>
                    <span className="block bg-gradient-to-r from-cyan-300 via-sky-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(56,189,248,0.35)]">
                        Future.
                    </span>
                </h1>

                <p className="max-w-xl text-sm sm:text-base text-white/60">
                    Experience exclusive remixes, beats, and BGMs crafted by Ram. Dive back
                    into your sound universe in one click.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                    {/* Main CTA – glass + soft pulse */}
                    <button className="pulse-soft inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm font-medium text-white backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.7)] hover:bg-white/20 hover:shadow-[0_22px_55px_rgba(0,0,0,0.9)] transition">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
                        Continue Listening
                    </button>

                    <Link href="/releases" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/80 backdrop-blur-xl hover:bg-white/10 hover:text-white transition">
                        View Playlists
                    </Link>
                </div>
            </div>

            {/* Right: visualizer placeholder with subtle glow */}
            <div className="relative flex items-center justify-center">
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
                                <div className="space-y-1">
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

                                {/* Small subtle status pill, NO 'LIVE' text */}
                                <div className="mt-[2px] flex items-center rounded-full border border-slate-700/70 bg-slate-900/80 px-2 py-[2px]">
                                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                                    <span className="text-[10px] font-medium tracking-[0.18em] text-slate-300">
                                        ACTIVE
                                    </span>
                                </div>
                            </div>

                            {/* Progress line under text (optional) */}
                            <div className="mt-3 h-[2px] w-full rounded-full bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400"
                                    style={{ width: progress + "%" }} // 0–100
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    /* glass circle */
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
