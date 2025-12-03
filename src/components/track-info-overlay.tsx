"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    Heart,
    Repeat,
    Shuffle,
} from "lucide-react";

const formatTime = (seconds: number): string => {
    if (!seconds || Number.isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

interface TrackInfoOverlayProps {
    open: boolean;
    onClose: () => void;

    trackId: string;

    title: string;
    artist: string;
    coverUrl?: string | null;
    duration: number;
    currentTime: number;

    isPlaying: boolean;
    isLiked: boolean;
    isShuffle: boolean;
    isLoop: boolean;

    volume: number; // 0–100

    onPlayPause: () => void;
    onPrev: () => void;
    onNext: () => void;
    onSeek: (seconds: number) => void;
    onVolumeChange: (value: number) => void;
    onToggleLike: (trackId: string) => void;
    onToggleShuffle: () => void;
    onToggleLoop: () => void;
}

export function TrackInfoOverlay({
    open,
    onClose,
    trackId,
    title,
    artist,
    coverUrl,
    duration,
    currentTime,
    isPlaying,
    isLiked,
    isShuffle,
    isLoop,
    volume,
    onPlayPause,
    onPrev,
    onNext,
    onSeek,
    onVolumeChange,
    onToggleLike,
    onToggleShuffle,
    onToggleLoop,
}: TrackInfoOverlayProps) {
    if (!open) return null;

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
            {/* BACKDROP */}
            <button
                className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
                onClick={onClose}
            />

            {/* METALLIC CARD */}
            <Card
                className={cn(
                    "relative z-10 w-[360px] overflow-hidden rounded-[32px] border border-white/18",
                    // base dark shell
                    "bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.45)_0,transparent_50%),radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.75)_0,transparent_55%),linear-gradient(to_bottom_right,#050010,#130424,#05000c)]",
                    "shadow-[0_28px_90px_rgba(0,0,0,0.9)] p-5"
                )}
            >
                {/* inner chrome ring */}
                <div className="pointer-events-none absolute inset-[1px] rounded-[30px] border border-white/25 bg-gradient-to-b from-white/10 via-transparent to-black/35" />

                {/* subtle vignette */}
                <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.3)_0,transparent_55%),radial-gradient(circle_at_100%_120%,rgba(59,130,246,0.25)_0,transparent_55%)] mix-blend-screen" />

                {/* CONTENT */}
                <div className="relative z-10">
                    {/* Cover */}
                    <div className="relative mb-5 aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
                        <img
                            src={
                                coverUrl ??
                                "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop"
                            }
                            alt={title}
                            className="h-full w-full object-cover"
                        />
                        {/* glass overlay on top edge */}
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/30 via-white/0 to-transparent" />
                    </div>

                    {/* Song info */}
                    <div className="mb-4 space-y-1">
                        <h2 className="text-lg font-semibold text-slate-50 tracking-wide">
                            {title}
                        </h2>
                        <p className="text-sm text-slate-200/80">{artist}</p>
                    </div>

                    {/* Progress */}
                    <div className="mb-4 space-y-2">
                        <Slider
                            value={[progress]}
                            max={100}
                            step={0.1}
                            onValueChange={(vals) =>
                                onSeek(((vals[0] ?? 0) / 100) * (duration || 0))
                            }
                            className="w-full data-[state=active]:cursor-grabbing"
                        />
                        <div className="flex justify-between text-[11px] text-slate-100/80">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Main controls */}
                    <div className="mb-5 flex items-center justify-center gap-4">
                        <button
                            className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center text-slate-200/85 hover:text-purple-300 transition-colors",
                                isShuffle && "bg-white/10 text-purple-300"
                            )}
                            onClick={onToggleShuffle}
                        >
                            <Shuffle className="h-4 w-4" />
                        </button>

                        <button
                            className="h-10 w-10 rounded-full flex items-center justify-center text-slate-50 hover:text-purple-200"
                            onClick={onPrev}
                        >
                            <SkipBack className="h-5 w-5" />
                        </button>

                        <button
                            className="h-16 w-16 rounded-full bg-slate-950/95 text-white flex items-center justify-center shadow-[0_24px_65px_rgba(59,7,100,0.95)] hover:scale-105 hover:shadow-[0_30px_80px_rgba(88,28,135,1)] transition-all"
                            onClick={onPlayPause}
                        >
                            {isPlaying ? (
                                <Pause className="h-6 w-6" />
                            ) : (
                                <Play className="h-6 w-6 translate-x-[1px]" />
                            )}
                        </button>

                        <button
                            className="h-10 w-10 rounded-full flex items-center justify-center text-slate-50 hover:text-purple-200"
                            onClick={onNext}
                        >
                            <SkipForward className="h-5 w-5" />
                        </button>

                        <button
                            className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center text-slate-200/85 hover:text-purple-300 transition-colors",
                                isLoop && "bg-white/10 text-purple-300"
                            )}
                            onClick={onToggleLoop}
                        >
                            <Repeat className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Secondary controls */}
                    <div className="flex items-center justify-between">
                        {/* LIKE */}
                        <button
                            className="h-8 w-8 flex items-center justify-center rounded-full text-slate-200 hover:text-red-400"
                            onClick={() => onToggleLike(trackId)}
                        >
                            <Heart
                                className={cn(
                                    "h-4 w-4 transition-all",
                                    isLiked && "fill-red-500 text-red-500 drop-shadow-[0_0_10px_rgba(248,113,113,0.7)]"
                                )}
                            />
                        </button>

                        <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-slate-100/85" />
                            <Slider
                                value={[volume]}
                                max={100}
                                step={1}
                                onValueChange={(vals) => onVolumeChange(vals[0] ?? volume)}
                                className="w-28"
                            />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
