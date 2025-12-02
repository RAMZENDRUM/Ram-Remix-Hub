'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import styles from './Player.module.css';
import { usePlayer } from '@/context/PlayerContext';

const Player = () => {
    const { currentTrack, isPlaying, togglePlay } = usePlayer();

    if (!currentTrack) return null;

    return (
        <div className={styles.player}>
            <div className={styles.inner}>
                <div className={styles.trackInfo}>
                    <img
                        src={currentTrack.coverImageUrl || 'https://picsum.photos/seed/1/100/100'}
                        alt={currentTrack.title}
                        className={styles.cover}
                    />
                    <div className={styles.details}>
                        <span className={styles.title}>{currentTrack.title}</span>
                        <span className={styles.artist}>{currentTrack.artist || 'Ram'}</span>
                    </div>
                </div>

                <div className={styles.controls}>
                    <div className={styles.buttons}>
                        <button className={styles.controlButton}>
                            <SkipBack size={20} />
                        </button>
                        <button
                            className={`${styles.controlButton} ${styles.playPause}`}
                            onClick={togglePlay}
                        >
                            {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}
                        </button>
                        <button className={styles.controlButton}>
                            <SkipForward size={20} />
                        </button>
                    </div>
                    <div className={styles.progressBar}>
                        <div className={styles.progress} />
                    </div>
                </div>

                <div className={styles.volume}>
                    <Volume2 size={20} color="#888" />
                    <div className={styles.progressBar} style={{ width: '100px' }}>
                        <div className={styles.progress} style={{ width: '70%' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Player;
