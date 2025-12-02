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
        // 'popular' could be based on play count if we had it, for now fallback to rating count
        if (sortBy === 'popular') {
            return b.ratings.length - a.ratings.length;
        }
        return 0;
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-white">All Releases</h1>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-400">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-neutral-900 border border-neutral-700 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5 outline-none"
                    >
                        <option value="newest">Newest</option>
                        <option value="popular">Most Popular</option>
                        <option value="rated">Highest Rated</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedTracks.map((track) => {
                    const avgRating = getAverageRating(track.ratings);

                    return (
                        <Link
                            href={`/remix/${track.id}`}
                            key={track.id}
                            className="group relative bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-900/20 hover:-translate-y-1"
                        >
                            <div className="relative aspect-square overflow-hidden">
                                {track.coverImageUrl ? (
                                    <Image
                                        src={track.coverImageUrl}
                                        alt={track.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-500">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300">
                                        <Play fill="white" className="ml-1" />
                                    </div>
                                </div>
                                {track.genre && (
                                    <span className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-medium text-white uppercase tracking-wider border border-white/10">
                                        {track.genre}
                                    </span>
                                )}
                            </div>

                            <div className="p-4 space-y-2">
                                <div>
                                    <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                                        {track.title}
                                    </h3>
                                    <p className="text-sm text-neutral-400 truncate">
                                        {track.artist || "Ram"}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/50">
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Star size={14} fill={avgRating > 0 ? "currentColor" : "none"} />
                                        <span className="text-xs font-medium text-neutral-300">
                                            {avgRating > 0 ? avgRating.toFixed(1) : "-"}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                                        <Calendar size={10} />
                                        {new Date(track.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {sortedTracks.length === 0 && (
                <div className="text-center py-20 text-neutral-500">
                    No releases found.
                </div>
            )}
        </div>
    );
}
