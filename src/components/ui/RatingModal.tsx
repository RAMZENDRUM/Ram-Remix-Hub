"use client";

import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    trackId: string;
    onRatingSubmit: () => void;
}

export function RatingModal({ isOpen, onClose, trackId, onRatingSubmit }: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { pushToast } = useToast();

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) {
            pushToast("error", "Please select a star rating");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId, rating, feedback }),
            });

            if (res.ok) {
                pushToast("success", "Rating submitted successfully!");
                onRatingSubmit();
                onClose();
            } else {
                pushToast("error", "Failed to submit rating");
            }
        } catch (error) {
            pushToast("error", "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900/95 p-6 shadow-2xl shadow-purple-500/20 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6 text-center">Rate this Remix</h2>

                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star
                                size={32}
                                fill={(hoverRating || rating) >= star ? "#ffd700" : "none"}
                                color={(hoverRating || rating) >= star ? "#ffd700" : "#4b5563"}
                                className="transition-colors duration-200"
                            />
                        </button>
                    ))}
                </div>

                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Write your feedback here (optional)..."
                    className="w-full h-32 rounded-xl border border-neutral-700 bg-neutral-950/50 p-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none resize-none mb-6 transition-all"
                />

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-neutral-700 bg-transparent py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 rounded-xl bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-purple-600/20"
                    >
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
}
