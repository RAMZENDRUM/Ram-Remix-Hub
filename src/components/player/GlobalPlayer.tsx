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
import { PlayButton } from "@/components/ui/PlayButton";
import { formatTime } from "@/lib/formatTime";
import { TrackInfoOverlay } from "@/components/track-info-overlay";

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
            <input
                type="range"
                min={min}
                max={max}
                step={0.01}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full accent-white cursor-pointer transition-all duration-200 ease-out"
                style={{
                    WebkitAppearance: "none",
                    background: `linear-gradient(to right, rgba(255,255,255,0.9) ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`,
                    height: "4px", // Default height
                    borderRadius: "10px",
                }}
                onMouseEnter={(e) => e.currentTarget.style.height = "8px"}
                onMouseLeave={(e) => e.currentTarget.style.height = "4px"}
                onTouchStart={(e) => e.currentTarget.style.height = "8px"}
                onTouchEnd={(e) => e.currentTarget.style.height = "4px"}
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
        queue,
        setAnalyser,
        audioRef, // Use shared ref
        isShuffle,
        toggleShuffle,
        loopMode,
        toggleLoopMode,
        likedIds,
        toggleLike
    } = usePlayer();
    const { showToast } = useToast();

    // const audioRef = useRef<HTMLAudioElement>(null); // Removed local ref
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    // Removed local shuffle/repeat state

    // New states for right-side buttons
    const [queueOpen, setQueueOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [miniMode, setMiniMode] = useState(false);

    // Initialize Audio Context and Analyser
    useEffect(() => {
        if (!audioRef.current) return;

        const initAudioContext = () => {
            // Explicit check to satisfy TypeScript
            if (!audioRef.current) return;

            if (!audioContextRef.current) {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AudioContext();

                const analyser = audioContextRef.current.createAnalyser();
                // Elite Visualizer Settings
                analyser.fftSize = 2048;
                analyser.smoothingTimeConstant = 0.8;

                sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
                sourceRef.current.connect(analyser);
                analyser.connect(audioContextRef.current.destination);

                setAnalyser(analyser);
            } else if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
        };

        // Initialize on user interaction to comply with autoplay policies
        const handleInteraction = () => {
            initAudioContext();
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, [setAnalyser, audioRef, currentTrack]); // Added currentTrack dependency

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
            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            audioRef.current.play().catch(e => console.error("Play error:", e));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, currentTrack, audioRef]);

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
    }, [currentTrack, audioRef]);

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

    // Action Handlers
    const handleLike = () => {
        if (currentTrack) {
            toggleLike(currentTrack.id);
            // Optional: Toast is handled by UI feedback usually, but we can keep it if desired
            // showToast({ variant: "success", message: likedIds.has(currentTrack.id) ? "Removed from Liked Songs" : "Added to Liked Songs" });
        }
    };

    const handleDownload = () => {
        if (!currentTrack?.audioUrl) return;
        const link = document.createElement('a');
        link.href = currentTrack.audioUrl;
        link.download = `${currentTrack.title}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast({ variant: "success", message: "Download started" });
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        showToast({ variant: "success", message: "Link copied to clipboard" });
    };

    const handleAddToPlaylist = () => {
        showToast({ variant: "success", message: "Added to Playlist" });
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
    const isLiked = likedIds.has(currentTrack.id);

    return (
        <>
            <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none">
                <div className="pointer-events-auto relative flex w-full max-w-4xl items-center gap-4 rounded-2xl bg-black/65 backdrop-blur-2xl border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.9)] px-4 py-3 transition-all duration-300">
                    {/* NEON EDGE */}
                    <div className="pointer-events-none absolute -inset-px rounded-2xl bg-[conic-gradient(from_180deg_at_50%_50%,rgba(56,189,248,0.7),rgba(168,85,247,0.7),rgba(56,189,248,0.7))] opacity-40 blur-[6px]" />

                    <div className="relative z-10 flex w-full items-center gap-4">
                        <audio
                            ref={audioRef}
                            src={currentTrack.audioUrl}
                            crossOrigin="anonymous"
                            onLoadedMetadata={handleLoadedMetadata}
                            onTimeUpdate={handleTimeUpdate}
                        />

                        {/* Left: Track Info */}
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-white/10 flex-shrink-0">
                                {currentTrack.coverImageUrl ? (
                                    <Image
                                        src={currentTrack.coverImageUrl}
                                        alt={currentTrack.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-[8px] text-neutral-400">
                                        No Art
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white cursor-pointer hover:underline" onClick={() => setInfoOpen(true)}>
                                    {currentTrack.title}
                                </p>
                                <p className="truncate text-xs text-white/50">
                                    {currentTrack.artist || "Unknown Artist"}
                                </p>
                            </div>
                        </div>

                        {/* Center: Controls */}
                        <div className="flex flex-1 flex-col items-center gap-1 max-w-md">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={prevTrack}
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition border border-white/10 text-white/80 hover:text-white"
                                >
                                    <SkipBack size={14} fill="currentColor" />
                                </button>

                                <button
                                    onClick={togglePlay}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-white/90 to-white/60 shadow-[0_10px_25px_rgba(0,0,0,0.9)] relative hover:scale-105 transition-transform"
                                >
                                    <div className="absolute inset-[2px] rounded-full bg-black/90 flex items-center justify-center">
                                        {isPlaying ? (
                                            <Pause size={14} className="text-white fill-white" />
                                        ) : (
                                            <Play size={14} className="text-white fill-white ml-0.5" />
                                        )}
                                    </div>
                                </button>

                                <button
                                    onClick={nextTrack}
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition border border-white/10 text-white/80 hover:text-white"
                                >
                                    <SkipForward size={14} fill="currentColor" />
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="flex w-full items-center gap-2">
                                <span className="text-[10px] text-white/40 tabular-nums w-8 text-right">{formatTime(currentTime)}</span>
                                <div className="relative flex-1 h-3 flex items-center group">
                                    <CustomSlider
                                        min={0}
                                        max={duration || 0}
                                        value={currentTime}
                                        onChange={handleSeek}
                                        className="w-full"
                                    />
                                </div>
                                <span className="text-[10px] text-white/40 tabular-nums w-8">{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Right: Volume & Extras */}
                        <div className="hidden sm:flex items-center gap-3 flex-1 justify-end">
                            <div className="flex items-center gap-2 w-24 group">
                                <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                                    {isMuted || volume === 0 ? <VolumeX size={14} /> : volume < 0.5 ? <Volume1 size={14} /> : <Volume2 size={14} />}
                                </button>
                                <CustomSlider
                                    min={0}
                                    max={100}
                                    value={isMuted ? 0 : volume * 100}
                                    onChange={handleVolumeChange}
                                    className="flex-1"
                                />
                            </div>

                            <button
                                onClick={() => setInfoOpen(prev => !prev)}
                                className={`h-7 w-7 rounded-full border border-white/10 flex items-center justify-center transition ${infoOpen ? 'bg-white/20 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                            >
                                <Info size={14} />
                            </button>

                            <button
                                onClick={() => setQueueOpen(prev => !prev)}
                                className={`h-7 w-7 rounded-full border border-white/10 flex items-center justify-center transition ${queueOpen ? 'bg-white/20 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                            >
                                <ListMusic size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Track Info Overlay */}
            <TrackInfoOverlay
                open={infoOpen}
                onClose={() => setInfoOpen(false)}
                trackId={currentTrack?.id ?? ""}
                title={currentTrack?.title ?? ""}
                artist={currentTrack?.artist ?? ""}
                coverUrl={currentTrack?.coverImageUrl ?? null}
                duration={duration}
                currentTime={currentTime}
                isPlaying={isPlaying}
                isLiked={isLiked}
                isShuffle={isShuffle}
                isLoop={loopMode !== "off"}
                volume={volume * 100}
                onPlayPause={togglePlay}
                onPrev={prevTrack}
                onNext={nextTrack}
                onSeek={handleSeek}
                onVolumeChange={handleVolumeChange}
                onToggleLike={toggleLike}
                onToggleShuffle={toggleShuffle}
                onToggleLoop={toggleLoopMode}
            />
        </>
    );
}
