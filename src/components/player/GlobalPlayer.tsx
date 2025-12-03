"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
    Play, Pause, SkipBack, SkipForward, Shuffle, Repeat,
    Volume2, Volume1, VolumeX, ListMusic, Mic2, MonitorSpeaker,
    Info, Minimize2, Maximize2, Heart, Download, Share2, Plus, X
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { formatTime } from "@/lib/formatTime";

type IconButtonWithTooltipProps = {
    label: string;
    onClick?: () => void;
    children: React.ReactNode;
    active?: boolean;
};

function IconButtonWithTooltip({
    label,
    onClick,
    children,
    active,
}: IconButtonWithTooltipProps) {
    return (
        <div className="relative group flex">
            <button
                type="button"
                aria-label={label}
                onClick={onClick}
                className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition-colors",
                    active && "border-purple-500/70 text-purple-300 bg-purple-500/10"
                )}
            >
                {children}
            </button>
            <div
                className="pointer-events-none absolute -top-9 left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-900/95 px-2.5 py-1 text-[11px] text-neutral-100 opacity-0 shadow-lg shadow-black/60
                   group-hover:opacity-100 group-hover:translate-y-0 transition-all
                   translate-y-1"
            >
                {label}
            </div>
        </div>
    );
}

// Custom Slider Component for Seek and Volume
interface CustomSliderProps {
    min: number;
    max: number;
    value: number;
    onChange: (value: number) => void;
    className?: string;
}

function CustomSlider({ min, max, value, onChange, className }: CustomSliderProps) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={cn("group relative flex h-4 items-center touch-none select-none", className)}>
            {/* Track Background */}
            <div className="relative h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
                {/* Fill */}
                <div
                    className="absolute h-full bg-gradient-to-r from-purple-600 to-indigo-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Thumb - positioned absolutely based on percentage */}
            <div
                className="absolute h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_10px_rgba(168,85,247,0.5)] ring-2 ring-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ left: `${percentage}%`, transform: `translateX(-50%)` }}
            />

            {/* Invisible Input for interaction */}
            <input
                type="range"
                min={min}
                max={max}
                step={0.01}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
        </div>
    );
}

export default function GlobalPlayer() {
    const {
        currentTrack,
        isPlaying,
        togglePlay,
        setIsPlaying,
        currentTime,
        duration,
        setCurrentTime,
        setDuration,
        nextTrack,
        prevTrack,
        queue
    } = usePlayer();
    const { pushToast } = useToast();
    const audioRef = useRef<HTMLAudioElement>(null);

    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);
    const [repeatMode, setRepeatMode] = useState<"off" | "one" | "all">("off");

    // New states for right-side buttons
    const [queueOpen, setQueueOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [miniMode, setMiniMode] = useState(false);

    // Keyboard Listener for Spacebar Play/Pause
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if the target is an input or textarea to avoid conflict
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

            if (e.code === 'Space') {
                e.preventDefault(); // Prevent scrolling
                togglePlay();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay]);

    // Handle Play/Pause when global state changes
    useEffect(() => {
        if (!audioRef.current || !currentTrack) return;

        if (isPlaying) {
            audioRef.current.play().catch(e => console.error("Play error:", e));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, currentTrack]);

    // Handle Track Change
    useEffect(() => {
        if (!audioRef.current || !currentTrack) return;

        // Reset state for new track
        setCurrentTime(0);
        audioRef.current.currentTime = 0;

        // Auto play new track
        if (isPlaying) {
            audioRef.current.play().catch(e => console.error("Play error:", e));
        }
    }, [currentTrack]);

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleEnded = () => {
        if (repeatMode === "one") {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
        } else if (repeatMode === "all") {
            nextTrack();
        } else {
            // Standard behavior: go to next track. If end of queue, nextTrack handles stopping.
            nextTrack();
        }
    };

    const handleSeek = (value: number) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = value;
        setCurrentTime(value);
    };

    const handleVolumeChange = (value: number) => {
        if (!audioRef.current) return;
        const v = value / 100;
        audioRef.current.volume = v;
        setVolume(v);
        setIsMuted(v === 0);
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        const newMuted = !isMuted;
        audioRef.current.muted = newMuted;
        setIsMuted(newMuted);
    };

    const toggleRepeat = () => {
        const modes: ("off" | "one" | "all")[] = ["off", "all", "one"];
        const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
        setRepeatMode(modes[nextIndex]);
    };

    // Action Handlers
    const handleLike = () => {
        pushToast("success", "Added to Liked Songs");
    };

    const handleDownload = () => {
        if (!currentTrack?.audioUrl) return;
        const link = document.createElement('a');
        link.href = currentTrack.audioUrl;
        link.download = `${currentTrack.title}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        pushToast("success", "Download started");
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        pushToast("success", "Link copied to clipboard");
    };

    const handleAddToPlaylist = () => {
        pushToast("success", "Added to Playlist");
    };



    if (!currentTrack) {
        return (
            <footer className="fixed bottom-0 inset-x-0 z-30 border-t border-neutral-800 bg-black/95 backdrop-blur-2xl py-3">
                <div className="mx-auto max-w-6xl px-4 text-center text-xs text-neutral-500">
                    Select a track to start listening
                </div>
            </footer>
        );
    }

    return (
        <>
            <footer className={cn(
                "fixed bottom-0 inset-x-0 z-30 border-t border-neutral-800 bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-2xl transition-all duration-300",
                miniMode ? "py-1" : ""
            )}>
                <audio
                    ref={audioRef}
                    src={currentTrack.audioUrl}
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                />

                <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2 md:py-3">
                    {/* Left: Track Info */}
                    <div className="flex items-center gap-3 w-[30%] min-w-0">
                        <div className={cn(
                            "relative overflow-hidden rounded-xl bg-neutral-800/80 flex-shrink-0 border border-neutral-700/50 transition-all duration-300",
                            miniMode ? "h-8 w-8" : "h-12 w-12"
                        )}>
                            {currentTrack.coverImageUrl ? (
                                <Image
                                    src={currentTrack.coverImageUrl}
                                    alt={currentTrack.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                                    No Art
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="truncate text-sm font-semibold text-white hover:underline cursor-pointer">
                                {currentTrack.title}
                            </span>
                            {!miniMode && (
                                <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                                    <span className="truncate max-w-[100px] hover:text-white cursor-pointer transition-colors">
                                        {currentTrack.artist || "Unknown Artist"}
                                    </span>
                                    {currentTrack.genre && (
                                        <span className="hidden md:inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-purple-300">
                                            {currentTrack.genre}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Center: Controls + Seek */}
                    <div className="flex flex-col flex-1 items-center gap-1 max-w-[40%]">
                        {!miniMode && (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsShuffling(!isShuffling)}
                                    className={`p-1.5 rounded-full transition-colors ${isShuffling ? 'text-purple-400 bg-purple-500/10' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                                >
                                    <Shuffle size={16} />
                                </button>

                                <button
                                    onClick={prevTrack}
                                    className="text-neutral-300 hover:text-white transition-colors active:scale-95"
                                >
                                    <SkipBack size={20} fill="currentColor" />
                                </button>

                                <button
                                    onClick={togglePlay}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/40 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/10"
                                >
                                    {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-0.5" />}
                                </button>

                                <button
                                    onClick={nextTrack}
                                    className="text-neutral-300 hover:text-white transition-colors active:scale-95"
                                >
                                    <SkipForward size={20} fill="currentColor" />
                                </button>

                                <button
                                    onClick={toggleRepeat}
                                    className={`p-1.5 rounded-full transition-colors ${repeatMode !== 'off' ? 'text-purple-400 bg-purple-500/10' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                                >
                                    <Repeat size={16} />
                                    {repeatMode === 'one' && <span className="absolute text-[8px] font-bold top-1 right-1">1</span>}
                                </button>
                            </div>
                        )}

                        <div className="flex w-full items-center gap-2 text-[10px] font-medium text-neutral-500">
                            <span className="w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
                            <CustomSlider
                                min={0}
                                max={duration || 0}
                                value={currentTime}
                                onChange={handleSeek}
                                className="flex-1"
                            />
                            <span className="w-8 tabular-nums">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Right: Volume & Extras */}
                    <div className="flex items-center gap-3 w-[30%] justify-end">
                        <div className="flex items-center gap-2 group mr-2">
                            <button onClick={toggleMute} className="text-neutral-400 hover:text-white transition-colors">
                                {isMuted || volume === 0 ? <VolumeX size={18} /> : volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />}
                            </button>
                            <CustomSlider
                                min={0}
                                max={100}
                                value={isMuted ? 0 : volume * 100}
                                onChange={handleVolumeChange}
                                className="w-24"
                            />
                        </div>

                        {!miniMode && (
                            <div className="hidden md:flex items-center gap-1">
                                <IconButtonWithTooltip
                                    label="Queue"
                                    onClick={() => setQueueOpen(prev => !prev)}
                                    active={queueOpen}
                                >
                                    <ListMusic size={16} />
                                </IconButtonWithTooltip>

                                <IconButtonWithTooltip
                                    label="Track info"
                                    onClick={() => setInfoOpen(prev => !prev)}
                                    active={infoOpen}
                                >
                                    <Info size={16} />
                                </IconButtonWithTooltip>
                            </div>
                        )}

                        <IconButtonWithTooltip
                            label={miniMode ? "Expand player" : "Mini player"}
                            onClick={() => setMiniMode(prev => !prev)}
                            active={miniMode}
                        >
                            {miniMode ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                        </IconButtonWithTooltip>
                    </div>
                </div>

                {/* Queue Panel */}
                {queueOpen && !miniMode && (
                    <div className="fixed bottom-20 right-4 z-40 w-64 rounded-2xl border border-neutral-700/80 bg-neutral-950/95 backdrop-blur-xl shadow-2xl shadow-black/60 p-3 space-y-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
                        <h3 className="text-xs font-semibold text-neutral-200 mb-1 px-1">
                            Up Next
                        </h3>
                        <div className="max-h-64 space-y-1 overflow-y-auto">
                            {/* Placeholder for queue items */}
                            <div className="px-2 py-4 text-center text-xs text-neutral-500 italic">
                                Queue is empty
                            </div>
                        </div>
                    </div>
                )}
            </footer>

            {/* Track Info Overlay */}
            {infoOpen && currentTrack && !miniMode && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300"
                        onClick={() => setInfoOpen(false)}
                    />

                    {/* Card */}
                    <div className="relative w-full max-w-4xl rounded-3xl border border-neutral-800/80 bg-gradient-to-br from-neutral-950 via-neutral-900/95 to-neutral-950 shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        {/* Background Gradient Effect */}
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(168,85,247,0.1),transparent_50%),_radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.1),transparent_50%)]" />

                        {/* Close Button */}
                        <button
                            onClick={() => setInfoOpen(false)}
                            className="absolute top-4 right-4 z-20 p-2 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all backdrop-blur-md"
                            aria-label="Close info"
                        >
                            <X size={20} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8 md:gap-10 p-6 md:p-10 relative z-10">
                            {/* LEFT: Text + Progress */}
                            <div className="flex flex-col justify-center gap-6 order-2 md:order-1">
                                <div className="space-y-4">
                                    <div className="text-xs uppercase tracking-[0.2em] text-purple-400/80 font-bold">
                                        {/* @ts-ignore */}
                                        {currentTrack.type || "Remix"}
                                    </div>

                                    <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight line-clamp-2">
                                        {currentTrack.title}
                                    </h2>

                                    <button className="self-start text-lg md:text-xl text-purple-400 hover:text-purple-300 transition-colors font-semibold">
                                        {currentTrack.artist || "Unknown artist"}
                                    </button>

                                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300 pt-2">
                                        {currentTrack.genre && (
                                            <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 uppercase tracking-wide text-[10px] text-purple-300 font-bold">
                                                {currentTrack.genre}
                                            </span>
                                        )}
                                        {duration > 0 && (
                                            <span className="rounded-full bg-neutral-800/80 px-3 py-1 font-mono text-neutral-400">
                                                {formatTime(duration)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="mt-4 md:mt-8 flex flex-col gap-3">
                                    <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
                                        <span className="w-10 text-right">{formatTime(currentTime)}</span>
                                        <CustomSlider
                                            min={0}
                                            max={duration || 0}
                                            value={currentTime}
                                            onChange={handleSeek}
                                            className="flex-1 h-3"
                                        />
                                        <span className="w-10">{formatTime(duration)}</span>
                                    </div>
                                </div>

                                {/* Actions row */}
                                <div className="mt-4 md:mt-6 flex flex-wrap items-center gap-4">
                                    <button
                                        onClick={handleLike}
                                        className="group flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-2 text-sm font-medium text-neutral-300 transition-all hover:border-purple-500/50 hover:bg-purple-900/10 hover:text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                                    >
                                        <Heart size={20} className="text-purple-500 group-hover:text-purple-400" />
                                        <span>Like</span>
                                    </button>

                                    <IconButtonWithTooltip label="Download" onClick={handleDownload}>
                                        <Download size={24} />
                                    </IconButtonWithTooltip>
                                    <IconButtonWithTooltip label="Share" onClick={handleShare}>
                                        <Share2 size={24} />
                                    </IconButtonWithTooltip>
                                    <IconButtonWithTooltip label="Add to Playlist" onClick={handleAddToPlaylist}>
                                        <Plus size={24} />
                                    </IconButtonWithTooltip>
                                </div>
                            </div>

                            {/* RIGHT: Cover + Vertical Buttons */}
                            <div className="flex items-center justify-center order-1 md:order-2">
                                <div className="relative h-64 w-64 md:h-[20rem] md:w-[20rem] rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/5 group">
                                    {currentTrack.coverImageUrl ? (
                                        <Image
                                            src={currentTrack.coverImageUrl}
                                            alt={currentTrack.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-neutral-500">
                                            <div className="text-center">
                                                <div className="mb-2 text-4xl">🎵</div>
                                                <div className="text-sm uppercase tracking-widest">No Cover</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
