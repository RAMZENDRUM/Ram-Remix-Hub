'use client';

import React, { useEffect, useState } from 'react';
import RemixCard from '@/components/RemixCard';
import styles from './page.module.css';
import uiText from '@/data/ui-text.json';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from "@/context/LanguageContext";
import { Globe, Check } from "lucide-react";

interface Remix {
    id: string;
    title: string;
    coverUrl: string;
}

export default function Profile() {
    const { profile } = uiText;
    const { data: session } = useSession();
    const user = session?.user;
    const [history, setHistory] = useState<Remix[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { language, setLanguage, t } = useLanguage();

    const languages = [
        { code: 'en', name: 'English (UK)', label: 'EN' },
        { code: 'ta', name: 'தமிழ் (Tamil)', label: 'TA' },
        { code: 'de', name: 'Deutsch (German)', label: 'DE' },
        { code: 'ja', name: '日本語 (Japanese)', label: 'JA' },
        { code: 'fr', name: 'Français (French)', label: 'FR' },
    ] as const;

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
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    if (!user) {
        return <div className={styles.container}>Please sign in to view profile.</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.avatar}>{user.name?.substring(0, 2).toUpperCase() || 'U'}</div>
                <div className={styles.userInfo}>
                    <h1 className={styles.name}>{user.name}</h1>
                    <p className={styles.email}>{user.email}</p>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        style={{
                            marginTop: '10px',
                            padding: '8px 16px',
                            background: '#333',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: 'fit-content'
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Language & Region Card */}
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white">{t('settings.language')}</h2>
                    <p className="text-white/60 text-sm mt-1">{t('settings.language.desc')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`relative flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200 ${language === lang.code
                                ? 'bg-gradient-to-r from-[#C69AFF] to-[#6F5BFF] border-transparent shadow-lg shadow-purple-900/30'
                                : 'bg-black/40 border-white/10 hover:bg-white/5 hover:border-white/20'
                                }`}
                        >
                            <div className="flex flex-col items-start">
                                <span className={`font-medium ${language === lang.code ? 'text-white' : 'text-white/90'}`}>
                                    {lang.name}
                                </span>
                                <span className={`text-xs ${language === lang.code ? 'text-white/80' : 'text-white/50'}`}>
                                    {lang.label}
                                </span>
                            </div>
                            {language === lang.code && (
                                <div className="bg-white/20 rounded-full p-1">
                                    <Check size={14} className="text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-white/5">
                    <p className="text-white/40 text-xs font-medium uppercase tracking-wider">
                        {t('settings.default')}
                    </p>
                </div>
            </div>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{profile.favorites}</h2>
                {loading ? (
                    <div className="text-neutral-500">Loading favorites...</div>
                ) : favorites.length === 0 ? (
                    <div className="text-neutral-500">No favorites yet.</div>
                ) : (
                    <div className={styles.grid}>
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

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{profile.history}</h2>
                {history.length === 0 ? (
                    <div className="text-neutral-500">No listening history yet.</div>
                ) : (
                    <div className={styles.grid}>
                        {history.map((remix) => (
                            <RemixCard
                                key={remix.id}
                                id={remix.id}
                                title={remix.title}
                                artist="Ram"
                                coverUrl={remix.coverUrl}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
