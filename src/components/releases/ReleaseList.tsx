"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Star, Calendar, TrendingUp } from 'lucide-react';

interface Track {
    id: string;
    title: string;
    artist: string | null;
    genre: string | null;
    coverImageUrl: string | null;
    createdAt: Date;
    ratings: { rating: number }[];
}

interface ReleaseListProps {
    initialTracks: Track[];
}

export function ReleaseList({ initialTracks }: ReleaseListProps) {
    const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rated'>('newest');

    const getAverageRating = (ratings: { rating: number }[]) => {
        if (ratings.length === 0) return 0;
        return ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;
    };

    const sortedTracks = [...initialTracks].sort((a, b) => {
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

    const getInitials = (title: string) => {
        return title
            .split(' ')
            .map(word => word[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent tracking-tight mb-2">
                        All Releases
                    </h1>
                    <p className="text-sm text-neutral-400 font-medium tracking-wide">
                        {sortedTracks.length} TRACKS • SORTED BY {sortBy.toUpperCase()}
                    </p>
                </div>

                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="appearance-none bg-neutral-900/80 backdrop-blur-md border border-white/10 text-white text-sm rounded-full pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/50 hover:bg-white/5 transition-colors cursor-pointer"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedTracks.map((track) => {
                    const avgRating = getAverageRating(track.ratings);

                    return (
                        <Link
                            href={`/remix/${track.id}`}
                            key={track.id}
                            className="group relative bg-neutral-900/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/20 hover:-translate-y-1"
                        >
                            <div className="relative aspect-square overflow-hidden">
                                {track.coverImageUrl ? (
                                    <Image
                                        src={track.coverImageUrl}
                                        alt={track.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-white/10 group-hover:text-white/20 transition-colors">
                                            {getInitials(track.title)}
                                        </span>
                                    </div>
                                )}

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl transform scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-purple-600 hover:border-purple-500">
                                        <Play fill="currentColor" className="ml-1 w-6 h-6" />
                                    </div>
                                </div>

                                {track.genre && (
                                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-semibold text-white uppercase tracking-wider border border-white/10 shadow-lg">
                                        {track.genre}
                                    </span>
                                )}
                            </div>

                            <div className="p-4 space-y-1.5">
                                <div>
                                    <h3 className="font-bold text-white truncate group-hover:text-purple-400 transition-colors text-lg leading-tight">
                                        {track.title}
                                    </h3>
                                    <p className="text-sm text-neutral-400 truncate font-medium">
                                        {track.artist || "Ram"}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/5">
                                    <div className="flex items-center gap-1.5 text-yellow-500">
                                        <Star size={14} fill={avgRating > 0 ? "currentColor" : "none"} />
                                        <span className="text-xs font-bold text-neutral-300">
                                            {avgRating > 0 ? avgRating.toFixed(1) : "NR"}
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-medium text-neutral-500 flex items-center gap-1.5 uppercase tracking-wide">
                                        <Calendar size={10} />
                                        {new Date(track.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {sortedTracks.length === 0 && (
                <div className="text-center py-32">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-900 mb-4">
                        <TrendingUp className="text-neutral-600" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No releases found</h3>
                    <p className="text-neutral-500">Check back later for new tracks.</p>
                </div>
            )}
        </div>
    );
}
