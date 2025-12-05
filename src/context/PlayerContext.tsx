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
            if (prev) {
                // Turning off
                setShuffledOrder([]);
                return false;
            } else {
                // Turning on
                const validCurrent = currentIndex >= 0 && currentIndex < queue.length ? currentIndex : 0;
                const indices = queue.map((_, i) => i).filter((i) => i !== validCurrent);

                // Fisher-Yates Shuffle
                for (let i = indices.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [indices[i], indices[j]] = [indices[j], indices[i]];
                }

                setShuffledOrder([validCurrent, ...indices]);
                return true;
            }
        });
    };

    // Loop Logic (Cycle: Off -> Queue -> Track)
    const toggleLoopMode = () => {
        setLoopMode((prev) => {
            if (prev === "off") return "queue";
            if (prev === "queue") return "track";
            return "off";
        });
    };

    // Saved Likes Logic (Persisted)
    const toggleLike = async (id: string) => {
        // Optimistic Update
        setLikedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

        // Sync with DB
        try {
            await fetch('/api/user/likes', {
                method: 'POST',
                body: JSON.stringify({ trackId: id }),
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            console.error("Failed to sync like", e);
        }
    };

    // Load Likes on Mount
    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const res = await fetch('/api/user/likes');
                if (res.ok) {
                    const data = await res.json();
                    setLikedIds(new Set(data.likes));
                }
            } catch (e) {
                console.error("Failed to fetch likes", e);
            }
        };
        fetchLikes();
    }, []);

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

    // Sync Loop Attribute
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.loop = (loopMode === "track");
        }
    }, [loopMode]);

    // Record History logic rewritten to wait for valid duration
    const hasRecordedRef = useRef(false);

    // Reset recording flag when track changes
    useEffect(() => {
        hasRecordedRef.current = false;
    }, [currentTrack?.id]);

    // Trigger recording when duration is available
    useEffect(() => {
        if (currentTrack?.id && duration > 0 && !hasRecordedRef.current) {
            const record = async () => {
                try {
                    await fetch('/api/user/history', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            trackId: currentTrack.id,
                            durationMs: Math.floor(duration * 1000)
                        })
                    });
                    hasRecordedRef.current = true;
                } catch (err) {
                    console.error("Failed to record history", err);
                }
            };
            record();
        }
    }, [currentTrack?.id, duration]);

    // onEnded behavior
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onEnded = () => {
            // If loopMode is 'track', audio.loop is true, so 'ended' event won't fire.
            handleNext();
        };

        audio.addEventListener("ended", onEnded);
        return () => audio.removeEventListener("ended", onEnded);
    }, [loopMode, currentIndex, queue, isShuffle, shuffledOrder]);

    // Time Update & Loop Record Logic
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        let lastTime = 0;
        const onTimeUpdate = () => {
            const now = audio.currentTime;
            setCurrentTime(now);

            // Sync duration state if not set (helper for robustness)
            if (audio.duration && audio.duration !== duration) {
                setDuration(audio.duration);
            }

            // Detect Loop Restart (track mode only)
            // If we jumped from near end (> duration - 1s) to start (< 0.5s) naturally
            if (loopMode === 'track' && audio.duration > 0) {
                if (lastTime > audio.duration - 1.0 && now < 0.5) {
                    // Confirmed Loop -> Record Play
                    fetch('/api/user/history', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            trackId: currentTrack?.id,
                            durationMs: Math.floor(audio.duration * 1000)
                        })
                    }).catch(e => console.error("Loop record failed", e));
                }
            }
            lastTime = now;
        };

        audio.addEventListener('timeupdate', onTimeUpdate);
        return () => audio.removeEventListener('timeupdate', onTimeUpdate);
    }, [loopMode, currentTrack?.id, duration]);

    // Tab Key Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Tab") {
                e.preventDefault(); // Prevent focus switching
                togglePlay();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPlaying]); // Re-bind if isPlaying changes (though togglePlay is stable, this is safe)

    // Audio Context & Visualizer Setup
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

    useEffect(() => {
        if (isPlaying && !analyser && audioRef.current) {
            try {
                // Initialize AudioContext on first play (user interaction)
                if (!audioContextRef.current) {
                    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                    audioContextRef.current = new AudioContextClass();
                }

                const ctx = audioContextRef.current;
                if (ctx.state === 'suspended') {
                    ctx.resume();
                }

                // Create Analyser
                const newAnalyser = ctx.createAnalyser();
                newAnalyser.fftSize = 256;

                // Connect Source
                if (!sourceNodeRef.current) {
                    sourceNodeRef.current = ctx.createMediaElementSource(audioRef.current);
                    sourceNodeRef.current.connect(newAnalyser);
                    newAnalyser.connect(ctx.destination);
                } else {
                    // If source already exists, just reconnect it to the new analyser if needed
                    // But typically we just create this once. 
                    // If we are here, it means analyser was null.
                    sourceNodeRef.current.connect(newAnalyser);
                    newAnalyser.connect(ctx.destination);
                }

                setAnalyser(newAnalyser);
            } catch (error) {
                console.error("Error initializing audio context:", error);
            }
        }
    }, [isPlaying, analyser]);

    // Sync Play/Pause with Audio Element
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch((e) => {
                        // AbortError is expected if we pause while loading/playing or load new track
                        const msg = e.message || "";
                        if (e.name === 'AbortError' || msg.includes('interrupted')) {
                            // benign error, ignore
                        } else {
                            console.error("Play error:", e);
                        }
                    });
                }

                // Resume context if needed
                if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                    audioContextRef.current.resume();
                }
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrack]);

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
