'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/context/ToastContext';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

interface Track {
    id: string;
    title: string;
    artist?: string;
    description?: string;
    genre?: string;
    type: string;
    isUnlisted: boolean;
    coverImageUrl?: string | null;
    audioUrl?: string | null;
}

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { pushToast } = useToast();

    const [tracks, setTracks] = useState<Track[]>([]);
    const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Delete Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        artist: '',
        title: '',
        description: '',
        genre: '',
        type: 'Remix',
        unlisted: false,
    });

    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

    const fetchTracks = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/tracks');
            if (res.ok) {
                const data = await res.json();
                setTracks(data);
            }
        } catch (error) {
            console.error("Failed to fetch tracks", error);
            pushToast("error", "Failed to fetch tracks");
        }
    }, [pushToast]);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || session.user?.email !== 'ramzendrum@gmail.com') {
            router.push('/');
        } else {
            fetchTracks();
        }
    }, [session, status, router, fetchTracks]);

    if (status === 'loading' || !session || session.user?.email !== 'ramzendrum@gmail.com') return null;

    const onDeleteClick = (track: Track) => {
        setTrackToDelete(track);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!trackToDelete) return;

        try {
            const res = await fetch(`/api/admin/tracks/${trackToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
                pushToast("success", "Track deleted successfully");
                fetchTracks();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (e) {
            pushToast("error", "Error deleting track");
        } finally {
            setConfirmOpen(false);
            setTrackToDelete(null);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            const data = new FormData();
            data.append('artist', formData.artist);
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('genre', formData.genre);
            data.append('type', formData.type);
            data.append('unlisted', String(formData.unlisted));

            if (audioFile) {
                data.append('audioFile', audioFile);
            }

            if (coverImageFile) {
                data.append('coverImageFile', coverImageFile);
            }

            let res;
            if (editingTrackId) {
                // Update existing track
                res = await fetch(`/api/admin/tracks/${editingTrackId}`, {
                    method: 'PUT',
                    body: data,
                });
            } else {
                // Create new track
                res = await fetch('/api/admin/tracks', {
                    method: 'POST',
                    body: data,
                });
            }

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Operation failed');
            }

            pushToast("success", editingTrackId ? "Track updated successfully!" : "Track uploaded successfully!");
            setShowUpload(false);
            setEditingTrackId(null);
            // Reset form
            setFormData({
                artist: '',
                title: '',
                description: '',
                genre: '',
                type: 'Remix',
                unlisted: false,
            });
            setAudioFile(null);
            setCoverImageFile(null);
            fetchTracks();

        } catch (error: any) {
            pushToast("error", error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const onEditClick = (track: any) => {
        setFormData({
            artist: track.artist || '',
            title: track.title,
            description: track.description || '',
            genre: track.genre || '',
            type: track.type || 'Remix',
            unlisted: track.isUnlisted,
        });
        setEditingTrackId(track.id);
        setShowUpload(true);
        // We don't pre-fill files as they are optional during update
    };

    // ... (existing delete logic)

    return (
        <div className="max-w-6xl mx-auto p-8">
            {/* ... (header) */}

            {showUpload ? (
                <section className="mb-8 w-full max-w-4xl mx-auto rounded-3xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-xl shadow-2xl shadow-black/50 px-6 py-5 md:px-8 md:py-7 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
                            {editingTrackId ? 'Edit Track' : 'Upload New Remix'}
                        </h2>
                        <button
                            type="button"
                            onClick={() => {
                                setShowUpload(false);
                                setEditingTrackId(null);
                                setFormData({
                                    artist: '',
                                    title: '',
                                    description: '',
                                    genre: '',
                                    type: 'Remix',
                                    unlisted: false,
                                });
                            }}
                            className="inline-flex items-center rounded-full border border-neutral-600/70 bg-neutral-900/60 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:border-neutral-300 hover:bg-neutral-800/80 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    <form onSubmit={handleUpload} className="space-y-4">
                        {/* ... (inputs same as before) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                            <label className="flex flex-col gap-1 text-xs font-medium text-neutral-300">
                                <span>Artist (Required)</span>
                                <input
                                    type="text"
                                    required
                                    className="rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-500/70 transition-all placeholder:text-neutral-500"
                                    placeholder="Artist name (Required)"
                                    value={formData.artist}
                                    onChange={e => setFormData({ ...formData, artist: e.target.value })}
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-xs font-medium text-neutral-300">
                                <span>Title (Required)</span>
                                <input
                                    type="text"
                                    required
                                    className="rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-500/70 transition-all placeholder:text-neutral-500"
                                    placeholder="Title (Required)"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </label>
                        </div>

                        <label className="flex flex-col gap-1 text-xs font-medium text-neutral-300">
                            <span>Short Description (Required)</span>
                            <input
                                type="text"
                                required
                                className="rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-500/70 transition-all placeholder:text-neutral-500"
                                placeholder="Short Description (Required)"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                maxLength={500}
                            />
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                            <CustomDropdown
                                label="Genre"
                                name="genre"
                                value={formData.genre}
                                onChange={(val) => setFormData({ ...formData, genre: val })}
                                options={[
                                    "Pop", "Hip-Hop", "R&B", "EDM", "House", "Trap", "Lo-fi",
                                    "Chill / Ambient", "Rock", "Metal", "Indie", "Synthwave",
                                    "Future Bass", "Phonk", "Lofi Hip-Hop", "Classical",
                                    "Jazz", "Soundtrack / Score", "Other"
                                ]}
                                placeholder="Select genre"
                                required
                            />

                            <CustomDropdown
                                label="Track Type"
                                name="type"
                                value={formData.type}
                                onChange={(val) => setFormData({ ...formData, type: val })}
                                options={["Remix", "Instrumental", "BGM", "Song"]}
                                placeholder="Select type"
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.unlisted}
                                onChange={e => setFormData({ ...formData, unlisted: e.target.checked })}
                                id="unlisted"
                                className="rounded border-neutral-700 bg-neutral-950/60 text-purple-600 focus:ring-purple-500/70"
                            />
                            <label htmlFor="unlisted" className="text-sm text-neutral-300">Unlisted</label>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:gap-5">
                            <div className="flex items-center justify-between rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-300">
                                <span>Audio File {editingTrackId ? '(Optional - Upload to replace)' : '(Required)'}</span>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    required={!editingTrackId}
                                    name="audioFile"
                                    onChange={e => setAudioFile(e.target.files?.[0] || null)}
                                    className="text-[11px] file:mr-2 file:rounded-lg file:border-0 file:bg-purple-600/90 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-purple-500 cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-neutral-700 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-300">
                                <span>Cover Image {editingTrackId ? '(Optional - Upload to replace)' : '(Optional)'}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    name="coverImageFile"
                                    onChange={e => setCoverImageFile(e.target.files?.[0] || null)}
                                    className="text-[11px] file:mr-2 file:rounded-lg file:border-0 file:bg-purple-600/90 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-purple-500 cursor-pointer"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isUploading}
                            className="mt-4 w-full inline-flex items-center justify-center rounded-full border border-purple-500/70 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition-all hover:shadow-purple-600/70 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isUploading ? (editingTrackId ? 'Updating...' : 'Uploading...') : (editingTrackId ? 'Update Track' : 'Upload Track')}
                        </button>
                    </form>
                </section>
            ) : null}

            {/* Modern Glassmorphism Panel */}
            <div className="mt-10 w-full max-w-4xl mx-auto rounded-3xl bg-neutral-900/80 border border-neutral-800/80 shadow-xl shadow-black/40 backdrop-blur-xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-white">Uploaded Tracks</h2>
                    {!showUpload && (
                        <button
                            onClick={() => {
                                setShowUpload(true);
                                setEditingTrackId(null);
                                setFormData({
                                    artist: '',
                                    title: '',
                                    description: '',
                                    genre: '',
                                    type: 'Remix',
                                    unlisted: false,
                                });
                            }}
                            className="inline-flex items-center gap-2 rounded-full border border-purple-500/60 bg-gradient-to-r from-purple-600/80 via-fuchsia-500/80 to-indigo-500/80 px-4 py-2 text-xs md:text-sm font-medium text-white shadow-lg shadow-purple-900/40 transition-all hover:shadow-purple-600/60 hover:-translate-y-0.5 active:scale-95"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                            <span>Upload New Remix</span>
                        </button>
                    )}
                </div>

                {tracks.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500">
                        No tracks uploaded yet.
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {tracks.map((track) => (
                            <li key={track.id} className="group flex items-center justify-between gap-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/60 px-4 py-3 transition-all hover:border-neutral-500/80 hover:bg-neutral-900 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40">
                                {/* Left side: image + text */}
                                <div className="flex items-center gap-3">
                                    <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-700 to-neutral-900 flex-shrink-0">
                                        {track.coverImageUrl ? (
                                            <Image
                                                src={track.coverImageUrl}
                                                alt={track.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold tracking-wide text-neutral-300/80">
                                                NO ART
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm md:text-base font-semibold text-white truncate max-w-[180px] md:max-w-[260px]">
                                            {track.title}
                                        </span>
                                        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                                            {track.artist && <span className="truncate max-w-[120px]">{track.artist}</span>}
                                            <span className="inline-flex items-center gap-1 rounded-full border border-neutral-700/80 bg-neutral-900/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-300">
                                                {track.type}
                                            </span>
                                            {track.isUnlisted && (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-yellow-500">
                                                    Unlisted
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right side: buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onEditClick(track)}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/70 bg-blue-600/80 px-3 py-1 text-xs font-semibold text-white shadow-md shadow-blue-900/50 transition-all hover:bg-blue-500 hover:shadow-blue-500/80 active:scale-95"
                                    >
                                        <span className="hidden sm:inline">Edit</span>
                                    </button>
                                    <button
                                        onClick={() => onDeleteClick(track)}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-red-500/70 bg-red-600/80 px-3 py-1 text-xs font-semibold text-white shadow-md shadow-red-900/50 transition-all hover:bg-red-500 hover:shadow-red-500/80 active:scale-95"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Delete</span>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

            </div>

            <ConfirmDialog
                open={confirmOpen}
                title="Delete Track"
                description={`Are you sure you want to delete "${trackToDelete?.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
}
