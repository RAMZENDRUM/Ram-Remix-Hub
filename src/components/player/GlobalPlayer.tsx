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
            <footer className={cn(
                "fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] max-w-[900px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_25px_rgba(0,0,0,0.4)] z-50 transition-all duration-300",
                miniMode ? "py-2" : ""
            )}>
                <audio
                    ref={audioRef}
                    src={currentTrack.audioUrl}
                    crossOrigin="anonymous"
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                />

                {/* Left: Track Info */}
                <div className="flex items-center gap-4 w-[30%] min-w-0">
                    <div className={cn(
                        "relative overflow-hidden rounded-xl bg-neutral-800/80 flex-shrink-0 border border-white/10 transition-all duration-300",
                        miniMode ? "h-10 w-10" : "h-14 w-14"
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
                        <span className="truncate text-sm font-medium text-white hover:underline cursor-pointer">
                            {currentTrack.title}
                        </span>
                        {!miniMode && (
                            <div className="flex items-center gap-2 text-xs text-white/50">
                                <span className="truncate max-w-[120px]">
                                    {currentTrack.artist || "Unknown Artist"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center: Controls + Seek */}
                <div className="flex flex-col flex-1 items-center gap-2 max-w-[60%]">
                    {!miniMode && (
                        <div className="flex items-center gap-6">
                            <button
                                onClick={toggleShuffle}
                                className={`transition-colors ${isShuffle ? 'text-purple-400' : 'text-white/40 hover:text-white'}`}
                            >
                                <Shuffle size={18} />
                            </button>

                            <button
                                onClick={prevTrack}
                                className="text-white/70 hover:text-white transition-colors active:scale-95"
                            >
                                <SkipBack size={22} fill="currentColor" />
                            </button>

                            <PlayButton
                                variant="circle"
                                isPlaying={isPlaying}
                                onClick={togglePlay}
                                className="w-12 h-12 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 transition flex items-center justify-center backdrop-blur-md shadow-none"
                            />

                            <button
                                onClick={nextTrack}
                                className="text-white/70 hover:text-white transition-colors active:scale-95"
                            >
                                <SkipForward size={22} fill="currentColor" />
                            </button>

                            <button
                                onClick={toggleLoopMode}
                                className={`transition-colors relative ${loopMode !== 'off' ? 'text-purple-400' : 'text-white/40 hover:text-white'}`}
                            >
                                <Repeat size={18} />
                                {loopMode === 'track' && <span className="absolute text-[8px] font-bold top-0 right-0">1</span>}
                            </button>
                        </div>
                    )}

                    <div className="flex w-full items-center gap-3 text-[10px] font-medium text-white/40">
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
                <div className="flex items-center gap-4 w-[30%] justify-end">
                    <div className="flex items-center gap-2 group">
                        <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors">
                            {isMuted || volume === 0 ? <VolumeX size={18} /> : volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />}
                        </button>
                        <CustomSlider
                            min={0}
                            max={100}
                            value={isMuted ? 0 : volume * 100}
                            onChange={handleVolumeChange}
                            className="w-20"
                        />
                    </div>

                    {!miniMode && (
                        <div className="hidden md:flex items-center gap-2">
                            <button
                                onClick={() => setQueueOpen(prev => !prev)}
                                className={`p-2 rounded-full transition-colors ${queueOpen ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                            >
                                <ListMusic size={18} />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => setMiniMode(prev => !prev)}
                        className="text-white/40 hover:text-white transition-colors p-2"
                    >
                        {miniMode ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                    </button>
                </div>
            </footer>

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
