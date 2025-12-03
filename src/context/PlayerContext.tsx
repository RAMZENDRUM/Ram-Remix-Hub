"use client";

import React, { createContext, useContext, useState, useRef } from 'react';

interface Track {
    id: string;
    title: string;
    artist?: string;
    coverImageUrl?: string;
    audioUrl: string;
    genre?: string;
    duration?: number;
}

interface PlayerContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    queue: Track[];
    playTrack: (track: Track) => void;
    playQueue: (tracks: Track[], startIndex?: number) => void;
    nextTrack: () => void;
    prevTrack: () => void;
    togglePlay: () => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [queue, setQueue] = useState<Track[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const playTrack = (track: Track) => {
        // If playing a single track not in queue, make a queue of 1
        setQueue([track]);
        setCurrentIndex(0);
        setCurrentTrack(track);
        setIsPlaying(true);
    };

    const playQueue = (tracks: Track[], startIndex = 0) => {
        setQueue(tracks);
        setCurrentIndex(startIndex);
        setCurrentTrack(tracks[startIndex]);
        setIsPlaying(true);
    };

    const nextTrack = () => {
        if (queue.length === 0 || currentIndex === -1) return;

        const nextIndex = currentIndex + 1;
        if (nextIndex < queue.length) {
            setCurrentIndex(nextIndex);
            setCurrentTrack(queue[nextIndex]);
            setIsPlaying(true);
        } else {
            // End of queue
            setIsPlaying(false);
            setCurrentTime(0);
        }
    };

    const prevTrack = () => {
        if (queue.length === 0 || currentIndex === -1) return;

        // If currently playing more than 3 seconds, restart track
        if (currentTime > 3) {
            setCurrentTime(0);
            return;
        }

        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
            setCurrentIndex(prevIndex);
            setCurrentTrack(queue[prevIndex]);
            setIsPlaying(true);
        } else {
            // Start of queue, just restart
            setCurrentTime(0);
        }
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
            playTrack,
            playQueue,
            nextTrack,
            prevTrack,
            togglePlay,
            setIsPlaying,
            setCurrentTime,
            setDuration
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
