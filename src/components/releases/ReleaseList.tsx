"use client";

import React, { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import TrackRow from './TrackRow';
import { usePlayer } from '@/context/PlayerContext';

interface Track {
    id: string;
    title: string;
    artist: string | null;
    genre: string | null;
    coverImageUrl: string | null;
    createdAt: Date;
    ratings: { rating: number }[];
    type?: string;
    audioUrl: string;
    description: string;
}

interface ReleaseListProps {
    initialTracks: Track[];
}

export function ReleaseList({ initialTracks }: ReleaseListProps) {
    const { playQueue, togglePlay, isPlaying, currentTrack } = usePlayer();
    const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rated'>('newest');

    const getAverageRating = (ratings: { rating: number }[]) => {
        if (ratings.length === 0) return 0;
        return ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;
    };

    const sortedTracks = useMemo(() => {
        return [...initialTracks].sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            if (sortBy === 'rated') {
                return getAverageRating(b.ratings) - getAverageRating(a.ratings);
            }
            if (sortBy === 'popular') {
                return b.ratings.length - a.ratings.length;
            }
            return 0;
        });
    }, [initialTracks, sortBy]);

    const handlePlay = (track: Track) => {
        if (currentTrack?.id === track.id) {
            togglePlay();
            return;
        }
        const index = sortedTracks.findIndex(t => t.id === track.id);
        if (index !== -1) {
            // Need to cast track to match PlayerContext Track type if they differ slightly
            // Assuming they are compatible enough or identical
            playQueue(sortedTracks as any, index);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 pb-16">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent tracking-tight mb-2">
                        All Releases
                    </h1>
                    <p className="text-sm text-neutral-400 font-medium tracking-wide">
                        {sortedTracks.length} TRACKS • SORTED BY {sortBy.toUpperCase()}
                    </p>
                </div>

                <div className="relative z-20">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="appearance-none bg-neutral-900/80 backdrop-blur-md border border-white/10 text-white text-sm rounded-full pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/50 hover:bg-white/5 transition-colors cursor-pointer shadow-lg shadow-purple-900/10"
                    >
                        <option value="newest">Newest</option>
                        <option value="popular">Most Popular</option>
                        <option value="rated">Highest Rated</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                        <TrendingUp size={14} />
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="flex flex-col gap-3">
                {sortedTracks.map((track, index) => (
                    <TrackRow
                        key={track.id}
                        track={track}
                        index={index}
                        getAverageRating={getAverageRating}
                        isPlaying={currentTrack?.id === track.id && isPlaying}
                        onPlay={() => handlePlay(track)}
                    />
                ))}
            </div>

            {/* Empty State */}
            {sortedTracks.length === 0 && (
                <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-900/50 mb-4 border border-white/10">
                        <TrendingUp className="text-neutral-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No releases yet</h3>
                    <p className="text-neutral-500 max-w-xs mx-auto">
                        Sign in as admin to upload your first track.
                    </p>
                </div>
            )}
        </div>
    );
}
