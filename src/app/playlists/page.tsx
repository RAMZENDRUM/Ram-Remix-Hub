'use client';

import React, { useState, useEffect } from 'react';
import { Play, Music } from 'lucide-react';
import Image from 'next/image';

interface Track {
    id: string;
    title: string;
    artist: string | null;
    genre: string | null;
    coverImageUrl: string | null;
    createdAt: string;
}

interface GenrePlaylist {
    id: string;
    name: string;
    tagline: string;
    count: number;
    cover: string | null;
}

export default function Playlists() {
    const [playlists, setPlaylists] = useState<GenrePlaylist[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const response = await fetch('/api/tracks');
                if (!response.ok) throw new Error('Failed to fetch tracks');
                const tracks: Track[] = await response.json();

                // Group by genre
                const genreGroups: { [key: string]: Track[] } = {};
                tracks.forEach(track => {
                    const genre = track.genre || 'Unknown';
                    if (!genreGroups[genre]) {
                        genreGroups[genre] = [];
                    }
                    genreGroups[genre].push(track);
                });

                // Create playlist objects
                const generatedPlaylists: GenrePlaylist[] = Object.keys(genreGroups).map((genre, index) => {
                    const genreTracks = genreGroups[genre];
                    // Sort by newest first to get the latest cover
                    genreTracks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                    const latestTrack = genreTracks[0];

                    return {
                        id: `genre-${index}`,
                        name: genre,
                        tagline: `Latest: ${latestTrack.title}`,
                        count: genreTracks.length,
                        cover: latestTrack.coverImageUrl
                    };
                });

                setPlaylists(generatedPlaylists);
            } catch (error) {
                console.error('Error loading playlists:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTracks();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4">
            <div className="container mx-auto max-w-7xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent tracking-tight mb-3">
                            Curated Playlists
                        </h1>
                        <p className="text-neutral-400 text-lg font-light">
                            Collections organized by genre.
                        </p>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20 text-neutral-500">Loading playlists...</div>
                ) : playlists.length === 0 ? (
                    <div className="text-center py-20 text-neutral-500">
                        No playlists found. Upload tracks to see them here.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {playlists.map((playlist) => (
                            <div
                                key={playlist.id}
                                className="group relative bg-neutral-900/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-900/20 hover:-translate-y-2 cursor-pointer"
                            >
                                {/* Cover Image */}
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    {playlist.cover ? (
                                        <Image
                                            src={playlist.cover}
                                            alt={playlist.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-500">
                                            <Music size={48} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                    {/* Floating Play Icon */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl hover:bg-purple-600 hover:border-purple-500 transition-colors">
                                            <Play fill="currentColor" className="ml-1 w-6 h-6" />
                                        </div>
                                    </div>

                                    {/* Track Count Badge */}
                                    <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider border border-white/10 flex items-center gap-1.5">
                                        <Music size={10} />
                                        {playlist.count} Tracks
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-5 relative">
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                                        {playlist.name}
                                    </h3>
                                    <p className="text-sm text-neutral-400 font-light line-clamp-1 group-hover:text-neutral-300 transition-colors">
                                        {playlist.tagline}
                                    </p>

                                    {/* Hover Reveal Line */}
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
