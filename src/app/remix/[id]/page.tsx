'use client';

import React, { useEffect, useState, use } from 'react';
import { Play, Download, Heart, Star, Share2, MessageSquare, Plus, ListPlus, Check } from 'lucide-react';
import uiText from '@/data/ui-text.json';
import { usePlayer } from '@/context/PlayerContext';
import { RatingModal } from '@/components/ui/RatingModal';
import CreatePlaylistModal from '@/components/ui/CreatePlaylistModal';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import { useSyncRouteWithPlayer } from '@/hooks/useSyncRouteWithPlayer';
import { PlayButton } from "@/components/ui/PlayButton";
import Link from 'next/link';
import Image from 'next/image';
import DownloadModal from '@/components/ui/DownloadModal';
import ShareModal from '@/components/ui/ShareModal';

interface Track {
    id: string;
    title: string;
    description: string;
    artist?: string;
    tags?: string;
    genre?: string;
    type: string;
    audioUrl: string;
    coverImageUrl?: string;
    createdAt: string;
}

interface Review {
    id: string;
    rating: number;
    feedback: string | null;
    createdAt: string;
    userId: string | null;
}

interface Playlist {
    id: string;
    name: string;
}

export default function RemixDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { remixDetail } = uiText;
    const { playQueue, likedIds, toggleLike, isPlaying, currentTrack, togglePlay } = usePlayer();
    const [track, setTrack] = useState<Track | null>(null);
    const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);

    const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const { showToast } = useToast();

    // Sync route with player
    useSyncRouteWithPlayer();

    // Rating State
    const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

    // Create Playlist Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Download Modal State
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadStatus, setDownloadStatus] = useState<"preparing" | "downloading" | "done" | "error">("preparing");

    // Share Modal State
    const [showShareModal, setShowShareModal] = useState(false);

    // Derived liked state
    const isLiked = track ? likedIds.has(track.id) : false;

    const fetchTrackAndRatings = async () => {
        try {
            // Fetch Track
            const trackRes = await fetch(`/api/tracks/${id}`);
            if (trackRes.ok) {
                const data = await trackRes.json();
                setTrack(data);
            }

            // Fetch Related Tracks (just fetch all for now and filter)
            const allTracksRes = await fetch('/api/tracks');
            if (allTracksRes.ok) {
                const allTracks = await allTracksRes.json();
                // Filter out current track and take top 10
                const others = allTracks.filter((t: Track) => t.id !== id).slice(0, 10);
                setRelatedTracks(others);
            }

            // Fetch Ratings
            const ratingRes = await fetch(`/api/ratings?trackId=${id}`);
            if (ratingRes.ok) {
                const data = await ratingRes.json();
                setRatingStats({ average: data.average, count: data.count });
                setReviews(data.reviews);
            }

            // Fetch Like Status and Sync with Context
            const likeRes = await fetch(`/api/likes?trackId=${id}`);
            if (likeRes.ok) {
                const data = await likeRes.json();
                if (data.liked && !likedIds.has(id)) {
                    toggleLike(id);
                } else if (!data.liked && likedIds.has(id)) {
                    toggleLike(id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPlaylists = async () => {
        try {
            const res = await fetch('/api/playlists');
            if (res.ok) {
                const data = await res.json();
                setUserPlaylists(data.user || []);
            }
        } catch (err) {
            console.error("Failed to fetch playlists", err);
        }
    };

    useEffect(() => {
        fetchTrackAndRatings();
        fetchUserPlaylists();
    }, [id]);

    const handleShare = async () => {
        setShowShareModal(true);
    };

    const handleAddToPlaylist = async (playlistId: string) => {
        if (!track) return;
        try {
            const res = await fetch(`/api/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId: track.id })
            });
            if (res.ok) {
                showToast({ variant: "success", message: "Added to playlist" });
                setShowAddMenu(false);
            } else {
                showToast({ variant: "error", message: "Failed to add to playlist" });
            }
        } catch (err) {
            console.error(err);
            showToast({ variant: "error", message: "Error adding to playlist" });
        }
    };

    const handleCreatePlaylist = async (name: string) => {
        if (!track) return;

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
                await handleAddToPlaylist(newPlaylist.id);
                // 3. Refresh list
                fetchUserPlaylists();
            }
        } catch (err) {
            console.error("Failed to create playlist", err);
        }
    };

    const handleLike = async () => {
        if (!track) return;

        // Optimistic update
        toggleLike(track.id);

        try {
            const res = await fetch('/api/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId: track.id }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.liked === isLiked) {
                    // If server state matches current local state (before optimistic toggle), 
                    // it means toggle failed or state was desynced. 
                    // But here we want to ensure context matches server data.liked.
                    // The context toggleLike simply flips the boolean.
                    // If currentlyLiked (state before toggle) == data.liked, then we need to flip it back.
                    // Actually, simplified: force the state to match data.liked.
                    // But context doesn't have setLike(bool). It has toggleLike().
                    // If likedIds.has(track.id) !== data.liked, we toggle.
                    if (likedIds.has(track.id) !== data.liked) {
                        toggleLike(track.id);
                    }
                }
                showToast({ variant: "success", message: data.liked ? "Added to Favorites" : "Removed from Favorites" });
            } else {
                // Revert on failure
                toggleLike(track.id);
                if (res.status === 401) {
                    showToast({ variant: "error", message: "Please login to like tracks" });
                } else {
                    showToast({ variant: "error", message: "Failed to update like status" });
                }
            }
        } catch (error) {
            // Revert on error
            toggleLike(track.id);
            showToast({ variant: "error", message: "An error occurred" });
        }
    };

    const handleDownload = async () => {
        if (!track?.audioUrl) return;

        setShowDownloadModal(true);
        setDownloadStatus("preparing");
        setDownloadProgress(0);

        try {
            const res = await fetch(track.audioUrl);
            if (!res.ok) throw new Error("Download failed");

            const contentLength = res.headers.get("Content-Length");
            const total = contentLength ? parseInt(contentLength, 10) : null;

            setDownloadStatus("downloading");

            const reader = res.body?.getReader();
            if (!reader) throw new Error("ReadableStream not supported");

            let received = 0;
            const chunks = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                received += value.length;

                if (total) {
                    setDownloadProgress(Math.round((received / total) * 100));
                } else {
                    // Fake progress if total not known
                    setDownloadProgress((prev) => (prev < 90 ? prev + 5 : prev));
                }
            }

            const blob = new Blob(chunks);
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `${track.title}.mp3`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setDownloadProgress(100);
            setDownloadStatus("done");

            setTimeout(() => {
                setShowDownloadModal(false);
            }, 1000);

        } catch (error) {
            console.error("Download failed", error);
            setDownloadStatus("error");
            // Keep modal open on error so user sees it
        }
    };

    const handlePlay = () => {
        if (!track) return;

        if (currentTrack?.id === track.id) {
            togglePlay();
        } else {
            // Create a queue starting with this track, followed by related tracks
            const queue = [track, ...relatedTracks];
            playQueue(queue, 0);
        }
    };

    const isCurrentTrackPlaying = currentTrack?.id === track?.id && isPlaying;

    if (loading) return <div className="text-center py-20 text-neutral-400">Loading...</div>;
    if (!track) return <div className="text-center py-20 text-neutral-400">Track not found</div>;

    const tagsList = track.tags ? track.tags.split(',').map(t => t.trim()) : [];

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left Column: Media Area */}
                    <div className="lg:col-span-5 flex flex-col gap-8">
                        {/* Cover Image */}
                        <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-900/20 group">
                            <img
                                src={track.coverImageUrl || 'https://picsum.photos/seed/1/600/600'}
                                alt={track.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                        </div>

                        {/* Action Buttons Row */}
                        <div className="flex items-center justify-between gap-4 px-2">
                            <button
                                onClick={handleLike}
                                className={`flex-1 flex items-center justify-center py-3 rounded-full border transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] ${isLiked
                                    ? "bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-400 shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                                    : "bg-black border-purple-500/50 text-white/70 hover:text-white hover:bg-black/80"
                                    }`}
                                aria-label="Toggle favourite"
                            >
                                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                            </button>

                            <PlayButton
                                variant="pill"
                                isPlaying={isCurrentTrackPlaying}
                                onClick={handlePlay}
                                label={isCurrentTrackPlaying ? "Pause" : "Play"}
                                className="flex-[2]"
                            />

                            {/* Add to Playlist Dropdown */}
                            <div className="relative flex-1">
                                <button
                                    onClick={() => setShowAddMenu(!showAddMenu)}
                                    className="w-full flex items-center justify-center py-3 rounded-full bg-black border border-purple-500/50 text-white/70 hover:text-white hover:bg-black/80 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                                    aria-label="Add to playlist"
                                >
                                    <ListPlus className="h-5 w-5" />
                                </button>

                                {showAddMenu && (
                                    <div className="absolute top-14 left-0 w-64 p-2 rounded-2xl bg-neutral-900 border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="text-xs font-medium text-neutral-400 px-3 py-2 uppercase tracking-wider">
                                            Add to Playlist
                                        </div>
                                        <div className="max-h-60 overflow-y-auto space-y-1">
                                            {userPlaylists.length === 0 && (
                                                <div className="text-sm text-neutral-500 px-3 py-2 italic text-center">
                                                    No playlists yet
                                                </div>
                                            )}
                                            {userPlaylists.map(pl => (
                                                <button
                                                    key={pl.id}
                                                    onClick={() => handleAddToPlaylist(pl.id)}
                                                    className="w-full text-left px-3 py-2.5 text-sm text-white hover:bg-white/10 rounded-xl transition-colors flex items-center gap-2 group"
                                                >
                                                    <ListPlus size={14} className="text-neutral-500 group-hover:text-purple-400" />
                                                    <span className="truncate">{pl.name}</span>
                                                </button>
                                            ))}
                                            <div className="h-px bg-white/10 my-1.5" />
                                            <button
                                                onClick={() => setIsCreateModalOpen(true)}
                                                className="w-full text-left px-3 py-2.5 text-sm text-purple-400 hover:bg-purple-500/10 rounded-xl transition-colors flex items-center gap-2 font-medium"
                                            >
                                                <Plus size={14} />
                                                New Playlist
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleDownload}
                                className="flex-1 flex items-center justify-center py-3 rounded-full bg-black border border-purple-500/50 text-white/70 hover:text-white hover:bg-black/80 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                                aria-label="Download track"
                            >
                                <Download className="h-5 w-5" />
                            </button>

                            <button
                                onClick={handleShare}
                                className="flex-1 flex items-center justify-center py-3 rounded-full bg-black border border-purple-500/50 text-white/70 hover:text-white hover:bg-black/80 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                                aria-label="Share track"
                            >
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Info Area */}
                    <div className="lg:col-span-7 flex flex-col gap-8 pt-2">

                        {/* Title & Artist */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                {(() => {
                                    // Helper to get dynamic neon colors based on type
                                    const getTypeColor = (type: string) => {
                                        const t = type.toLowerCase();
                                        if (t === 'remix') return "text-purple-400 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.4)] bg-purple-900/20";
                                        if (t === 'instrumental') return "text-blue-400 border-blue-500/50 shadow-[0_0_12px_rgba(96,165,250,0.4)] bg-blue-900/20";
                                        if (t === 'bgm') return "text-emerald-400 border-emerald-500/50 shadow-[0_0_12px_rgba(52,211,153,0.4)] bg-emerald-900/20";
                                        if (t === 'song') return "text-fuchsia-400 border-fuchsia-500/50 shadow-[0_0_12px_rgba(232,121,249,0.4)] bg-fuchsia-900/20";
                                        return "text-purple-400 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.4)] bg-purple-900/20";
                                    };

                                    // Helper to get dynamic neon colors based on genre
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
                                        <>
                                            <span className={cn("px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider backdrop-blur-md", getTypeColor(track.type || 'Remix'))}>
                                                {track.type || 'Remix'}
                                            </span>
                                            {track.genre && (
                                                <span className={cn("px-3 py-1 rounded-full border text-xs font-medium uppercase tracking-wider backdrop-blur-md", getGenreColor(track.genre))}>
                                                    {track.genre}
                                                </span>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-purple-300 leading-normal pb-2">
                                {track.title}
                            </h1>

                            <p className="text-xl text-white/60 font-medium flex items-baseline gap-2">
                                By <span
                                    className="font-[family-name:var(--font-zen-dots)] text-xl uppercase bg-gradient-to-r from-white via-purple-100 to-purple-400 bg-clip-text text-transparent transition-all cursor-pointer hover:opacity-80"
                                >
                                    {track.artist || 'Ram'}
                                </span>
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
                            <div className="flex flex-col items-center justify-center text-center gap-1 border-r border-white/5 last:border-0">
                                <span className="text-2xl font-bold text-white">1.2K</span>
                                <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Plays</span>
                            </div>
                            <div className="flex flex-col items-center justify-center text-center gap-1 border-r border-white/5 last:border-0">
                                <span className="text-2xl font-bold text-white">150+</span>
                                <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Downloads</span>
                            </div>
                            <div className="flex flex-col items-center justify-center text-center gap-1">
                                <span className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
                                    {ratingStats.average || '-'} <Star size={14} fill="currentColor" />
                                </span>
                                <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Rating</span>
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white/90">About this Track</h3>
                            <p className="text-white/60 leading-relaxed">
                                {track.description || "No description available yet."}
                            </p>
                            {tagsList.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {tagsList.map(tag => (
                                        <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-white/50 text-xs hover:bg-white/10 transition-colors cursor-default">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Rating & Feedback Section */}
                        <div className="space-y-6 pt-6 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white/90">Rate this Remix</h3>
                                <button
                                    onClick={() => setIsRatingModalOpen(true)}
                                    className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    Write a Review
                                </button>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star
                                            key={star}
                                            size={28}
                                            fill={star <= Math.round(ratingStats.average) ? "#ffd700" : "none"}
                                            color={star <= Math.round(ratingStats.average) ? "#ffd700" : "#4b5563"}
                                            className="transition-transform hover:scale-110"
                                        />
                                    ))}
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <span className="text-sm text-white/50">
                                    {ratingStats.count > 0 ? `${ratingStats.count} ratings` : "Be the first to rate"}
                                </span>
                            </div>

                            <button
                                onClick={() => setIsRatingModalOpen(true)}
                                className="w-full sm:w-auto px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all duration-300"
                            >
                                Leave Feedback
                            </button>
                        </div>

                        {/* User Reviews Preview */}
                        {reviews.length > 0 && (
                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <h3 className="text-lg font-bold text-white/90 flex items-center gap-2">
                                    <MessageSquare size={18} /> Recent Reviews
                                </h3>
                                <div className="space-y-3">
                                    {reviews.slice(0, 2).map((review) => (
                                        <div key={review.id} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={12}
                                                            fill={i < review.rating ? "#ffd700" : "none"}
                                                            color={i < review.rating ? "#ffd700" : "#4b5563"}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-white/30">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/70">{review.feedback}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <RatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                trackId={track.id}
                onRatingSubmit={fetchTrackAndRatings}
            />

            {isCreateModalOpen && (
                <CreatePlaylistModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreatePlaylist}
                />
            )}

            {showDownloadModal && (
                <DownloadModal
                    progress={downloadProgress}
                    status={downloadStatus}
                    onClose={() => setShowDownloadModal(false)}
                />
            )}

            {showShareModal && track && (
                <ShareModal
                    url={window.location.href}
                    title={track.title}
                    onClose={() => setShowShareModal(false)}
                />
            )}
        </div>
    );
}
