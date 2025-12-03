"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface Track {
    id: string;
    title: string;
    artist?: string;
    coverImageUrl?: string;
    audioUrl: string;
    genre?: string;
    duration?: number;
}

export type LoopMode = "off" | "track" | "queue";

interface PlayerContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    queue: Track[];
    analyser: AnalyserNode | null;
    setAnalyser: (analyser: AnalyserNode | null) => void;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    playTrack: (track: Track) => void;
    playQueue: (tracks: Track[], startIndex?: number) => void;
    nextTrack: () => void;
    prevTrack: () => void;
    togglePlay: () => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    // New additions
    isShuffle: boolean;
    loopMode: LoopMode;
    toggleShuffle: () => void;
    toggleLoopMode: () => void;
    likedIds: Set<string>;
    toggleLike: (id: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [queue, setQueue] = useState<Track[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

    const [isShuffle, setIsShuffle] = useState(false);
    const [loopMode, setLoopMode] = useState<LoopMode>("off");
    const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);

    // Liked Tracks State
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

    const audioRef = useRef<HTMLAudioElement>(null);

    // Shuffle Logic
    const toggleShuffle = () => {
        setIsShuffle((prev) => {
            const next = !prev;
            if (next) {
                // generate shuffled indices but keep currentIndex in place
                const indices = queue.map((_, i) => i).filter((i) => i !== currentIndex);
                for (let i = indices.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [indices[i], indices[j]] = [indices[j], indices[i]];
                }
                setShuffledOrder([currentIndex, ...indices]);
            } else {
                setShuffledOrder([]);
            }
            return next;
        });
    };

    // Loop Logic
    const toggleLoopMode = () => {
        setLoopMode((prev) => {
            if (prev === "off") return "track";
            if (prev === "track") return "queue";
            return "off";
        });
    };

    // Like Logic
    const toggleLike = (id: string) => {
        setLikedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Helper functions
    const getOrder = () => {
        if (isShuffle && shuffledOrder.length === queue.length) {
            return shuffledOrder;
        }
        return queue.map((_, i) => i);
    };

    const playTrackAt = (index: number) => {
        const order = getOrder();
        const targetIndex = order[index];
        if (targetIndex == null) return;

        setCurrentIndex(targetIndex);
        setCurrentTrack(queue[targetIndex]);
        setIsPlaying(true);
    };

    const handleNext = () => {
        const order = getOrder();
        const logicalIndex = order.indexOf(currentIndex);

        if (logicalIndex === -1) return;

        if (logicalIndex === order.length - 1) {
            if (loopMode === "queue") {
                playTrackAt(0);
            } else {
                // end of queue, no loop
                setIsPlaying(false);
                setCurrentTime(0);
            }
        } else {
            playTrackAt(logicalIndex + 1);
        }
    };

    const handlePrev = () => {
        const order = getOrder();
        const logicalIndex = order.indexOf(currentIndex);
        if (logicalIndex <= 0) {
            // either restart current track or go to last if queue loop
            if (loopMode === "queue") {
                playTrackAt(order.length - 1);
            } else {
                if (audioRef.current) audioRef.current.currentTime = 0;
            }
        } else {
            playTrackAt(logicalIndex - 1);
        }
    };

    // onEnded behavior
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onEnded = () => {
            if (loopMode === "track") {
                audio.currentTime = 0;
                audio.play();
                return;
            }
            handleNext();
        };

        audio.addEventListener("ended", onEnded);
        return () => audio.removeEventListener("ended", onEnded);
    }, [loopMode, currentIndex, queue, isShuffle, shuffledOrder]); // Added dependencies for handleNext closure

    const playTrack = (track: Track) => {
        setQueue([track]);
        setCurrentIndex(0);
        setCurrentTrack(track);
        setIsPlaying(true);
        // Reset shuffle when playing a new single track
        setIsShuffle(false);
        setShuffledOrder([]);
    };

    const playQueue = (tracks: Track[], startIndex = 0) => {
        setQueue(tracks);
        setCurrentIndex(startIndex);
        setCurrentTrack(tracks[startIndex]);
        setIsPlaying(true);
        // Reset shuffle when playing a new queue
        setIsShuffle(false);
        setShuffledOrder([]);
    };

    const nextTrack = () => {
        handleNext();
    };

    const prevTrack = () => {
        // If currently playing more than 3 seconds, restart track
        if (currentTime > 3) {
            setCurrentTime(0);
            if (audioRef.current) audioRef.current.currentTime = 0;
            return;
        }
        handlePrev();
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <PlayerContext.Provider value={{
            currentTrack,
            isPlaying,
            currentTime,
            duration,
            queue,
            analyser,
            setAnalyser,
            audioRef,
            playTrack,
            playQueue,
            nextTrack,
            prevTrack,
            togglePlay,
            setIsPlaying,
            setCurrentTime,
            setDuration,
            isShuffle,
            loopMode,
            toggleShuffle,
            toggleLoopMode,
            likedIds,
            toggleLike
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
}
