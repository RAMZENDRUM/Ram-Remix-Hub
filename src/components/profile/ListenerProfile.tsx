'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
    Edit, LogOut, Globe, Check,
    ListMusic, Heart, Play, Clock, User as UserIcon
} from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";
import RemixCard from '@/components/RemixCard';
import { EditProfileModal } from './EditProfileModal';

interface ListenerProfileProps {
    user: any;
}

export function ListenerProfile({ user }: ListenerProfileProps) {
    const { language, setLanguage, t } = useLanguage();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // State for Listener Data
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loadingFavorites, setLoadingFavorites] = useState(true);

    // Mock Data for Listener Profile
    const userPlaylists = [
        { id: 'p1', name: 'My Chill Mix', count: 12, cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80' },
        { id: 'p2', name: 'Workout Energy', count: 24, cover: 'https://images.unsplash.com/photo-1534258936925-c48947387e3b?w=800&q=80' },
    ];

    const history = [
        { id: 'h1', title: 'Neon Nights', artist: 'Ram', time: '20 mins ago', cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80' },
        { id: 'h2', title: 'Cyberpunk 2077 Theme', artist: 'CDPR', time: '1 hour ago', cover: 'https://images.unsplash.com/photo-1535478044878-3ed83d5456ef?w=800&q=80' },
        { id: 'h3', title: 'Nightcall', artist: 'Kavinsky', time: '3 hours ago', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80' },
    ];

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) return;
            try {
                const res = await fetch('/api/user/favorites');
                if (res.ok) {
                    const data = await res.json();
                    setFavorites(data);
                }
            } catch (error) {
                console.error("Failed to fetch favorites", error);
            } finally {
                setLoadingFavorites(false);
            }
        };

        fetchFavorites();
    }, [user]);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-8">

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
            />

            {/* 1. Listener Header */}
            <section className="relative rounded-[2.5rem] bg-neutral-900/60 border border-white/10 backdrop-blur-2xl p-8 md:p-10 overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-purple-500 to-blue-500">
                            <div className="w-full h-full rounded-full bg-black p-1">
                                <div className="w-full h-full rounded-full overflow-hidden relative bg-neutral-800 flex items-center justify-center">
                                    {user.image ? (
                                        <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={32} className="text-neutral-400" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h1 className="text-3xl font-bold text-white tracking-tight">{user.name}</h1>
                        <p className="text-neutral-400 font-medium">{user.email}</p>

                        {/* Extra Info: Age, Country, Genres */}
                        {(user.age || user.country || (user.favoriteGenres && user.favoriteGenres.length > 0)) && (
                            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-neutral-400">
                                {user.age && <span>Age: <span className="text-white/80">{user.age}</span></span>}
                                {user.country && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-neutral-600" />
                                        <span>{user.country}</span>
                                    </>
                                )}
                                {user.favoriteGenres && user.favoriteGenres.length > 0 && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-neutral-600" />
                                        <div className="flex gap-1">
                                            {user.favoriteGenres.slice(0, 3).map((g: string) => (
                                                <span key={g} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-xs text-white/70">
                                                    {g}
                                                </span>
                                            ))}
                                            {user.favoriteGenres.length > 3 && (
                                                <span className="text-xs text-neutral-500">+{user.favoriteGenres.length - 3}</span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/5 transition-all text-sm font-medium"
                            >
                                <Edit size={16} /> Edit Profile
                            </button>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 transition-all text-sm font-medium"
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Favorites Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Heart size={24} className="text-purple-500 fill-purple-500" /> Your Favorites
                    </h2>
                </div>

                {loadingFavorites ? (
                    <div className="text-neutral-500 px-2">Loading favorites...</div>
                ) : favorites.length === 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                        <p className="text-neutral-400 mb-4">You haven't liked any tracks yet.</p>
                        <Link href="/releases" className="inline-block px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors">
                            Discover Music
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {favorites.map((track) => (
                            <RemixCard
                                key={track.id}
                                id={track.id}
                                title={track.title}
                                artist={track.artist || "Ram"}
                                coverUrl={track.coverImageUrl}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* 3. Playlists & History Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Playlists */}
                <section className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ListMusic size={20} className="text-blue-400" /> Your Playlists
                        </h2>
                        <button className="text-xs text-neutral-400 hover:text-white transition-colors">Create New</button>
                    </div>
                    <div className="space-y-3">
                        {userPlaylists.map((playlist) => (
                            <div key={playlist.id} className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0 relative">
                                    <img src={playlist.cover} alt={playlist.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play size={16} className="text-white fill-white" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">{playlist.name}</p>
                                    <p className="text-xs text-neutral-500">{playlist.count} tracks</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recently Played */}
                <section className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clock size={20} className="text-green-400" /> Recently Played
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {history.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                                    <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white">{item.title}</p>
                                    <p className="text-xs text-neutral-500">{item.artist}</p>
                                </div>
                                <span className="text-xs text-neutral-600">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Removed Language & Region Settings */}
        </div>
    );
}
