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
            {/* BACKDROP – this one blurs the PAGE, NOT the card */}
            <button
                className="absolute inset-0 bg-black/50 backdrop-blur-md"
                onClick={onClose}
            />

            {/* CARD – NO blur/filter on this element */}
            <Card
                className={cn(
                    "relative z-10 w-[360px] overflow-hidden rounded-[32px] border border-white/8",
                    "bg-gradient-to-b from-[#f7f5ff] via-[#f0e4ff] to-[#e3c8ff]",
                    "shadow-[0_24px_80px_rgba(0,0,0,0.75)] p-6"
                )}
            >
                {/* Cover */}
                <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl">
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
                    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                    <p className="text-sm text-slate-600">{artist}</p>
                </div>

                {/* Progress */}
                <div className="mb-3 space-y-2">
                    <Slider
                        value={[progress]}
                        max={100}
                        step={0.1}
                        onValueChange={(vals) =>
                            onSeek(((vals[0] ?? 0) / 100) * (duration || 0))
                        }
                    />
                    <div className="flex justify-between text-[11px] text-slate-600">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Main controls */}
                <div className="mb-5 flex items-center justify-center gap-4">
                    <button
                        className={cn(
                            "h-9 w-9 rounded-full flex items-center justify-center text-slate-700 hover:text-purple-600 transition-colors",
                            isShuffle && "text-purple-600"
                        )}
                        onClick={onToggleShuffle}
                    >
                        <Shuffle className="h-4 w-4" />
                    </button>

                    <button
                        className="h-10 w-10 rounded-full flex items-center justify-center text-slate-900 hover:text-purple-700"
                        onClick={onPrev}
                    >
                        <SkipBack className="h-5 w-5" />
                    </button>

                    <button
                        className="h-14 w-14 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:scale-105 hover:shadow-xl transition-all"
                        onClick={onPlayPause}
                    >
                        {isPlaying ? (
                            <Pause className="h-6 w-6" />
                        ) : (
                            <Play className="h-6 w-6 translate-x-[1px]" />
                        )}
                    </button>

                    <button
                        className="h-10 w-10 rounded-full flex items-center justify-center text-slate-900 hover:text-purple-700"
                        onClick={onNext}
                    >
                        <SkipForward className="h-5 w-5" />
                    </button>

                    <button
                        className={cn(
                            "h-9 w-9 rounded-full flex items-center justify-center text-slate-700 hover:text-purple-600 transition-colors",
                            isLoop && "text-purple-600"
                        )}
                        onClick={onToggleLoop}
                    >
                        <Repeat className="h-4 w-4" />
                    </button>
                </div>

                {/* Secondary controls */}
                <div className="flex items-center justify-between">
                    <button
                        className="h-8 w-8 flex items-center justify-center rounded-full text-slate-700 hover:text-red-500"
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
                        <Volume2 className="h-4 w-4 text-slate-700" />
                        <Slider
                            value={[volume]}
                            max={100}
                            step={1}
                            onValueChange={(vals) => onVolumeChange(vals[0] ?? volume)}
                            className="w-28"
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
}
