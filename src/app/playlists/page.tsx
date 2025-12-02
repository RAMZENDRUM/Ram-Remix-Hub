'use client';

import React from 'react';
import styles from './page.module.css';
import uiText from '@/data/ui-text.json';

export default function Playlists() {
    const { home } = uiText;
    // Mock empty playlists for now as we removed fake data
    const playlists: any[] = [];

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{home.curatedPlaylists}</h1>

            {playlists.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 bg-neutral-900 rounded-lg border border-neutral-800">
                    No playlists created yet.
                </div>
            ) : (
                <div className={styles.grid}>
                    {playlists.map((playlist) => (
                        <div key={playlist.id} className={styles.card}>
                            <div className={styles.coverContainer}>
                                <img src={playlist.cover} alt={playlist.name} className={styles.cover} />
                            </div>
                            <div className={styles.info}>
                                <h3 className={styles.playlistName}>{playlist.name}</h3>
                                <p className={styles.trackCount}>{playlist.count} Tracks</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
