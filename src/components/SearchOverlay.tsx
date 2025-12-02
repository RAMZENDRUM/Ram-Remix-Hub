'use client';

import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import styles from './SearchOverlay.module.css';
import uiText from '@/data/ui-text.json';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const { global } = uiText;

    // Prevent scrolling when overlay is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <button className={styles.closeButton} onClick={onClose}>
                <X size={32} />
            </button>

            <div className={styles.searchContainer}>
                <div className={styles.inputWrapper}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder={global.searchPlaceholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className={styles.filters}>
                    <button className={`${styles.filterChip} ${styles.active}`}>All</button>
                    <button className={styles.filterChip}>Remixes</button>
                    <button className={styles.filterChip}>Playlists</button>
                    <button className={styles.filterChip}>Mood</button>
                    <button className={styles.filterChip}>Genre</button>
                </div>

                {/* Mock Results Area */}
                {query && (
                    <div className={styles.results}>
                        <h3 className={styles.sectionTitle}>Top Results</h3>
                        {/* Placeholder for results */}
                        <div style={{ color: '#888' }}>Searching for "{query}"...</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchOverlay;
