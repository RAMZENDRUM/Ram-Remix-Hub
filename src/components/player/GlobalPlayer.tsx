"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
    Volume2, Volume1, VolumeX, ListMusic, Heart, X, Music, Info
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/formatTime";

// --- Helper Components ---

interface PlayerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean;
    size?: "sm" | "md" | "lg";
    icon: React.ReactNode;
}

const PlayerButton = ({ active, size = "md", icon, className, ...props }: PlayerButtonProps) => {
    const sizeClasses = {
        sm: "w-7 h-7",
        md: "w-9 h-9",
        lg: "w-12 h-12",
    };

    return (
        <button
            className={cn(
                "flex items-center justify-center rounded-full transition-all duration-200 active:scale-95",
                sizeClasses[size],
                active ? "text-purple-400 bg-purple-500/10" : "text-neutral-400 hover:text-white hover:bg-white/5",
                className
            )}
            {...props}
        >
            {icon}
        </button>
    );
};

// --- Main Component ---

export default function GlobalPlayer() {
    const {
        currentTrack,
        isPlaying,
        togglePlay,
        nextTrack,
        prevTrack,
        queue,
        playQueue,
        audioRef,
        isShuffle,
        toggleShuffle,
        loopMode,
        toggleLoopMode,
        likedIds,
        toggleLike,
        currentTime,
        setCurrentTime,
        duration,
        setDuration
    } = usePlayer();

    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isQueueOpen, setIsQueueOpen] = useState(false);
    const [showTrackInfo, setShowTrackInfo] = useState(false);

    // Seekbar State
    // currentTime/duration managed by context
    const [progress, setProgress] = useState(0); // 0–100
    const [isDraggingProgress, setIsDraggingProgress] = useState(false);

    const progressBarRef = useRef<HTMLDivElement>(null);
    const volumeBarRef = useRef<HTMLDivElement>(null);

    // Reset state on track change
    useEffect(() => {
        setCurrentTime(0);
        setProgress(0);
        // Duration will be set by onLoadedMetadata
    }, [currentTrack?.id, setCurrentTime]);

    // Seekbar Handlers
    const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setIsDraggingProgress(true);
        handleProgressChange(e);

        const handleMouseMove = (ev: MouseEvent) => handleProgressChange(ev);
        const handleMouseUp = () => {
            setIsDraggingProgress(false);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleProgressChange = (e: MouseEvent | React.MouseEvent) => {
        if (!progressBarRef.current || !audioRef.current) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        let newProgress = ((e.clientX - rect.left) / rect.width) * 100;
        newProgress = Math.max(0, Math.min(100, newProgress));

        const d = audioRef.current.duration || duration || 1;
        const newTime = (newProgress / 100) * d;

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        setProgress(newProgress);
    };

    // Volume Logic
    const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!volumeBarRef.current || !audioRef.current) return;
        const rect = volumeBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));

        setVolume(percentage);
        audioRef.current.volume = percentage;
        setIsMuted(percentage === 0);
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        if (isMuted) {
            audioRef.current.volume = volume || 0.5;
            setIsMuted(false);
        } else {
            audioRef.current.volume = 0;
            setIsMuted(true);
        }
    };

    if (!currentTrack) return null;

    const isLiked = likedIds.has(currentTrack.id);

    return (
        <>
            {/* QUEUE DRAWER */}
            <AnimatePresence>
                {isQueueOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-28 right-4 z-[5001] w-80 max-h-[60vh] overflow-hidden rounded-3xl bg-[#0f1115]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/80 flex flex-col"
                    >
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Play Queue</h3>
                            <button onClick={() => setIsQueueOpen(false)} className="text-neutral-400 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {queue.map((track, idx) => (
                                <div
                                    key={`${track.id}-${idx}`}
                                    onClick={() => playQueue(queue, idx)}
                                    className={cn(
                                        "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors group",
                                        currentTrack.id === track.id ? "bg-purple-500/20" : "hover:bg-white/5"
                                    )}
                                >
                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                                        {track.coverImageUrl ? (
                                            <Image src={track.coverImageUrl} alt={track.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-500"><Music size={16} /></div>
                                        )}
                                        {currentTrack.id === track.id && isPlaying && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <div className="w-1 h-3 bg-purple-400 mx-[1px] animate-bounce" style={{ animationDelay: '0s' }} />
                                                <div className="w-1 h-4 bg-purple-400 mx-[1px] animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                <div className="w-1 h-2 bg-purple-400 mx-[1px] animate-bounce" style={{ animationDelay: '0.2s' }} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={cn("text-sm font-medium truncate", currentTrack.id === track.id ? "text-purple-300" : "text-neutral-200")}>
                                            {track.title}
                                        </p>
                                        <p className="text-xs text-neutral-500 truncate">{track.artist || "Unknown"}</p>
                                    </div>
                                </div>
                            ))}
                            {queue.length === 0 && (
                                <div className="text-center py-8 text-neutral-500 text-xs">Queue is empty</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TRACK INFO PANEL */}
            <AnimatePresence>
                {showTrackInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-28 left-4 md:left-10 z-[5001] max-w-sm rounded-2xl border border-purple-500/30 bg-[#0f1115]/95 backdrop-blur-xl px-6 py-5 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs uppercase tracking-[0.18em] text-violet-300">
                                Track Info
                            </p>
                            <button onClick={() => setShowTrackInfo(false)} className="text-neutral-400 hover:text-white">
                                <X size={14} />
                            </button>
                        </div>
                        <p className="text-lg font-bold text-white truncate">
                            {currentTrack.title}
                        </p>
                        <p className="text-sm text-gray-400 mb-3 truncate">
                            By {currentTrack.artist || "Unknown Artist"}
                        </p>
                        <div className="h-px w-full bg-gradient-to-r from-violet-500/60 via-fuchsia-500/60 to-sky-400/60 mb-3" />
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Enjoy a premium, neon-styled listening experience. This track is currently
                            playing in your global player at the bottom of the page.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN PLAYER BAR */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 z-[5000] px-2 pb-2 sm:px-4 sm:pb-4 pointer-events-none"
            >
                <div className="pointer-events-auto mx-auto max-w-5xl relative">

                    {/* EDGE NEON BACKLIGHT */}
                    <div
                        className="pointer-events-none absolute inset-0 rounded-[30px]"
                        style={{
                            boxShadow: `
                            0 0 20px rgba(139,92,246,0.3),
                            0 0 40px rgba(236,72,153,0.2)
                        `,
                            background: "transparent",
                            opacity: 0.5,
                        }}
                    />

                    {/* ACTUAL PLAYER */}
                    <div
                        className="relative rounded-[30px] backdrop-blur-2xl"
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(10,10,15,0.96) 0%, rgba(15,15,25,0.98) 100%)",
                            border: "1px solid rgba(139,92,246,0.3)",
                            boxShadow:
                                "0 0 20px rgba(139,92,246,0.4), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 14px 40px rgba(0,0,0,0.9)",
                        }}
                    >
                        {/* Content Container */}
                        <div className="relative z-10 flex items-center justify-between px-4 py-5 md:py-6 gap-4 h-[88px]">

                            {/* LEFT: Track Info */}
                            <div className="flex items-center gap-4 w-[30%] min-w-0">
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0 group">
                                    {currentTrack.coverImageUrl ? (
                                        <Image src={currentTrack.coverImageUrl} alt={currentTrack.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-600"><Music size={24} /></div>
                                    )}
                                </div>
                                <div className="min-w-0 flex flex-col justify-center">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-white font-bold text-sm truncate hover:text-purple-300 transition-colors cursor-pointer">
                                            {currentTrack.title}
                                        </h4>
                                    </div>
                                    <p className="text-neutral-400 text-xs truncate font-medium">{currentTrack.artist || "Unknown Artist"}</p>
                                </div>
                            </div>

                            {/* CENTER: Controls & Seek */}
                            <div className="flex flex-col items-center justify-center flex-1 max-w-md gap-2">
                                {/* Main Buttons */}
                                <div className="flex items-center gap-4 mt-2">
                                    <PlayerButton
                                        size="sm"
                                        icon={<Shuffle size={16} />}
                                        active={isShuffle}
                                        onClick={toggleShuffle}
                                        title="Shuffle"
                                    />
                                    <PlayerButton
                                        size="sm"
                                        icon={<SkipBack size={20} fill="currentColor" />}
                                        onClick={prevTrack}
                                        title="Previous"
                                    />

                                    {/* Play/Pause - Flat Style */}
                                    <button
                                        onClick={togglePlay}
                                        className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-black border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.5)] text-white hover:scale-105 active:scale-95 transition-all"
                                    >
                                        {isPlaying ? (
                                            <Pause size={18} fill="currentColor" />
                                        ) : (
                                            <Play size={18} fill="currentColor" className="ml-1" />
                                        )}
                                    </button>

                                    <PlayerButton
                                        size="sm"
                                        icon={<SkipForward size={20} fill="currentColor" />}
                                        onClick={nextTrack}
                                        title="Next"
                                    />
                                    <PlayerButton
                                        size="sm"
                                        icon={loopMode === 'track' ? <Repeat1 size={16} /> : <Repeat size={16} />}
                                        active={loopMode !== 'off'}
                                        onClick={toggleLoopMode}
                                        title={loopMode === 'track' ? "Loop One" : (loopMode === 'queue' ? "Loop All" : "Loop Off")}
                                    />
                                </div>

                                {/* Seek Bar - New Gradient Version */}
                                <div className="flex flex-col items-center gap-1 w-full max-w-xl mx-auto mt-2">
                                    <div
                                        ref={progressBarRef}
                                        className="relative h-1.5 w-full bg-white/10 rounded-full cursor-pointer group overflow-hidden"
                                        onMouseDown={handleProgressMouseDown}
                                    >
                                        {/* filled bar */}
                                        <div
                                            className="absolute top-0 left-0 h-full rounded-full"
                                            style={{
                                                width: `${progress}%`,
                                                background:
                                                    "linear-gradient(90deg, rgba(139,92,246,0.9) 0%, rgba(236,72,153,0.9) 100%)",
                                                boxShadow: "0 0 12px rgba(139,92,246,0.7)",
                                            }}
                                        />

                                        {/* knob – always perfectly on the edge of the filled part */}
                                        <div
                                            className="absolute top-1/2 w-4 h-4 rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-75"
                                            style={{
                                                left: `${progress}%`,
                                                background: "radial-gradient(circle at 30% 30%, #525252, #000000)",
                                                boxShadow: "0 0 0 1px rgba(255,255,255,0.2) inset, 0 2px 8px rgba(0,0,0,0.8)",
                                            }}
                                        />
                                    </div>

                                    <div className="flex justify-between w-full text-[11px] text-gray-400">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Volume & Actions */}
                            <div className="flex items-center justify-end gap-3 w-[30%] min-w-0">
                                <PlayerButton
                                    size="sm"
                                    icon={<Heart size={18} fill={isLiked ? "currentColor" : "none"} />}
                                    active={isLiked}
                                    onClick={() => toggleLike(currentTrack.id)}
                                    title="Like"
                                />

                                <PlayerButton
                                    size="sm"
                                    icon={<ListMusic size={18} />}
                                    active={isQueueOpen}
                                    onClick={() => setIsQueueOpen(!isQueueOpen)}
                                    title="Queue"
                                />

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowTrackInfo((prev) => !prev)}
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-300"
                                    style={{
                                        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1) inset",
                                    }}
                                >
                                    <Info className="h-4 w-4" />
                                </motion.button>

                                {/* Volume Control */}
                                <div className="hidden md:flex items-center gap-2 group relative">
                                    <button onClick={toggleMute} className="text-neutral-400 hover:text-white transition-colors">
                                        {isMuted || volume === 0 ? <VolumeX size={18} /> : volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />}
                                    </button>
                                    <div
                                        className="w-20 h-6 flex items-center cursor-pointer"
                                        ref={volumeBarRef}
                                        onClick={handleVolumeChange}
                                    >
                                        <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${isMuted ? 0 : volume * 100}%`,
                                                    background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
                                                    boxShadow: "0 0 8px rgba(139,92,246,0.6)"
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <audio
                ref={audioRef}
                src={currentTrack.audioUrl}
                crossOrigin="anonymous"
                onLoadedMetadata={() => {
                    if (!audioRef.current) return;
                    const d = audioRef.current.duration;
                    setDuration(isFinite(d) ? d : 0);
                }}
                onTimeUpdate={() => {
                    if (!audioRef.current || isDraggingProgress) return;

                    const ct = audioRef.current.currentTime;
                    const d = audioRef.current.duration || duration || 1;

                    setCurrentTime(ct);
                    setDuration(isFinite(d) ? d : 0);

                    const p = (ct / d) * 100;
                    setProgress(isFinite(p) ? p : 0);
                }}
                onEnded={nextTrack}
            />
        </>
    );
}
