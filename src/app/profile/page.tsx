'use client';

import React, { useEffect, useState } from 'react';
import RemixCard from '@/components/RemixCard';
import styles from './page.module.css';
import uiText from '@/data/ui-text.json';
import { useSession, signOut } from 'next-auth/react';
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
