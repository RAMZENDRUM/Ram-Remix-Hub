"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Disc, Play } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { useToast } from "@/context/ToastContext";

type Track = {
    id: string;
    title: string;
    artist: string;
    addedAt: string;
    coverImageUrl: string | null;
    audioUrl: string;
};

type Playlist = {
    id: string;
    name: string;
    coverUrl?: string | null;
    ownerName: string;
    isOwner: boolean;
    tracks: Track[];
};

export default function PlaylistDetailPage() {
    const params = useParams<{ id: string }>();
    // Unwrap params if it's a promise (Next.js 15), but useParams hook usually handles it.
    // Actually in Next 15 `useParams` returns a promise-like object? No, it returns params.
    // Wait, if async page component, params is promise.
    // But this is "use client", so useParams() is the hook.

    const router = useRouter();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    const { playQueue, currentTrack, isPlaying, togglePlay } = usePlayer();
    const { showToast } = useToast();

    const playlistId = params.id;

    useEffect(() => {
        if (!playlistId) return;

        const fetchPlaylist = async () => {
            try {
                const res = await fetch(`/api/playlists/${playlistId}`);
                if (!res.ok) {
                    console.error("Failed to load playlist");
                    router.push("/playlists");
                    return;
                }
                const data = await res.json();
                setPlaylist(data);
            } catch (err) {
                console.error("Error loading playlist:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylist();
    }, [playlistId, router]);

    const handleDeletePlaylist = async () => {
        if (!playlist) return;
        if (!confirm("Delete this playlist? This cannot be undone.")) return;

        try {
            setDeleting(true);
            const res = await fetch(`/api/playlists/${playlist.id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                console.error("Failed to delete playlist");
                showToast({ variant: 'error', message: "Failed to delete" });
                setDeleting(false);
                return;
            }
            showToast({ variant: 'success', message: "Playlist deleted" });
            router.push("/playlists");
        } catch (err) {
            console.error("Error deleting playlist:", err);
            setDeleting(false);
        }
    };

    const handleRemoveTrack = async (trackId: string) => {
        if (!playlist) return;
        if (!confirm("Remove song from playlist?")) return;

        try {
            const res = await fetch(`/api/playlists/${playlist.id}/tracks`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trackId }),
            });
            if (!res.ok) {
                showToast({ variant: 'error', message: "Failed to remove track" });
                return;
            }
            // update UI locally
            setPlaylist((prev) =>
                prev
                    ? { ...prev, tracks: prev.tracks.filter((t) => t.id !== trackId) }
                    : prev
            );
            showToast({ variant: 'success', message: "Removed from playlist" });
        } catch (err) {
            console.error("Error removing track:", err);
        }
    };

    const handlePlayAll = () => {
        if (!playlist || playlist.tracks.length === 0) return;
        // Adapt track structure for player if needed
        playQueue(playlist.tracks as any, 0);
    };

    const handlePlayTrack = (track: Track, index: number) => {
        if (currentTrack?.id === track.id) {
            togglePlay();
        } else {
            playQueue(playlist.tracks as any, index);
        }
    };

    if (loading) {
        return (
            <div className="p-10 text-center text-slate-200 mt-20">
                Loading playlist…
            </div>
        );
    }

    if (!playlist) {
        return (
            <div className="p-10 text-center text-slate-200 mt-20">
                Playlist not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#05050d] text-white pt-24 pb-32 px-6 md:px-12">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row gap-8 items-end mb-12">
                <div className="relative w-48 h-48 md:w-60 md:h-60 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-slate-800">
                    {playlist.coverUrl ? (
                        <Image
                            src={playlist.coverUrl}
                            alt={playlist.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                            <Disc size={64} />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4 flex-1">
                    <div className="text-xs uppercase tracking-[0.2em] text-secondary font-bold">
                        Playlist
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">{playlist.name}</h1>
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                        By <span className="font-semibold text-white">{playlist.ownerName}</span>
                        <span>•</span>
                        <span>{playlist.tracks.length} {playlist.tracks.length === 1 ? "track" : "tracks"}</span>
                    </div>

                    <div className="flex gap-4 mt-4 items-center">
                        <button
                            onClick={handlePlayAll}
                            className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center hover:scale-105 hover:bg-accent/90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                        >
                            <Play fill="currentColor" className="ml-1" />
                        </button>

                        {playlist.isOwner && (
                            <button
                                onClick={handleDeletePlaylist}
                                disabled={deleting}
                                className="px-6 py-3 rounded-full border border-white/10 text-sm font-medium text-red-400 hover:bg-white/5 transition-colors"
                            >
                                {deleting ? "Deleting…" : "Delete Playlist"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* TRACK LIST */}
            <div className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden backdrop-blur-sm">
                <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-6 py-4 border-b border-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <div className="w-8 text-center">#</div>
                    <div>Title</div>
                    <div className="hidden md:block">Artist</div>
                    <div className="hidden md:block text-right">Added</div>
                    <div className="w-16 flex justify-end">Actions</div>
                </div>

                {playlist.tracks.map((track, index) => {
                    const isCurrent = currentTrack?.id === track.id;
                    return (
                        <div
                            key={track.id}
                            className={`grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-6 py-3 items-center hover:bg-white/5 transition-colors group cursor-pointer ${isCurrent ? 'bg-white/10' : ''
                                }`}
                            onDoubleClick={() => handlePlayTrack(track, index)}
                        >
                            <div className="w-8 text-center flex justify-center text-gray-500 font-medium group-hover:text-white">
                                <div className="group-hover:hidden">
                                    {isCurrent && isPlaying ? (
                                        <div className="w-3 h-3 bg-accent animate-pulse rounded-full mx-auto" />
                                    ) : index + 1}
                                </div>
                                <button
                                    onClick={() => handlePlayTrack(track, index)}
                                    className="hidden group-hover:block hover:text-accent"
                                >
                                    <Play size={16} fill="currentColor" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 overflow-hidden">
                                {track.coverImageUrl && (
                                    <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0">
                                        <Image src={track.coverImageUrl} alt={track.title} fill className="object-cover" />
                                    </div>
                                )}
                                <div className="flex flex-col min-w-0">
                                    <span className={`truncate font-medium ${isCurrent ? 'text-accent' : 'text-white'}`}>
                                        {track.title}
                                    </span>
                                    <span className="md:hidden text-xs text-gray-500 truncate">{track.artist}</span>
                                </div>
                            </div>

                            <div className="hidden md:block text-gray-400 truncate text-sm">
                                {track.artist}
                            </div>

                            <div className="hidden md:block text-right text-gray-500 text-sm">
                                {new Date(track.addedAt).toLocaleDateString()}
                            </div>

                            <div className="flex items-center justify-end gap-4 w-16">
                                {playlist.isOwner && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveTrack(track.id);
                                        }}
                                        className="text-gray-600 hover:text-red-400 transition-colors"
                                        title="Remove from playlist"
                                    >
                                        <span className="text-xl">×</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {playlist.tracks.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No tracks in this playlist yet.
                    </div>
                )}
            </div>
        </div>
    );
}
