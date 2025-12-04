'use client';

import React, { useState } from 'react';
import { X, Check, ChevronDown, Plus, Minus, ChevronUp, Camera, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/context/ToastContext";
import { NeonAvatar } from "@/components/neon-avatar";
import { CountrySelect } from '@/components/ui/CountrySelect';
import { useSession, signOut } from "next-auth/react";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

// Removed local COUNTRIES array in favor of CountrySelect component

const GENRES = [
    "Pop", "Hip-Hop", "R&B", "EDM", "Trap", "Drill",
    "Lo-fi", "Soundtrack / Score", "Rock", "Classical", "Tamil"
];

export function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
    const router = useRouter();
    const { data: session, update } = useSession();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [displayName, setDisplayName] = useState(user.name || "");
    const [age, setAge] = useState<number | "">(user.age || "");
    const [country, setCountry] = useState<string | null>(user.country || null);
    const [favoriteGenres, setFavoriteGenres] = useState<string[]>(() => {
        if (Array.isArray(user.favoriteGenres)) return user.favoriteGenres;
        if (typeof user.favoriteGenres === 'string') {
            try {
                return JSON.parse(user.favoriteGenres);
            } catch {
                return [];
            }
        }
        return [];
    });
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(user.profileImageUrl || user.image || null);
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const toggleGenre = (genre: string) => {
        if (favoriteGenres.includes(genre)) {
            setFavoriteGenres(favoriteGenres.filter(g => g !== genre));
        } else {
            setFavoriteGenres([...favoriteGenres, genre]);
        }
    };

    const handleRemovePhoto = () => {
        setProfileImageUrl(null);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError("");

        try {
            // 1. Upload to Cloudinary using unsigned preset
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'user_profile_private'); // Unsigned preset

            // Note: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME must be set in .env
            let cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            if (!cloudName) throw new Error("Missing Cloudinary Cloud Name");

            // Sanitize cloud name (remove spaces if present, common user error)
            cloudName = cloudName.trim().replace(/\s+/g, '');

            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) {
                const errorText = await uploadRes.text();
                console.error("Cloudinary Upload Error:", errorText);
                throw new Error(`Cloudinary upload failed: ${uploadRes.statusText} - Check your Cloud Name and Preset`);
            }
            const data = await uploadRes.json();

            setProfileImageUrl(data.secure_url);
            showToast({ variant: "success", message: "Image uploaded successfully" });
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Could not upload image. Please try again.");
        } finally {
            setIsUploading(false);
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
        if (typeof age === 'number' && (age < 3 || age > 120)) {
            setError("Age must be between 3 and 120");
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
                    profileImageUrl,
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Profile Update Error:", errorText);
                throw new Error(`Failed to update profile: ${errorText}`);
            }

            // Success
            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: displayName,
                    image: profileImageUrl
                }
            });
            router.refresh(); // Refresh server components to show new data
            onClose();
            showToast({ variant: "success", message: "Profile updated successfully." });
        } catch (err) {
            console.error(err);
            setError("Could not save changes. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.")) {
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error("Failed to delete account");
            }

            showToast({ variant: "success", message: "Account deleted successfully." });
            signOut({ callbackUrl: '/' });
        } catch (error) {
            console.error(error);
            setError("Could not delete account. Please try again.");
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

                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="mb-4 relative group">
                        <NeonAvatar name={displayName} imageUrl={profileImageUrl} size="lg" />
                        <label className="absolute bottom-0 right-0 p-2 bg-neutral-900 rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-neutral-800 cursor-pointer transition-colors shadow-lg">
                            <Camera size={14} />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={isUploading}
                            />
                        </label>
                    </div>

                    {profileImageUrl && (
                        <button
                            onClick={handleRemovePhoto}
                            className="text-xs text-red-400 hover:text-red-300 mb-2 hover:underline"
                        >
                            Remove Photo
                        </button>
                    )}

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
                            <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Age <span className="text-white/40">(3+)</span></label>
                            <div className="relative flex items-center bg-white/5 rounded-2xl border border-white/10 px-3 py-2 focus-within:border-[#C69AFF] focus-within:shadow-[0_0_18px_rgba(140,92,255,0.6)] transition-all">
                                <input
                                    type="number"
                                    min={3}
                                    max={120}
                                    value={age}
                                    onChange={(e) => setAge(e.target.valueAsNumber || "")}
                                    className="w-full bg-transparent text-white outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <div className="absolute right-2 inset-y-1 flex flex-col justify-center gap-[2px]">
                                    <button
                                        onClick={() => typeof age === 'number' && setAge(Math.min(120, age + 1))}
                                        className="w-6 h-4 flex items-center justify-center rounded-full bg-transparent text-white/60 hover:text-white hover:bg-white/10 text-xs"
                                    >
                                        <ChevronUp size={10} />
                                    </button>
                                    <button
                                        onClick={() => typeof age === 'number' && setAge(Math.max(3, age - 1))}
                                        className="w-6 h-4 flex items-center justify-center rounded-full bg-transparent text-white/60 hover:text-white hover:bg-white/10 text-xs"
                                    >
                                        <ChevronDown size={10} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Country</label>
                            <CountrySelect value={country} onChange={setCountry} />
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

                    {/* Danger Zone */}
                    <div className="pt-6 border-t border-white/10 mt-2">
                        <button
                            onClick={handleDeleteAccount}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2.5 rounded-full transition-colors text-sm font-medium"
                        >
                            <Trash2 size={16} /> Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
