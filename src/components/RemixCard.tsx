'use client';

import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import styles from './RemixCard.module.css';

interface RemixCardProps {
    id: string;
    title: string;
    artist?: string | null;
    coverUrl?: string | null;
}

const RemixCard: React.FC<RemixCardProps> = ({ id, title, artist = "Ram", coverUrl }) => {
    return (
        <Link href={`/remix/${id}`}>
            <div className={styles.card}>
                <div className={styles.imageContainer}>
                    {coverUrl ? (
                        <img src={coverUrl} alt={title} className={styles.image} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #333, #555)' }} />
                    )}
                    <div className={styles.overlay}>
                        <div className={styles.playButton}>
                            <Play size={24} fill="black" />
                        </div>
                    </div>
                </div>
                <div className={styles.info}>
                    <h3 className={styles.title}>{title}</h3>
                    <p className={styles.artist}>{artist}</p>
                </div>
            </div>
        </Link>
    );
};

export default RemixCard;
