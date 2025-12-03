'use client';

import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import styles from './RemixCard.module.css';

import { InlineActionsDropdown } from "@/components/ui/inline-actions-dropdown";

interface RemixCardProps {
    id: string;
    title: string;
    artist?: string;
    coverUrl?: string;
}

const RemixCard: React.FC<RemixCardProps> = ({ id, title, artist = "Ram", coverUrl }) => {
    return (
        <div className="relative group">
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
            <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <InlineActionsDropdown className="w-auto" />
            </div>
        </div>
    );
};


export default RemixCard;
