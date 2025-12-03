'use client';

import React, { useState } from 'react';
import { X, Check, ChevronDown, Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

const COUNTRIES = [
    "India",
    "United Kingdom",
    "United States",
    "Germany",
    "Japan",
    "France",
    "Other"
];

const GENRES = [
    "Pop", "Hip-Hop", "R&B", "EDM", "Trap", "Drill",
    "Lo-fi", "Soundtrack / Score", "Rock", "Classical", "Tamil"
];

export function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [displayName, setDisplayName] = useState(user.name || "");
    const [age, setAge] = useState<number | "">(user.age || "");
    const [country, setCountry] = useState(user.country || COUNTRIES[0]);
    const [favoriteGenres, setFavoriteGenres] = useState<string[]>(user.favoriteGenres || []);

    if (!isOpen) return null;

    const toggleGenre = (genre: string) => {
        if (favoriteGenres.includes(genre)) {
            setFavoriteGenres(favoriteGenres.filter(g => g !== genre));
        } else {
            setFavoriteGenres([...favoriteGenres, genre]);
        }
    };

    const handleSave = async () => {
        setError("");
        setIsLoading(true);

        // Validation
        if (!displayName.trim()) {
            setError("Display name is required");
            setIsLoading(false);
            return;
        }
        if (typeof age === 'number' && (age < 13 || age > 120)) {
            setError("Age must be between 13 and 120");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    displayName,
                    age: age === "" ? null : age,
                    country,
                    favoriteGenres,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to update profile");
            }

            // Success
            router.refresh(); // Refresh server components to show new data
            onClose();
            // Ideally show a toast here, but for now we just close
        } catch (err) {
            console.error(err);
            setError("Could not save changes. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-black/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 max-w-md w-full relative animate-in fade-in zoom-in duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-white mb-1">Edit Profile</h2>
                    <p className="text-sm text-white/60">Update how your profile appears in Ram Remix Hub.</p>
                </div>

                <div className="space-y-5">
                    {/* Display Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-white/5 rounded-2xl border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C69AFF] transition-colors"
                            placeholder="Your name"
                        />
                    </div>

                    {/* Age & Country Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Age <span className="text-white/40">(13+)</span></label>
                            <input
                                type="number"
                                min={13}
                                max={120}
                                value={age}
                                onChange={(e) => setAge(e.target.valueAsNumber || "")}
                                className="w-full bg-white/5 rounded-2xl border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C69AFF] transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Country</label>
                            <div className="relative">
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="w-full bg-white/5 rounded-2xl border border-white/10 px-4 py-3 text-white appearance-none focus:outline-none focus:border-[#C69AFF] transition-colors cursor-pointer"
                                >
                                    {COUNTRIES.map(c => (
                                        <option key={c} value={c} className="bg-neutral-900 text-white">{c}</option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Favorite Genres */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Favorite Genres</label>
                        <div className="flex flex-wrap gap-2">
                            {GENRES.map(genre => {
                                const isSelected = favoriteGenres.includes(genre);
                                return (
                                    <button
                                        key={genre}
                                        onClick={() => toggleGenre(genre)}
                                        className={`px-3 py-1 text-sm rounded-2xl border transition-all duration-200 ${isSelected
                                                ? 'bg-gradient-to-r from-[#C69AFF] to-[#6F5BFF] text-white font-semibold border-transparent shadow-[0_0_18px_rgba(140,92,255,0.6)]'
                                                : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/10'
                                            }`}
                                    >
                                        {genre}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl p-2">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 flex flex-col gap-3">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-[#C69AFF] to-[#6F5BFF] text-white font-semibold rounded-full py-3 hover:brightness-110 hover:shadow-[0_0_25px_rgba(140,92,255,0.7)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Saving...' : 'Save changes'}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="w-full bg-white/5 text-white/80 rounded-full py-2.5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
