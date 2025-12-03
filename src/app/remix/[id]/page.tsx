'use client';

import React, { useEffect, useState, use } from 'react';
import { Play, Download, Heart, Star, Share2, MessageSquare } from 'lucide-react';
import styles from './page.module.css';
import uiText from '@/data/ui-text.json';
import { usePlayer } from '@/context/PlayerContext';
import { RatingModal } from '@/components/ui/RatingModal';
import { useToast } from '@/context/ToastContext';

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
    const { playQueue } = usePlayer();
    const [track, setTrack] = useState<Track | null>(null);
    const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);

    // Rating State
    const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

    const [isLiked, setIsLiked] = useState(false);

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

            // Fetch Like Status
            const likeRes = await fetch(`/api/likes?trackId=${id}`);
            if (likeRes.ok) {
                const data = await likeRes.json();
                setIsLiked(data.liked);
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

    const { pushToast } = useToast();

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        pushToast("success", "Link copied to clipboard");
    };

    const handleLike = async () => {
        try {
            const res = await fetch('/api/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId: track?.id }),
            });

            if (res.ok) {
                const data = await res.json();
                setIsLiked(data.liked);
                pushToast("success", data.liked ? "Added to Favorites" : "Removed from Favorites");
            } else {
                if (res.status === 401) {
                    pushToast("error", "Please login to like tracks");
                } else {
                    pushToast("error", "Failed to update like status");
                }
            }
        } catch (error) {
            pushToast("error", "An error occurred");
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
            pushToast("success", "Download started");
        }
    };

    const handlePlay = () => {
        if (!track) return;

        // Create a queue starting with this track, followed by related tracks
        const queue = [track, ...relatedTracks];

        playQueue(queue, 0);
    };

    if (loading) return <div className="text-center py-20 text-neutral-400">Loading...</div>;
    if (!track) return <div className="text-center py-20 text-neutral-400">Track not found</div>;

    const tagsList = track.tags ? track.tags.split(',').map(t => t.trim()) : [];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.coverContainer}>
                    <img
                        src={track.coverImageUrl || 'https://picsum.photos/seed/1/600/600'}
                        alt={track.title}
                        className={styles.cover}
                    />
                </div>

                <div className={styles.info}>
                    <span className={styles.type}>{track.type}</span>
                    <h1 className={styles.title}>{track.title}</h1>
                    <p className={styles.artist}>{track.artist || 'Ram'}</p>

                    <div className={styles.actions}>
                        <button
                            className={styles.playButton}
                            onClick={handlePlay}
                        >
                            <Play size={24} fill="white" />
                            {remixDetail.play}
                        </button>
                        <button className={styles.actionButton} aria-label="Like" onClick={handleLike}>
                            <Heart size={20} fill={isLiked ? "#a855f7" : "none"} color={isLiked ? "#a855f7" : "currentColor"} />
                        </button>
                        <button className={styles.actionButton} aria-label="Download" onClick={handleDownload}>
                            <Download size={20} />
                        </button>
                        <button className={styles.actionButton} aria-label="Share" onClick={handleShare}>
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>1.2K</span>
                    <span className={styles.statLabel}>Plays</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>150+</span>
                    <span className={styles.statLabel}>Downloads</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>{ratingStats.average || '-'}</span>
                    <span className={styles.statLabel}>Rating ({ratingStats.count})</span>
                </div>
            </div>

            <div className={styles.description}>
                <h2 className={styles.sectionTitle}>About this Track</h2>
                <p className={styles.text}>{track.description}</p>
                <div className={styles.tags}>
                    {tagsList.map(tag => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                </div>
            </div>

            {/* Rating & Feedback Section */}
            <div className={styles.description}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className={styles.sectionTitle}>{remixDetail.rate}</h2>
                    <button
                        onClick={() => setIsRatingModalOpen(true)}
                        className="text-sm text-purple-400 hover:text-purple-300 hover:underline"
                    >
                        Write a Review
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star
                                key={star}
                                size={24}
                                fill={star <= Math.round(ratingStats.average) ? "#ffd700" : "none"}
                                color={star <= Math.round(ratingStats.average) ? "#ffd700" : "#4b5563"}
                            />
                        ))}
                    </div>
                    <span className="text-2xl font-bold text-white">{ratingStats.average}</span>
                    <span className="text-neutral-500">/ 5</span>
                </div>

                <button
                    onClick={() => setIsRatingModalOpen(true)}
                    className={styles.actionButton}
                    style={{ width: 'auto', padding: '0 24px', borderRadius: '12px', background: 'rgba(147, 51, 234, 0.1)', border: '1px solid rgba(147, 51, 234, 0.3)', color: '#d8b4fe' }}
                >
                    {remixDetail.feedbackLabel}
                </button>

                {/* User Reviews */}
                {reviews.length > 0 && (
                    <div className="mt-10 space-y-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <MessageSquare size={18} />
                            User Reviews
                        </h3>
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
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
                                            <span className="text-xs text-neutral-500">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-neutral-300">{review.feedback}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
