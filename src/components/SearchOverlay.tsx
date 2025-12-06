'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Music, Disc, Play, Pause, MoreHorizontal, Heart } from 'lucide-react';
import styles from './SearchOverlay.module.css';
import uiText from '@/data/ui-text.json';
import { useRouter } from 'next/navigation';
import CreatePlaylistModal from '@/components/ui/CreatePlaylistModal';
import Image from 'next/image';
import ShareModal from '@/components/ui/ShareModal';
import { usePlayer } from '@/context/PlayerContext';
import { useToast } from '@/context/ToastContext';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Track {
    id: string;
    title: string;
    artist: string | null;
    genre: string | null;
    coverImageUrl: string | null;
    createdAt: string;
}

interface Playlist {
    id: string;
    name: string;
    count: number;
    cover: string | null;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const { global } = uiText;
    const router = useRouter();
    const { toggleLike, likedIds, playQueue, currentTrack, isPlaying, togglePlay } = usePlayer();
    const { showToast } = useToast();

    const [tracks, setTracks] = useState<Track[]>([]);
    const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
    const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(false);

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [trackIdForPlaylist, setTrackIdForPlaylist] = useState<string | null>(null);
    const [shareDetails, setShareDetails] = useState<{ url: string; title: string } | null>(null);

    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
    const [showPlaylistSubmenu, setShowPlaylistSubmenu] = useState(false);

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

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        if (openMenuId) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [openMenuId]);

    // Fetch tracks when opened
    useEffect(() => {
        if (isOpen && tracks.length === 0) {
            setLoading(true);
            fetch('/api/tracks')
                .then(res => res.json())
                .then((data: Track[]) => {
                    setTracks(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch tracks for search", err);
                    setLoading(false);
                });
        }
    }, [isOpen, tracks.length]);

    // Fetch user playlists on mount/open
    useEffect(() => {
        if (isOpen) {
            fetch('/api/playlists')
                .then(res => res.json())
                .then(data => setUserPlaylists(data.user || []))
                .catch(err => console.error("Failed to fetch playlists", err));
        }
    }, [isOpen]);

    // Filter logic
    useEffect(() => {
        if (!query.trim()) {
            setFilteredTracks([]);
            setFilteredPlaylists([]);
            return;
        }

        const lowerQuery = query.toLowerCase();

        // Filter Tracks
        const matchedTracks = tracks.filter(t =>
            t.title.toLowerCase().includes(lowerQuery) ||
            (t.artist && t.artist.toLowerCase().includes(lowerQuery))
        );
        setFilteredTracks(matchedTracks.slice(0, 5));

        // Derive Playlists (Genres)
        const genreGroups: { [key: string]: Track[] } = {};
        tracks.forEach(t => {
            const g = t.genre || 'Unknown';
            if (!genreGroups[g]) genreGroups[g] = [];
            genreGroups[g].push(t);
        });

        const matchedGenres = Object.keys(genreGroups).filter(g =>
            g.toLowerCase().includes(lowerQuery)
        );

        const genrePlaylists: Playlist[] = matchedGenres.map(g => ({
            id: `genre-${g}`,
            name: g,
            count: genreGroups[g].length,
            cover: genreGroups[g][0]?.coverImageUrl || null
        }));

        // Filter User Playlists
        const matchedUserPlaylists = userPlaylists.filter(p =>
            p.name.toLowerCase().includes(lowerQuery)
        );

        setFilteredPlaylists([...matchedUserPlaylists, ...genrePlaylists]);

    }, [query, tracks, userPlaylists]);

    const handleTrackClick = (trackId: string) => {
        onClose();
        router.push(`/remix/${trackId}`);
    };

    const handlePlaylistClick = (id: string) => {
        if (id.startsWith('genre-')) {
            // Optional: navigate to a genre filter or search? For now just ignore or show toast
            showToast({ variant: 'error', message: "Genre playlists are not yet implemented" });
            return;
        }
        onClose();
        router.push(`/playlists/${id}`);
    };

    // Close menu on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (openMenuId) setOpenMenuId(null);
        };
        document.addEventListener('scroll', handleScroll, true);
        return () => document.removeEventListener('scroll', handleScroll, true);
    }, [openMenuId]);

    const handlePlayClick = (e: React.MouseEvent, track: Track) => {
        e.stopPropagation();

        const isCurrentTrack = currentTrack?.id === track.id;

        if (isCurrentTrack) {
            togglePlay();
        } else {
            // Use Global Player
            playQueue([track as any], 0);
        }
    };

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        e.preventDefault();

        if (openMenuId === id) {
            setOpenMenuId(null);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        // Position menu to the right and significantly above to clear the track height
        setMenuPosition({
            top: rect.top - 80,
            left: rect.right + 5
        });
        setOpenMenuId(id);
        setShowPlaylistSubmenu(false);
    };

    const addToPlaylist = async (playlist: Playlist, track: Track) => {
        try {
            await fetch(`/api/playlists/${playlist.id}/tracks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId: track.id })
            });
            showToast({ variant: "success", message: `${track.title} added to ${playlist.name}` });
            setOpenMenuId(null);
        } catch (err) {
            console.error("Failed to add to playlist", err);
            showToast({ variant: "error", message: "Failed to add to playlist" });
        }
    };

    const handleCreatePlaylist = async (name: string) => {
        if (!trackIdForPlaylist) return;

        try {
            // 1. Create Playlist
            const createRes = await fetch('/api/playlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            if (createRes.ok) {
                const newPlaylist = await createRes.json();
                // 2. Add current track
                const track = tracks.find(t => t.id === trackIdForPlaylist);

                // Fallback if track not found in list (shouldn't happen)
                if (track) {
                    await addToPlaylist(newPlaylist, track);
                }

                // Refresh playlists locally
                fetch('/api/playlists')
                    .then(res => res.json())
                    .then(data => setUserPlaylists(data.user || []));
            }
        } catch (err) {
            console.error("Failed to create playlist", err);
        }
    };

    const handleLikeClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const isLiked = likedIds.has(id);
        toggleLike(id);
        showToast({ variant: 'success', message: isLiked ? "Removed from Favorites" : "Added to Favorites" });
        setOpenMenuId(null);
    };

    const handleShareClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setOpenMenuId(null);

        const track = tracks.find(t => t.id === id);
        const title = track ? track.title : 'Ram Remix Hub';
        const url = `${window.location.origin}/remix/${id}`;

        setShareDetails({ url, title });
        setShowShareModal(true);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            {/* Global Menu Rendered Here to avoid clipping */}
            {openMenuId && menuPosition && (
                <div
                    className={styles.moreMenu}
                    style={{
                        position: 'fixed',
                        top: menuPosition.top,
                        left: menuPosition.left,
                        zIndex: 9999
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {!showPlaylistSubmenu ? (
                        <>
                            <button
                                className={styles.moreMenuItem}
                                onClick={(e) => handleLikeClick(e, openMenuId)}
                            >
                                <Heart
                                    size={16}
                                    className="mr-2"
                                    fill={likedIds.has(openMenuId) ? "currentColor" : "none"}
                                    color={likedIds.has(openMenuId) ? "#ef4444" : "currentColor"}
                                />
                                {likedIds.has(openMenuId) ? "Remove Favorite" : "Add to Favorites"}
                            </button>
                            <button
                                className={styles.moreMenuItem}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("Adding to playlist clicked, switching menu");
                                    setShowPlaylistSubmenu(true);
                                    // Refresh playlists just in case
                                    fetch('/api/playlists')
                                        .then(res => {
                                            if (!res.ok) throw new Error("Failed");
                                            return res.json();
                                        })
                                        .then(data => setUserPlaylists(data.user || []))
                                        .catch(err => console.error("Error fetching playlists", err));
                                }}
                            >
                                <span className="mr-2">+</span> Add to playlist
                            </button>
                            <button
                                className={styles.moreMenuItem}
                                onClick={() => {
                                    handleTrackClick(openMenuId);
                                }}
                            >
                                <span className="mr-2">→</span> Go to song page
                            </button>
                            <button
                                className={styles.moreMenuItem}
                                onClick={(e) => handleShareClick(e, openMenuId)}
                            >
                                <span className="mr-2">🔗</span> Share
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className={styles.moreMenuItem}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPlaylistSubmenu(false);
                                }}
                                style={{ color: '#aaa', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 4 }}
                            >
                                ← Back
                            </button>
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {userPlaylists.length === 0 && (
                                    <div className="px-3 py-2 text-xs text-neutral-500">No playlists found</div>
                                )}
                                {userPlaylists.map(pl => (
                                    <button
                                        key={pl.id}
                                        className={styles.moreMenuItem}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const track = tracks.find(t => t.id === openMenuId);
                                            if (track) addToPlaylist(pl, track);
                                        }}
                                    >
                                        {pl.name}
                                    </button>
                                ))}
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 4, paddingTop: 4 }}>
                                    <button
                                        className={styles.moreMenuItem}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setTrackIdForPlaylist(openMenuId);
                                            setIsCreateModalOpen(true);
                                            // Don't close menu yet, or do? Modal opens on top. 
                                            // If we close menu, openMenuId becomes null. 
                                            // That's why we saved trackIdForPlaylist.
                                            setOpenMenuId(null);
                                        }}
                                        style={{ color: '#a855f7' }}
                                    >
                                        + New Playlist
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

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
                    {['All', 'Remixes', 'Playlists', 'Mood', 'Genre'].map(filter => (
                        <button key={filter} className={`${styles.filterChip} ${filter === 'All' ? styles.active : ''}`}>
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Results Area */}
                {(query) && (
                    <div className={styles.results}>
                        {loading && <div className="text-neutral-500 p-4">Loading...</div>}

                        {!loading && filteredPlaylists.length > 0 && (
                            <div className={styles.searchList}>
                                <h3 className={styles.sectionTitle}>Playlists</h3>
                                {filteredPlaylists.map(playlist => (
                                    <div key={playlist.id} className={styles.searchCard} onClick={() => handlePlaylistClick(playlist.id)}>
                                        {playlist.cover ? (
                                            <Image
                                                src={playlist.cover}
                                                alt={playlist.name}
                                                width={52}
                                                height={52}
                                                className={styles.searchCover}
                                            />
                                        ) : (
                                            <div className={`${styles.searchCover} flex items-center justify-center bg-neutral-800 text-neutral-500`}>
                                                <Disc size={24} />
                                            </div>
                                        )}

                                        <div className={styles.searchMain}>
                                            <div className={styles.searchTitleRow}>
                                                <span className={styles.searchTitle}>{playlist.name}</span>
                                            </div>
                                            <div className={styles.searchMetaRow}>
                                                <span className={`${styles.searchChip} ${styles.playlist}`}>
                                                    Playlist • {playlist.count} tracks
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.searchActions}>
                                            <button className={styles.searchPlayIcon}>
                                                <Play size={14} fill="currentColor" className="ml-0.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {
                            !loading && filteredTracks.length > 0 && (
                                <div className={styles.searchList}>
                                    <h3 className={styles.sectionTitle}>Songs</h3>
                                    {filteredTracks.map(track => (
                                        <div key={track.id} className={styles.searchCard} onClick={() => handleTrackClick(track.id)}>
                                            {track.coverImageUrl ? (
                                                <Image
                                                    src={track.coverImageUrl}
                                                    alt={track.title}
                                                    width={52}
                                                    height={52}
                                                    className={styles.searchCover}
                                                />
                                            ) : (
                                                <div className={`${styles.searchCover} flex items-center justify-center bg-neutral-800 text-neutral-500`}>
                                                    <Music size={24} />
                                                </div>
                                            )}

                                            <div className={styles.searchMain}>
                                                <div className={styles.searchTitleRow}>
                                                    <span className={styles.searchTitle}>{track.title}</span>
                                                </div>

                                                <div className={styles.searchMetaRow}>
                                                    <span className={styles.searchArtist}>{track.artist || 'Unknown Artist'}</span>

                                                    {track.genre && (
                                                        <span className={styles.searchChip}>
                                                            {track.genre}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={styles.searchActions}>
                                                <button
                                                    className={styles.searchPlayIcon}
                                                    onClick={(e) => handlePlayClick(e, track)}
                                                >
                                                    {currentTrack?.id === track.id && isPlaying ? (
                                                        <Pause size={14} fill="currentColor" className="ml-0.5" />
                                                    ) : (
                                                        <Play size={14} fill="currentColor" className="ml-0.5" />
                                                    )}
                                                </button>

                                                <div className={styles.moreMenuContainer}>
                                                    <button
                                                        className={styles.searchMore}
                                                        onClick={(e) => toggleMenu(e, track.id)}
                                                    >
                                                        <MoreHorizontal size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        }

                        {
                            !loading && query && filteredTracks.length === 0 && filteredPlaylists.length === 0 && (
                                <div className="text-neutral-500 p-4">No results found for "{query}"</div>
                            )
                        }
                    </div >
                )}
            </div >

            {isCreateModalOpen && (
                <CreatePlaylistModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreatePlaylist}
                />
            )}

            {
                showShareModal && shareDetails && (
                    <ShareModal
                        url={shareDetails.url}
                        title={shareDetails.title}
                        onClose={() => setShowShareModal(false)}
                    />
                )
            }
        </div >
    );
};

export default SearchOverlay;
