'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Pause, Clock, Heart, MoreHorizontal, Trash2, Shuffle, Disc } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

interface Track {
    id: string;
    title: string;
    artist: string | null;
    coverImageUrl: string | null;
    audioUrl: string;
    createdAt: string | Date;
}

interface Playlist {
    id: string;
    name: string;
    coverUrl: string | null;
    owner: {
        name: string | null;
    };
    tracks: Track[];
}

interface PlaylistDetailProps {
    playlist: Playlist;
    isOwner: boolean;
}

const PlaylistDetail: React.FC<PlaylistDetailProps> = ({ playlist, isOwner }) => {
    const { playQueue, currentTrack, isPlaying, togglePlay, toggleLike, likedIds } = usePlayer();
    const { showToast } = useToast();
    const router = useRouter();
    const [removingId, setRemovingId] = useState<string | null>(null);

    const handlePlayAll = () => {
        if (playlist.tracks.length === 0) return;
        playQueue(playlist.tracks as any, 0);
    };

    const handlePlayTrack = (track: Track, index: number) => {
        if (currentTrack?.id === track.id) {
            togglePlay();
        } else {
            playQueue(playlist.tracks as any, index);
        }
    };

    const handleRemoveTrack = async (trackId: string) => {
        if (!confirm("Remove this song from playlist?")) return;
        setRemovingId(trackId);
        try {
            const res = await fetch(`/api/playlists/${playlist.id}/tracks?trackId=${trackId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast({ variant: 'success', message: 'Removed from playlist' });
                router.refresh();
            } else {
                throw new Error("Failed");
            }
        } catch (err) {
            showToast({ variant: 'error', message: 'Failed to remove' });
        } finally {
            setRemovingId(null);
        }
    };

    const handleDeletePlaylist = async () => {
        if (!confirm("Are you sure you want to delete this playlist? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/playlists/${playlist.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast({ variant: 'success', message: 'Playlist deleted' });
                router.push('/playlists');
            } else {
                throw new Error("Failed");
            }
        } catch (err) {
            showToast({ variant: 'error', message: 'Failed to delete playlist' });
        }
    };

    return (
        <div className="min-h-screen bg-[#05050d] text-white pt-24 pb-32 px-6 md:px-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-8 items-end mb-12">
                <div className="relative w-48 h-48 md:w-60 md:h-60 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">
                    {playlist.coverUrl || (playlist.tracks[0]?.coverImageUrl) ? (
                        <Image
                            src={playlist.coverUrl || playlist.tracks[0]?.coverImageUrl || ''}
                            alt={playlist.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full bg-[#151520] flex items-center justify-center text-white/20">
                            <Disc size={64} />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4 flex-1">
                    <span className="uppercase text-xs font-bold tracking-widest text-secondary">Playlist</span>
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        {playlist.name}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="text-white font-medium">{playlist.owner.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{playlist.tracks.length} songs</span>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                        <button
                            onClick={handlePlayAll}
                            className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center hover:scale-105 hover:bg-accent/90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                        >
                            <Play fill="currentColor" className="ml-1" />
                        </button>

                        {isOwner && (
                            <button
                                onClick={handleDeletePlaylist}
                                className="px-6 py-3 rounded-full border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium text-red-400 hover:text-red-300 hover:border-red-500/30"
                            >
                                Delete Playlist
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden backdrop-blur-sm">
                <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-6 py-4 border-b border-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <div className="w-8 text-center">#</div>
                    <div>Title</div>
                    <div className="hidden md:block">Artist</div>
                    <div className="hidden md:block text-right">Date Added</div>
                    <div className="w-24 text-center">Actions</div>
                </div>

                <div className="flex flex-col">
                    {playlist.tracks.map((track, index) => {
                        const isCurrent = currentTrack?.id === track.id;
                        return (
                            <div
                                key={track.id}
                                className={`grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-6 py-3 items-center hover:bg-white/5 transition-colors group ${isCurrent ? 'bg-white/10' : ''
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
                                        {isCurrent && isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
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
                                    {track.artist || 'Unknown'}
                                </div>

                                <div className="hidden md:block text-right text-gray-500 text-sm">
                                    {new Date(track.createdAt).toLocaleDateString()}
                                </div>

                                <div className="flex items-center justify-center gap-4 w-24">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
                                        className={`transition-transform hover:scale-110 ${likedIds.has(track.id) ? 'text-red-500' : 'text-gray-600 hover:text-white'}`}
                                    >
                                        <Heart size={18} fill={likedIds.has(track.id) ? "currentColor" : "none"} />
                                    </button>

                                    {isOwner && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRemoveTrack(track.id); }}
                                            disabled={removingId === track.id}
                                            className="text-gray-600 hover:text-red-400 transition-colors"
                                            title="Remove from playlist"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {playlist.tracks.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            This playlist is empty. Go search for songs and add them!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlaylistDetail;
