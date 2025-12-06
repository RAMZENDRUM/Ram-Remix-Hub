'use client';

import React, { useState, useEffect } from 'react';
import { Play, Music } from 'lucide-react';
import Image from 'next/image';
import CreatePlaylistModal from '@/components/ui/CreatePlaylistModal';

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
    const [curatedPlaylists, setCuratedPlaylists] = useState<GenrePlaylist[]>([]);
    const [userPlaylists, setUserPlaylists] = useState<GenrePlaylist[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchPlaylists = async () => {
        try {
            const response = await fetch('/api/playlists');
            if (response.ok) {
                const data = await response.json();
                setCuratedPlaylists(data.curated || []);
                setUserPlaylists(data.user || []);
            }
        } catch (error) {
            console.error('Error loading playlists:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const handleCreatePlaylist = async (name: string) => {
        try {
            await fetch('/api/playlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            fetchPlaylists();
        } catch (error) {
            console.error('Failed to create playlist:', error);
        }
    };

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
                {/* Curated Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 pl-2 border-l-4 border-purple-500">
                        From Ram Remix Hub
                    </h2>

                    {loading ? (
                        <div className="text-neutral-500">Loading...</div>
                    ) : curatedPlaylists.length === 0 ? (
                        <div className="text-neutral-500">No curated playlists available.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {curatedPlaylists.map((playlist) => (
                                <PlaylistCard key={playlist.id} playlist={playlist} />
                            ))}
                        </div>
                    )}
                </section>

                {/* User Playlists Section */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white pl-2 border-l-4 border-blue-500">
                            Your Playlists
                        </h2>
                        <button
                            className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors border border-neutral-700"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            + New Playlist
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-neutral-500">Loading...</div>
                    ) : userPlaylists.length === 0 ? (
                        <div className="text-neutral-500 py-10 border border-dashed border-neutral-800 rounded-xl text-center">
                            You haven't created any playlists yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {userPlaylists.map((playlist) => (
                                <PlaylistCard key={playlist.id} playlist={playlist} />
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {isCreateModalOpen && (
                <CreatePlaylistModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreatePlaylist}
                />
            )}
        </div>
    );
}

// Reusable Card Component
const PlaylistCard = ({ playlist }: { playlist: GenrePlaylist }) => (
    <div className="group relative bg-neutral-900/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-900/20 hover:-translate-y-2 cursor-pointer">
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
                {playlist.tagline || `${playlist.count} songs`}
            </p>

            {/* Hover Reveal Line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>
    </div>
);
