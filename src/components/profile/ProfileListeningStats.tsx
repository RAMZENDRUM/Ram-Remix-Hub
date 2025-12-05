"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import Link from "next/link";
import { usePlayer } from "@/context/PlayerContext";

type UserTrackStat = {
    trackId: string;
    title: string;
    artist: string;
    coverUrl: string | null;

    isFavorite: boolean;
    totalPlayTimeMs: number;    // for Most Played + Fav display
    lastPlayedAt: string | null; // ISO string, for Recently Played
};

const formatDuration = (ms: number) => {
    if (ms < 60000) return `${Math.round(ms / 1000)} sec played`;
    return `${Math.round(ms / 60000)} min played`;
};

type RowProps = {
    track: UserTrackStat;
    index: number;
    variant: "fav" | "most" | "recent";
    onToggleFavorite?: (id: string) => void;
};

const TrackRow: React.FC<RowProps> = ({
    track,
    index,
    variant,
    onToggleFavorite,
}) => {
    return (
        <li className="flex items-center justify-between gap-3 rounded-[1.5rem] bg-white/5 py-1 px-1 sm:px-3 sm:py-2.5 text-xs sm:text-sm text-slate-100/90 hover:bg-white/10 transition-colors">
            {/* Make content area clickable via Link */}
            <Link href={`/remix/${track.trackId}`} className="flex flex-1 items-center justify-between gap-3 py-1.5">
                <div className="flex items-center gap-3">
                    <span className="w-4 text-[0.7rem] font-medium text-slate-400/80 font-mono">
                        {String(index + 1).padStart(2, "0")}
                    </span>

                    {track.coverUrl ? (
                        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-neutral-800 border border-white/10">
                            <Image
                                src={track.coverUrl}
                                alt={track.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-[0.6rem] text-white/50">
                            ♫
                        </div>
                    )}

                    <div className="flex flex-col min-w-0">
                        <span className="max-w-[10rem] truncate text-[0.8rem] font-medium text-slate-50">
                            {track.title}
                        </span>
                        <span className="text-[0.7rem] text-slate-300/80 truncate">
                            {track.artist || "Ram"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* minutes text for most played only */}
                    {variant === "most" &&
                        track.totalPlayTimeMs > 0 && (
                            <span className="text-[0.68rem] text-slate-300/80 font-mono whitespace-nowrap">
                                {formatDuration(track.totalPlayTimeMs)}
                            </span>
                        )}
                </div>
            </Link>

            <div className="px-1">
                {/* modern heart – ONLY in favourites section */}
                {variant === "fav" && onToggleFavorite && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(track.trackId);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/30 ring-1 ring-white/15 hover:bg-black/60 hover:ring-pink-400/70 transition"
                    >
                        <Heart
                            className="h-3.5 w-3.5"
                            // filled when favourite
                            fill={track.isFavorite ? "currentColor" : "none"}
                            color={track.isFavorite ? "#fb7185" : "#e5e7eb"}
                        />
                    </button>
                )}
            </div>
        </li>
    );
};

type SectionProps = {
    title: string;
    subtitle?: string;
    tracks: UserTrackStat[];
    variant: "fav" | "most" | "recent";
    emptyMessage: string;
    onToggleFavorite?: (id: string) => void;
};

const NeonGlassSection: React.FC<SectionProps> = ({
    title,
    subtitle,
    tracks,
    variant,
    emptyMessage,
    onToggleFavorite,
}) => {
    return (
        <section className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/20 px-5 py-5 sm:px-7 sm:py-6 backdrop-blur-xl">
            {/* subtle neons on card edge */}
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-[radial-gradient(circle_at_0%_0%,rgba(236,72,153,0.28)_0,transparent_45%),radial-gradient(circle_at_100%_100%,rgba(56,189,248,0.28)_0,transparent_45%)] opacity-40 blur-xl group-hover:opacity-90" />

            <header className="mb-4 flex flex-col gap-1 items-start">
                {/* neon edge only on the label */}
                <div
                    className="inline-flex max-w-max items-center rounded-full border border-white/10 px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-slate-100 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6))',
                        backdropFilter: 'blur(8px)'
                    }}
                >
                    {title}
                </div>

                {subtitle && (
                    <p className="text-[0.7rem] text-slate-300/75 pl-2">{subtitle}</p>
                )}
            </header>

            {tracks.length === 0 ? (
                <div className="flex h-20 items-center justify-center rounded-[1.5rem] bg-white/5 text-[0.75rem] text-slate-400/80">
                    {emptyMessage}
                </div>
            ) : (
                <ul className="space-y-2">
                    {tracks.map((track, index) => (
                        <TrackRow
                            key={track.trackId}
                            track={track}
                            index={index}
                            variant={variant}
                            onToggleFavorite={onToggleFavorite}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
};

const ProfileListeningStats: React.FC = () => {
    const { likedIds, toggleLike } = usePlayer();
    const [stats, setStats] = useState<UserTrackStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/profile/listening-stats");
                const json = await res.json();
                setStats(json.tracks ?? []);
            } catch (err) {
                console.error("Failed to load listening stats", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Merge API stats with real-time global like state
    const processedStats = stats.map(t => ({
        ...t,
        isFavorite: likedIds.has(t.trackId)
    }));

    const toggleFavorite = (trackId: string) => {
        toggleLike(trackId);
    };

    if (loading) {
        return (
            <div className="mt-8 text-sm text-slate-500 animate-pulse font-mono tracking-wide">
                LOADING STATS...
            </div>
        );
    }

    // ====== DERIVED LISTS ======

    // FAVOURITES – derived from global state
    const favourites = processedStats.filter((t) => t.isFavorite);

    // MOST PLAYED – top 3 by totalPlayTimeMs
    const mostPlayed = [...processedStats]
        .filter((t) => t.totalPlayTimeMs > 0)
        .sort((a, b) => b.totalPlayTimeMs - a.totalPlayTimeMs)
        .slice(0, 3);

    // RECENTLY PLAYED – top 3 by lastPlayedAt, newest first
    const recentlyPlayed = [...processedStats]
        .filter((t) => t.lastPlayedAt)
        .sort(
            (a, b) =>
                new Date(b.lastPlayedAt!).getTime() -
                new Date(a.lastPlayedAt!).getTime()
        )
        .slice(0, 3);


    return (
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <NeonGlassSection
                title="Favourites"
                subtitle="Tracks you've liked"
                tracks={favourites}
                variant="fav"
                emptyMessage="You haven't liked any tracks yet."
                onToggleFavorite={toggleFavorite}
            />

            <NeonGlassSection
                title="Most Played"
                subtitle="Based on your listening time"
                tracks={mostPlayed}
                variant="most"
                emptyMessage="No songs played yet."
            />

            <NeonGlassSection
                title="Recently Played"
                subtitle="Latest sessions first"
                tracks={recentlyPlayed}
                variant="recent"
                emptyMessage="You haven't played anything recently."
            />
        </div>
    );
};

export default ProfileListeningStats;
