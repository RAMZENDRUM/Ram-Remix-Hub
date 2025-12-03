'use client';

import React, { useState } from 'react';
import { Play, Music, Disc, Heart, Zap } from 'lucide-react';
import Image from 'next/image';

export default function Playlists() {
    const [activeTab, setActiveTab] = useState('All');

    // Mock data for demonstration
    const playlists = [
        { id: 1, name: "Cyberpunk Vibes", tagline: "Neon-soaked beats for the future.", count: 12, cover: "https://images.unsplash.com/photo-1535478044878-3ed83d5456ef?q=80&w=2069&auto=format&fit=crop", type: "Moods" },
        { id: 2, name: "Chill Lo-Fi", tagline: "Relax, study, and code.", count: 24, cover: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070&auto=format&fit=crop", type: "Genres" },
        { id: 3, name: "High Energy", tagline: "Workout and running mix.", count: 18, cover: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop", type: "Moods" },
        { id: 4, name: "Deep House", tagline: "Late night grooves.", count: 15, cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=2070&auto=format&fit=crop", type: "Genres" },
        { id: 5, name: "Ram's Favorites", tagline: "Handpicked gems.", count: 10, cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop", type: "Featured" },
        { id: 6, name: "Synthwave Drive", tagline: "Retro-future nostalgia.", count: 20, cover: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=2070&auto=format&fit=crop", type: "Genres" },
    ];

    const filteredPlaylists = activeTab === 'All' ? playlists : playlists.filter(p => p.type === activeTab);

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
                            Discover collections tailored for every moment.
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 bg-neutral-900/50 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
                        {['All', 'Moods', 'Genres', 'Featured'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {filteredPlaylists.map((playlist) => (
                        <div
                            key={playlist.id}
                            className="group relative bg-neutral-900/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-900/20 hover:-translate-y-2 cursor-pointer"
                        >
                            {/* Cover Image */}
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <Image
                                    src={playlist.cover}
                                    alt={playlist.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                                />
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
            </div>
        </div>
    );
}
