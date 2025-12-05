"use client";

import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Heart, MoreHorizontal, Star, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlayButton } from "@/components/ui/PlayButton";

interface Track {
    id: string;
    title: string;
    artist: string | null;
    genre: string | null;
    coverImageUrl: string | null;
    createdAt: Date;
    ratings: { rating: number }[];
    type?: string; // Added type property
}

interface TrackRowProps {
    track: Track;
    index: number;
    getAverageRating: (ratings: { rating: number }[]) => number;
    isPlaying: boolean;
    onPlay: () => void;
    isLiked: boolean;
    onLike: () => void;
}

const TrackRow = memo(({ track, index, getAverageRating, isPlaying, onPlay, isLiked, onLike }: TrackRowProps) => {
    const avgRating = getAverageRating(track.ratings);
    const date = new Date(track.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

    // Helper to get dynamic neon colors based on genre
    const getGenreColor = (genre: string) => {
        const g = genre.toLowerCase();
        if (g.includes('pop')) return "text-pink-400 border-pink-500/50 shadow-[0_0_12px_rgba(236,72,153,0.4)] bg-pink-900/20";
        if (g.includes('hip-hop') || g.includes('rap')) return "text-orange-400 border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.4)] bg-orange-900/20";
        if (g.includes('r&b')) return "text-rose-400 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.4)] bg-rose-900/20";
        if (g.includes('edm') || g.includes('house')) return "text-cyan-400 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.4)] bg-cyan-900/20";
        if (g.includes('trap') || g.includes('phonk')) return "text-red-500 border-red-600/50 shadow-[0_0_12px_rgba(220,38,38,0.4)] bg-red-900/20";
        if (g.includes('lo-fi') || g.includes('chill')) return "text-indigo-300 border-indigo-400/50 shadow-[0_0_12px_rgba(129,140,248,0.4)] bg-indigo-900/20";
        if (g.includes('rock') || g.includes('metal')) return "text-stone-300 border-stone-400/50 shadow-[0_0_12px_rgba(168,162,158,0.4)] bg-stone-800/40";
        if (g.includes('soundtrack') || g.includes('score')) return "text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.4)] bg-amber-900/20";
        if (g.includes('jazz') || g.includes('classical')) return "text-yellow-200 border-yellow-300/50 shadow-[0_0_12px_rgba(253,224,71,0.4)] bg-yellow-900/20";

        // Default
        return "text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.4)] bg-cyan-900/20";
    };

    // Helper to get dynamic neon colors based on type
    const getTypeColor = (type: string) => {
        const t = type.toLowerCase();
        if (t === 'remix') return "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]";
        if (t === 'instrumental') return "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]";
        if (t === 'bgm') return "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]";
        if (t === 'song') return "text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.6)]";
        return "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]";
    };

    return (
        <div className="group relative flex flex-col md:flex-row items-start md:items-center gap-4 p-4 md:px-5 md:py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:translate-y-[-2px] hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(140,92,255,0.35)] transition-all duration-300">
            {/* Clickable Area for Navigation */}
            <Link href={`/remix/${track.id}`} className="absolute inset-0 z-0" aria-label={`View ${track.title}`} />

            {/* Left Side: Index & Cover & Title */}
            <div className="flex items-center gap-4 w-full md:w-auto relative z-10 pointer-events-none">
                {/* Index (Desktop only) */}
                <span className="hidden md:block text-white/40 font-mono text-sm w-6">
                    {(index + 1).toString().padStart(2, '0')}
                </span>

                {/* Cover Image */}
                <div className="relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-800 shadow-lg group-hover:shadow-purple-500/20 transition-all">
                    {track.coverImageUrl ? (
                        <Image
                            src={track.coverImageUrl}
                            alt={track.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 56px, 64px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-900 text-white/20 font-bold text-xl">
                            {track.title.charAt(0)}
                        </div>
                    )}

                    {/* Play Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Play size={14} fill="white" className="ml-0.5" />
                        </div>
                    </div>
                </div>

                {/* Title & Artist */}
                <div className="flex flex-col min-w-0">
                    <h3
                        className="text-white font-semibold text-base md:text-lg truncate pr-4 group-hover:text-purple-300 transition-colors tracking-wide"
                        style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                    >
                        {track.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-white/60">
                        <span className="truncate">{track.artist || "Ram"}</span>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <span className={cn("uppercase tracking-wider font-medium", getTypeColor(track.type || "Remix"))}>
                            {track.type || "Remix"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Middle: Meta Info */}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-x-6 gap-y-2 md:ml-auto md:mr-8 w-full md:w-auto pl-[72px] md:pl-0 relative z-10 pointer-events-none">
                {track.genre && (
                    <span className={cn("rounded-full px-3 py-1 text-xs whitespace-nowrap backdrop-blur-md border", getGenreColor(track.genre))}>
                        {track.genre}
                    </span>
                )}

                {/* Plays (Mock data for now as it wasn't in the interface) */}
                <span className="text-xs md:text-sm text-white/60 whitespace-nowrap hidden sm:block">
                    1.2K plays
                </span>

                {/* Rating */}
                <div className="flex items-center gap-1.5 text-yellow-500">
                    <Star size={14} fill={avgRating > 0 ? "currentColor" : "none"} />
                    <span className="text-xs md:text-sm font-medium text-white/60">
                        {avgRating > 0 ? avgRating.toFixed(1) : "NR"}
                    </span>
                </div>

                {/* Date */}
                <div className="text-xs md:text-sm text-white/60 whitespace-nowrap hidden lg:block">
                    {date}
                </div>
            </div>

            {/* Right Side: Actions */}
            <div className="absolute top-4 right-4 md:static md:flex items-center gap-3 z-20">
                <PlayButton
                    variant="pill"
                    isPlaying={isPlaying}
                    onClick={onPlay}
                    label="Play"
                    className="w-auto h-9 px-4 py-1.5 text-xs md:text-sm border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.5)] bg-black hover:bg-purple-500/20"
                />

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onLike();
                    }}
                    className={cn(
                        "hidden md:flex w-9 h-9 rounded-full items-center justify-center transition-colors",
                        isLiked ? "bg-purple-500/20 text-purple-400" : "bg-black/40 text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                    aria-label={isLiked ? "Remove from Favorites" : "Add to Favorites"}
                >
                    <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                </button>

                <button
                    className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                    aria-label="More Options"
                >
                    <MoreHorizontal size={18} />
                </button>
            </div>
        </div>
    );
});

TrackRow.displayName = 'TrackRow';

export default TrackRow;
