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

    // === DATA FROM YOUR REAL PLAYER ===
    title: string;
    artist: string;
    coverUrl?: string | null;
    duration: number;
    currentTime: number;

    isPlaying: boolean;
    isLiked: boolean;
    isShuffle: boolean;
    isLoop: boolean; // true = repeat

    volume: number; // 0–100

    // === ACTIONS FROM YOUR REAL PLAYER ===
    onPlayPause: () => void;
    onPrev: () => void;
    onNext: () => void;
    onSeek: (seconds: number) => void;
    onVolumeChange: (value: number) => void;
    onToggleLike: () => void;
    onToggleShuffle: () => void;
    onToggleLoop: () => void;
}

export function TrackInfoOverlay({
    open,
    onClose,
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
                className="absolute inset-0 bg-black/50 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* CARD */}
            <Card
                className={cn(
                    "relative z-10 w-[360px] overflow-hidden rounded-[36px] border border-white/10",
                    // metallic / 3D purple: radial highlight + deep gradient base
                    "bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.35)_0,transparent_55%),linear-gradient(to_bottom_right,#130725,#3a1765,#8c4bff)]",
                    "shadow-[0_26px_90px_rgba(0,0,0,0.85)] p-6"
                )}
            >
                {/* subtle inner gloss */}
                <div className="pointer-events-none absolute inset-px rounded-[34px] border border-white/8 bg-gradient-to-b from-white/10 via-transparent to-black/20" />

                {/* CONTENT WRAPPER so gloss stays behind */}
                <div className="relative z-10">
                    {/* Cover */}
                    <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-[0_18px_45px_rgba(0,0,0,0.9)]">
                        <img
                            src={
                                coverUrl ??
                                "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop"
                            }
                            alt={title}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {/* Title / artist */}
                    <div className="mb-4 space-y-1">
                        <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
                        <p className="text-sm text-slate-300">{artist}</p>
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
                            className="[--track-bg:rgba(255,255,255,0.28)]"
                        />
                        <div className="flex justify-between text-[11px] text-slate-200/80">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Main controls */}
                    <div className="mb-5 flex items-center justify-center gap-4">
                        <button
                            className={cn(
                                "h-9 w-9 rounded-full flex items-center justify-center text-slate-200/80 hover:text-purple-300 transition-colors",
                                isShuffle && "text-purple-300 bg-white/5"
                            )}
                            onClick={onToggleShuffle}
                        >
                            <Shuffle className="h-4 w-4" />
                        </button>

                        <button
                            className="h-10 w-10 rounded-full flex items-center justify-center text-slate-100 hover:text-purple-200"
                            onClick={onPrev}
                        >
                            <SkipBack className="h-5 w-5" />
                        </button>

                        <button
                            className="h-16 w-16 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-[0_18px_45px_rgba(25,0,70,0.9)] hover:scale-105 hover:shadow-[0_22px_55px_rgba(25,0,70,1)] transition-all"
                            onClick={onPlayPause}
                        >
                            {isPlaying ? (
                                <Pause className="h-6 w-6" />
                            ) : (
                                <Play className="h-6 w-6 translate-x-[1px]" />
                            )}
                        </button>

                        <button
                            className="h-10 w-10 rounded-full flex items-center justify-center text-slate-100 hover:text-purple-200"
                            onClick={onNext}
                        >
                            <SkipForward className="h-5 w-5" />
                        </button>

                        <button
                            className={cn(
                                "h-9 w-9 rounded-full flex items-center justify-center text-slate-200/80 hover:text-purple-300 transition-colors",
                                isLoop && "text-purple-300 bg-white/5"
                            )}
                            onClick={onToggleLoop}
                        >
                            <Repeat className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Secondary controls */}
                    <div className="flex items-center justify-between">
                        {/* LIKE BUTTON – this must call onToggleLike */}
                        <button
                            className="h-8 w-8 flex items-center justify-center rounded-full text-slate-200 hover:text-red-400"
                            onClick={onToggleLike}
                        >
                            <Heart
                                className={cn(
                                    "h-4 w-4 transition-all",
                                    isLiked && "fill-red-500 text-red-500"
                                )}
                            />
                        </button>

                        <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-slate-200/85" />
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
