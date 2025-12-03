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
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

interface TrackInfoPanelProps {
    open: boolean;
    onClose: () => void;
    // hook these to your real player state
    songTitle: string;
    artistName: string;
    albumArt?: string | null;
    duration: number;
    currentTime: number;
    isPlaying: boolean;
    onPlayPause: () => void;
    onPrev: () => void;
    onNext: () => void;
    onSeek: (seconds: number) => void;
    volume: number;
    onVolumeChange: (value: number) => void;
    isLiked: boolean;
    onToggleLike: () => void;
    isRepeat: boolean;
    onToggleRepeat: () => void;
    isShuffle: boolean;
    onToggleShuffle: () => void;
}

export function TrackInfoPanel({
    open,
    onClose,
    songTitle,
    artistName,
    albumArt,
    duration,
    currentTime,
    isPlaying,
    onPlayPause,
    onPrev,
    onNext,
    onSeek,
    volume,
    onVolumeChange,
    isLiked,
    onToggleLike,
    isRepeat,
    onToggleRepeat,
    isShuffle,
    onToggleShuffle,
}: TrackInfoPanelProps) {
    if (!open) return null;

    const progressPercentage =
        duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="fixed inset-0 z-40 flex items-end justify-end pointer-events-none">
            {/* click-away area */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                onClick={onClose}
            />

            <div className="pointer-events-auto m-4 mb-20">
                <Card className="w-[360px] overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-950/95 via-slate-900/80 to-slate-950/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
                    {/* Album art */}
                    <div className="relative mb-5 aspect-square w-full overflow-hidden rounded-2xl shadow-xl">
                        <img
                            src={
                                albumArt ??
                                "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop"
                            }
                            alt={songTitle}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    </div>

                    {/* Text */}
                    <div className="mb-4 space-y-1">
                        <h2 className="text-xl font-semibold text-slate-50">
                            {songTitle}
                        </h2>
                        <p className="text-sm text-slate-400">{artistName}</p>
                    </div>

                    {/* Progress */}
                    <div className="mb-3 space-y-2">
                        <Slider
                            value={[progressPercentage]}
                            max={100}
                            step={0.1}
                            onValueChange={(val) =>
                                onSeek(((val[0] ?? 0) / 100) * duration)
                            }
                            className="w-full"
                        />
                        <div className="flex justify-between text-[11px] text-slate-400">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="mb-4 flex items-center justify-center gap-3">
                        <button
                            className={cn(
                                "h-9 w-9 rounded-full flex items-center justify-center text-slate-400 hover:text-sky-400 transition-colors",
                                isShuffle && "text-sky-400"
                            )}
                            onClick={onToggleShuffle}
                        >
                            <Shuffle className="h-4 w-4" />
                        </button>

                        <button
                            className="h-10 w-10 rounded-full flex items-center justify-center text-slate-200 hover:text-sky-300"
                            onClick={onPrev}
                        >
                            <SkipBack className="h-5 w-5" />
                        </button>

                        <button
                            className="h-12 w-12 rounded-full bg-sky-400 text-slate-900 flex items-center justify-center shadow-lg hover:scale-105 hover:shadow-xl transition-all"
                            onClick={onPlayPause}
                        >
                            {isPlaying ? (
                                <Pause className="h-6 w-6" />
                            ) : (
                                <Play className="h-6 w-6" />
                            )}
                        </button>

                        <button
                            className="h-10 w-10 rounded-full flex items-center justify-center text-slate-200 hover:text-sky-300"
                            onClick={onNext}
                        >
                            <SkipForward className="h-5 w-5" />
                        </button>

                        <button
                            className={cn(
                                "h-9 w-9 rounded-full flex items-center justify-center text-slate-400 hover:text-sky-400 transition-colors",
                                isRepeat && "text-sky-400"
                            )}
                            onClick={onToggleRepeat}
                        >
                            <Repeat className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Secondary */}
                    <div className="flex items-center justify-between">
                        <button
                            className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-400"
                            onClick={onToggleLike}
                        >
                            <Heart
                                className={cn(
                                    "h-4 w-4 transition-all",
                                    isLiked && "fill-rose-500 text-rose-500"
                                )}
                            />
                        </button>

                        <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-slate-400" />
                            <Slider
                                value={[volume]}
                                max={100}
                                step={1}
                                onValueChange={(val) => onVolumeChange(val[0] ?? volume)}
                                className="w-24"
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
