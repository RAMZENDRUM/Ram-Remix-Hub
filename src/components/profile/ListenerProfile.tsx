'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Edit, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { EditProfileModal } from './EditProfileModal';
import { NeonAvatar } from "@/components/neon-avatar";
import ProfileListeningStats from "./ProfileListeningStats";

interface ListenerProfileProps {
    user: any;
}

export function ListenerProfile({ user }: ListenerProfileProps) {
    const { language, setLanguage, t } = useLanguage();
    const { data: session } = useSession();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Helper to get dynamic neon colors based on genre (Matches ReleaseList logic)
    const getGenreColor = (genre: string) => {
        const g = genre.toLowerCase();
        if (g.includes('pop')) return "text-pink-400 border-pink-500/50 shadow-[0_0_12px_rgba(236,72,153,0.4)] bg-pink-900/20";
        if (g.includes('hip-hop') || g.includes('rap')) return "text-orange-400 border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.4)] bg-orange-900/20";
        if (g.includes('r&b')) return "text-rose-400 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.4)] bg-rose-900/20";
        if (g.includes('edm') || g.includes('house')) return "text-cyan-400 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.4)] bg-cyan-900/20";
        if (g.includes('trap') || g.includes('phonk')) return "text-red-500 border-red-600/50 shadow-[0_0_12px_rgba(220,38,38,0.4)] bg-red-900/20";
        if (g.includes('lo-fi') || g.includes('chill')) return "text-indigo-300 border-indigo-400/50 shadow-[0_0_12px_rgba(129,140,248,0.4)] bg-indigo-900/20";
        if (g.includes('rock') || g.includes('metal')) return "text-stone-300 border-stone-400/50 shadow-[0_0_12px_rgba(168,162,158,0.4)] bg-stone-800/40";
        if (g.includes('soundtrack') || g.includes('score')) return "text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.4)] bg-amber-900/20";
        if (g.includes('jazz') || g.includes('classical')) return "text-yellow-200 border-yellow-300/50 shadow-[0_0_12px_rgba(253,224,71,0.4)] bg-yellow-900/20";

        // Default
        return "text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.4)] bg-cyan-900/20";
    };

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
                        <NeonAvatar
                            name={user.name || session?.user?.name}
                            imageUrl={user.profileImageUrl || user.image || session?.user?.image}
                            size="xl"
                        />
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
                                        <div className="flex gap-2">
                                            {user.favoriteGenres.slice(0, 3).map((g: string) => (
                                                <span key={g} className={cn("px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md transition-all hover:scale-105 cursor-default", getGenreColor(g))}>
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

            {/* 2. Listening Stats Overview (Real Data) */}
            <ProfileListeningStats />
        </div>
    );
}
