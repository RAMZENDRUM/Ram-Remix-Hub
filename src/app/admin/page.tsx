'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Trash2, Music, Image as ImageIcon } from 'lucide-react';
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
    const { showToast } = useToast();

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
            showToast({ variant: "error", message: "Failed to fetch tracks" });
        }
    }, [showToast]);

    useEffect(() => {
        if (status === 'loading') return;

        // Allow if role is ADMIN OR if email matches (legacy check)
        const isAdmin = (session?.user as any)?.role === 'ADMIN' || session?.user?.email === 'ramzendrum@gmail.com';

        if (!session || !isAdmin) {
            router.push('/');
        } else {
            fetchTracks();
        }
    }, [session, status, router, fetchTracks]);

    const isAdmin = (session?.user as any)?.role === 'ADMIN' || session?.user?.email === 'ramzendrum@gmail.com';
    if (status === 'loading' || !session || !isAdmin) return null;

    const onDeleteClick = (track: Track) => {
        setTrackToDelete(track);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!trackToDelete) return;

        try {
            const res = await fetch(`/api/admin/tracks/${trackToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast({ variant: "success", message: "Track deleted successfully" });
                fetchTracks();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (e) {
            showToast({ variant: "error", message: "Error deleting track" });
        } finally {
            setConfirmOpen(false);
            setTrackToDelete(null);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            let audioUrl = null;
            let coverImageUrl = null;

            // Helper to upload file to Cloudinary
            const uploadFile = async (file: File, folder: string, resourceType: 'video' | 'image') => {
                // 1. Get signature
                const signRes = await fetch('/api/admin/sign-cloudinary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        folder: `ram-remix-hub/${folder}`,
                        preset: folder === 'audio' ? 'admin_remix_audio' : 'admin_remix_cover'
                    }),
                });

                if (!signRes.ok) {
                    const errorText = await signRes.text();
                    console.error("Sign request failed:", signRes.status, errorText);
                    throw new Error('Failed to sign upload request: ' + errorText);
                }
                const { signature, timestamp, cloudName, apiKey } = await signRes.json();
                console.log("Got signature for", folder, "cloudName:", cloudName, "apiKey:", apiKey);

                if (!cloudName || !apiKey) {
                    throw new Error("Missing Cloudinary configuration (cloudName or apiKey)");
                }

                // 2. Upload to Cloudinary
                const formData = new FormData();
                formData.append('file', file);
                formData.append('api_key', apiKey);
                formData.append('timestamp', timestamp.toString());
                formData.append('signature', signature);
                // formData.append('folder', `ram-remix-hub/${folder}`); // Preset handles folder
                formData.append('upload_preset', folder === 'audio' ? 'admin_remix_audio' : 'admin_remix_cover');

                const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) {
                    const err = await uploadRes.json();
                    console.error("Cloudinary upload failed:", err);
                    throw new Error(err.error?.message || 'Cloudinary upload failed');
                }

                const data = await uploadRes.json();
                console.log("Upload successful:", data.secure_url);
                return data.secure_url;
            };

            // Upload Audio if present
            if (audioFile) {
                audioUrl = await uploadFile(audioFile, 'audio', 'video'); // 'video' resource_type for audio
            }

            // Upload Cover if present
            if (coverImageFile) {
                coverImageUrl = await uploadFile(coverImageFile, 'covers', 'image');
            }

            // Prepare payload
            const payload = {
                artist: formData.artist,
                title: formData.title,
                description: formData.description,
                genre: formData.genre,
                type: formData.type,
                unlisted: formData.unlisted,
                audioUrl,       // will be null if not updated/uploaded
                coverImageUrl,  // will be null if not updated/uploaded
            };

            let res;
            if (editingTrackId) {
                // Update existing track
                res = await fetch(`/api/admin/tracks/${editingTrackId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } else {
                // Create new track
                if (!audioUrl) throw new Error("Audio file is required for new uploads");

                res = await fetch('/api/admin/tracks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Operation failed');
            }

            showToast({ variant: "success", message: editingTrackId ? "Track updated successfully!" : "Track uploaded successfully!" });
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
            console.error("Upload flow error:", error);
            showToast({ variant: "error", message: error.message });
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
                <section className="mb-12 w-full max-w-5xl mx-auto rounded-[2rem] bg-neutral-900/60 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-purple-900/20 px-8 py-10 md:px-12 md:py-12 space-y-8 relative overflow-hidden">
                    {/* Decorative background glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                    <div className="flex items-center justify-between relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent tracking-tight">
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
                            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition-colors backdrop-blur-md"
                        >
                            Cancel
                        </button>
                    </div>

                    <form onSubmit={handleUpload} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="flex flex-col gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                <span>Artist Name</span>
                                <input
                                    type="text"
                                    required
                                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-neutral-600 shadow-inner"
                                    placeholder="e.g. Ram"
                                    value={formData.artist}
                                    onChange={e => setFormData({ ...formData, artist: e.target.value })}
                                />
                            </label>
                            <label className="flex flex-col gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                <span>Track Title</span>
                                <input
                                    type="text"
                                    required
                                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-neutral-600 shadow-inner"
                                    placeholder="e.g. Summer Vibes Remix"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </label>
                        </div>

                        <label className="flex flex-col gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                            <span>Description</span>
                            <input
                                type="text"
                                required
                                className="rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-neutral-600 shadow-inner"
                                placeholder="Short description of the track..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                maxLength={500}
                            />
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${formData.unlisted ? 'bg-purple-600' : 'bg-neutral-700'}`}
                                    onClick={() => setFormData({ ...formData, unlisted: !formData.unlisted })}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${formData.unlisted ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                                <span className="text-sm font-medium text-neutral-300">Unlisted Track</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group relative rounded-2xl border border-dashed border-neutral-700 bg-black/20 hover:bg-black/40 hover:border-purple-500/50 transition-all p-6 text-center cursor-pointer">
                                <input
                                    type="file"
                                    accept="audio/*"
                                    required={!editingTrackId}
                                    name="audioFile"
                                    onChange={e => setAudioFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-2 pointer-events-none">
                                    <div className="p-3 rounded-full bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                                        <Music size={24} />
                                    </div>
                                    <span className="text-sm font-medium text-neutral-300">
                                        {audioFile ? audioFile.name : (editingTrackId ? 'Replace Audio (Optional)' : 'Upload Audio File')}
                                    </span>
                                    {!audioFile && <span className="text-xs text-neutral-500">MP3, WAV, FLAC up to 50MB</span>}
                                </div>
                            </div>

                            <div className="group relative rounded-2xl border border-dashed border-neutral-700 bg-black/20 hover:bg-black/40 hover:border-purple-500/50 transition-all p-6 text-center cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    name="coverImageFile"
                                    onChange={e => setCoverImageFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-2 pointer-events-none">
                                    <div className="p-3 rounded-full bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                                        <ImageIcon size={24} />
                                    </div>
                                    <span className="text-sm font-medium text-neutral-300">
                                        {coverImageFile ? coverImageFile.name : (editingTrackId ? 'Replace Cover (Optional)' : 'Upload Cover Art')}
                                    </span>
                                    {!coverImageFile && <span className="text-xs text-neutral-500">JPG, PNG up to 5MB</span>}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isUploading}
                                className="w-full relative overflow-hidden rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 p-[1px] group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <div className="relative rounded-full bg-black/10 backdrop-blur-sm px-8 py-4 transition-all group-hover:bg-transparent">
                                    <span className="relative flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-white">
                                        {isUploading ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                {editingTrackId ? 'Updating...' : 'Uploading...'}
                                            </>
                                        ) : (
                                            <>
                                                {editingTrackId ? 'Update Track' : 'Upload Track'}
                                            </>
                                        )}
                                    </span>
                                </div>
                            </button>

                            {/* Progress Bar Placeholder */}
                            {isUploading && (
                                <div className="mt-4 h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 animate-progress w-full origin-left scale-x-0" style={{ animation: 'progress 2s infinite linear' }} />
                                </div>
                            )}
                        </div>
                    </form>
                </section>
            ) : null}

            {/* Modern Glassmorphism Panel */}
            <div className="mt-10 w-full max-w-5xl mx-auto rounded-[2.5rem] bg-neutral-900/60 border border-white/5 shadow-2xl shadow-black/40 backdrop-blur-2xl p-8 md:p-10 space-y-8">
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
