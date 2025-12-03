'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
    Edit, Upload, Shield, Play, Download, Star,
    MessageSquare, Clock, Settings, LogOut,
    TrendingUp, Music, Activity, Globe, Check
} from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";
import { EditProfileModal } from './EditProfileModal';

interface CreatorDashboardProps {
    user: any;
    overview: any; // Using any for now, ideally typed from getCreatorOverview
}

export function CreatorDashboard({ user, overview }: CreatorDashboardProps) {
    const { language, setLanguage, t } = useLanguage();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Use real data from overview, fallback to 0/empty if missing
    const stats = [
        { label: 'Total Releases', value: overview?.stats?.totalReleases || 0, icon: Music, color: 'text-blue-400' },
        { label: 'Total Plays', value: overview?.stats?.totalPlays?.toLocaleString() || '0', icon: Play, color: 'text-purple-400' },
        { label: 'Total Downloads', value: overview?.stats?.totalDownloads?.toLocaleString() || '0', icon: Download, color: 'text-green-400' },
        { label: 'Avg Rating', value: overview?.stats?.avgRating ? overview.stats.avgRating.toFixed(1) : '-', icon: Star, color: 'text-yellow-400' },
    ];

    const topTracks = overview?.topTracks || [];

    // Mock data for sections not yet connected to real backend
    const recentFeedback = [
        { id: 1, user: 'AlexM', rating: 5, comment: 'This drop is insane! 🔥', time: '2h ago' },
        { id: 2, user: 'SarahJ', rating: 4, comment: 'Love the vibe, but bass is a bit loud.', time: '5h ago' },
        { id: 3, user: 'Anon', rating: 5, comment: 'Best remix of this track I have heard.', time: '1d ago' },
    ];

    const history = [
        { id: 'h1', title: 'Neon Nights', artist: 'Ram', time: '20 mins ago', cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80' },
        { id: 'h2', title: 'Cyberpunk 2077 Theme', artist: 'CDPR', time: '1 hour ago', cover: 'https://images.unsplash.com/photo-1535478044878-3ed83d5456ef?w=800&q=80' },
        { id: 'h3', title: 'Nightcall', artist: 'Kavinsky', time: '3 hours ago', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80' },
    ];

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-8">

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
            />

            {/* 1. Hero / Creator Header */}
            <section className="relative rounded-[2.5rem] bg-neutral-900/60 border border-white/10 backdrop-blur-2xl p-8 md:p-10 overflow-hidden group">
                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-blue-500 animate-spin-slow">
                            <div className="w-full h-full rounded-full bg-black p-1">
                                <div className="w-full h-full rounded-full overflow-hidden relative">
                                    {user.image ? (
                                        <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-2xl font-bold">
                                            {user.name?.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 bg-black rounded-full p-1 border border-white/10">
                            <div className="bg-green-500 w-4 h-4 rounded-full border-2 border-black" />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row items-center gap-3">
                            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{user.name}</h1>
                            <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
                                Remix Creator / Admin
                            </span>
                        </div>
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
                            <Link href="/admin" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:brightness-110 transition-all text-sm font-bold shadow-lg shadow-purple-900/20">
                                <Upload size={16} /> Upload New Remix
                            </Link>
                            {/* Removed Admin Panel Button */}
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

            {/* 2. Key Metrics Row */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex flex-col items-center md:items-start hover:bg-white/5 transition-colors group">
                        <div className={`p-3 rounded-xl bg-white/5 mb-3 group-hover:scale-110 transition-transform ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                        <span className="text-2xl md:text-3xl font-bold text-white">{stat.value}</span>
                        <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">{stat.label}</span>
                    </div>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3. Left Column: Top Tracks & History */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Top Tracks */}
                    <section className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <TrendingUp size={20} className="text-purple-400" /> Top Performing Tracks
                            </h2>
                            <button className="text-xs text-neutral-400 hover:text-white transition-colors">View All</button>
                        </div>

                        {topTracks.length > 0 ? (
                            <div className="space-y-4">
                                {topTracks.map((track: any) => (
                                    <div key={track.id} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                            <img src={track.coverUrl || '/images/default-cover.jpg'} alt={track.title} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Play size={20} className="text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white truncate">{track.title}</h3>
                                            <p className="text-sm text-neutral-400 truncate">{track.artistName}</p>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-neutral-400">
                                            <div className="flex items-center gap-1"><Play size={12} /> {track.plays}</div>
                                            <div className="flex items-center gap-1"><Download size={12} /> {track.downloads}</div>
                                            <div className="flex items-center gap-1 text-yellow-400"><Star size={12} fill="currentColor" /> {track.avgRating ? track.avgRating.toFixed(1) : '-'}</div>
                                        </div>
                                        <button className="p-2 text-neutral-500 hover:text-white transition-colors">
                                            <Edit size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-neutral-500">
                                <p>No tracks uploaded yet.</p>
                            </div>
                        )}
                    </section>

                    {/* Listening History */}
                    <section className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Clock size={20} className="text-blue-400" /> Recently Played
                            </h2>
                        </div>

                        {history.length > 0 ? (
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
                        ) : (
                            <div className="text-center py-8 text-neutral-500">
                                <p>You haven't played anything recently.</p>
                            </div>
                        )}
                    </section>

                </div>

                {/* 4. Right Column: Analytics, Feedback, Actions */}
                <div className="space-y-8">

                    {/* Analytics Mini Chart */}
                    <section className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Activity size={16} /> Activity (30 Days)
                        </h3>
                        <div className="h-32 w-full flex items-end justify-between gap-1">
                            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                                <div key={i} className="w-full bg-purple-500/20 rounded-t-sm hover:bg-purple-500/40 transition-colors relative group">
                                    <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-sm" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-between text-xs text-neutral-500 font-medium">
                            <span>Nov 1</span>
                            <span>Nov 15</span>
                            <span>Dec 1</span>
                        </div>
                    </section>

                    {/* Recent Feedback */}
                    <section className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                                <MessageSquare size={16} /> Recent Feedback
                            </h3>
                            <Link href="#" className="text-xs text-purple-400 hover:text-purple-300">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {recentFeedback.map((fb) => (
                                <div key={fb.id} className="bg-black/20 rounded-xl p-3 border border-white/5">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-bold text-white">{fb.user}</span>
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={10} className={i < fb.rating ? "text-yellow-400 fill-yellow-400" : "text-neutral-700"} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-neutral-300 leading-relaxed">"{fb.comment}"</p>
                                    <p className="text-[10px] text-neutral-600 mt-2 text-right">{fb.time}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Settings size={16} /> Quick Actions
                        </h3>
                        <div className="space-y-2">
                            <Link href="/admin" className="block w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-sm font-medium text-white">
                                Upload New Track
                            </Link>
                            <Link href="/playlists" className="block w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-sm font-medium text-white">
                                Manage Playlists
                            </Link>
                            <button className="block w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-sm font-medium text-white">
                                View Analytics
                            </button>
                        </div>
                    </section>

                </div>
            </div>

            {/* Removed Language & Region Settings */}
        </div>
    );
}
