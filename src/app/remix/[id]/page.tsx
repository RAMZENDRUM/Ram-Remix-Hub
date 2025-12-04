'use client';

import React, { useEffect, useState, use } from 'react';
import { Play, Download, Heart, Star, Share2, MessageSquare } from 'lucide-react';
import uiText from '@/data/ui-text.json';
import { usePlayer } from '@/context/PlayerContext';
import { RatingModal } from '@/components/ui/RatingModal';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import { useSyncRouteWithPlayer } from '@/hooks/useSyncRouteWithPlayer';
import { PlayButton } from "@/components/ui/PlayButton";

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

export default function RemixDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { remixDetail } = uiText;
    const { playQueue, likedIds, toggleLike, isPlaying, currentTrack, togglePlay } = usePlayer();
    const [track, setTrack] = useState<Track | null>(null);
    const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);

    // Sync route with player
    useSyncRouteWithPlayer();

    // Rating State
    const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

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

    useEffect(() => {
        fetchTrackAndRatings();
    }, [id]);

    const { showToast } = useToast();

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        showToast({ variant: "success", message: "Link copied to clipboard" });
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
                // Ensure context matches server state (should already match due to optimistic update)
                const currentlyLiked = likedIds.has(track.id);
                if (data.liked !== currentlyLiked) {
                    toggleLike(track.id);
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

    const handleDownload = () => {
        if (track?.audioUrl) {
            const link = document.createElement('a');
            link.href = track.audioUrl;
            link.download = `${track.title}.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast({ variant: "success", message: "Download started" });
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
                                className={`flex-1 flex items-center justify-center py-3 rounded-full border transition-all duration-300 ${isLiked
                                    ? "bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-400"
                                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                                    }`}
                                aria-label="Toggle favourite"
                            >
                                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                            </button>

                            <PlayButton
                                variant="pill"
                                isPlaying={isCurrentTrackPlaying}
                                onClick={handlePlay}
                                label={isCurrentTrackPlaying ? "Pause" : "Play Now"}
                                className="flex-[2]"
                            />

                            <button
                                onClick={handleDownload}
                                className="flex-1 flex items-center justify-center py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all duration-300"
                                aria-label="Download track"
                            >
                                <Download className="h-5 w-5" />
                            </button>

                            <button
                                onClick={handleShare}
                                className="flex-1 flex items-center justify-center py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all duration-300"
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
                                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
                                    {track.type || 'Remix'}
                                </span>
                                {track.genre && (
                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium uppercase tracking-wider">
                                        {track.genre}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-purple-300 leading-normal pb-2">
                                {track.title}
                            </h1>

                            <p className="text-xl text-white/60 font-medium flex items-center gap-2">
                                By <span className="text-white hover:text-purple-400 transition-colors cursor-pointer">{track.artist || 'Ram'}</span>
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
        </div>
    );
}
