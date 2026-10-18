import tracksJson from "@/data/tracks.json";
import usersJson from "@/data/users.json";
import playlistsJson from "@/data/playlists.json";

export interface TrackData {
    id: string;
    title: string;
    description?: string | null;
    artist?: string | null;
    tags?: string | null;
    genre?: string | null;
    type?: string;
    isUnlisted?: boolean;
    audioUrl: string;
    coverImageUrl?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UserData {
    id: string;
    name?: string | null;
    email: string;
    passwordHash?: string | null;
    image?: string | null;
    role?: string;
    age?: number | null;
    country?: string | null;
    favoriteGenres?: string | null;
    profileImageUrl?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

// In-memory state initialized from bundled JSON files
// This runs 100% serverless, no laptop running 24/7, no external DB needed.
const fallbackAudio = "https://res.cloudinary.com/dzqcuxchc/video/upload/v1764860390/King_bgm_xex90a.mp3";
const fallbackCover = "https://res.cloudinary.com/dzqcuxchc/image/upload/v1764860391/20250307_sqbv7g.jpg";

let tracksStore: TrackData[] = (tracksJson as any[]).map(t => ({
    ...t,
    audioUrl: t.audioUrl && t.audioUrl.startsWith("http") ? t.audioUrl : fallbackAudio,
    coverImageUrl: t.coverImageUrl && t.coverImageUrl.startsWith("http") ? t.coverImageUrl : (t.coverImageUrl || fallbackCover),
    createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString(),
    updatedAt: typeof t.updatedAt === 'string' ? t.updatedAt : new Date().toISOString(),
}));

let usersStore: UserData[] = [...(usersJson as UserData[])];
const likesStore = new Set<string>(); // "userId:trackId"

export function getLocalTracks(): TrackData[] {
    return tracksStore.filter(t => !t.isUnlisted);
}

export function getAllLocalTracks(): TrackData[] {
    return tracksStore;
}

export function getLocalTrackById(id: string): TrackData | null {
    return tracksStore.find(t => t.id === id) || null;
}

export function addLocalTrack(track: Omit<TrackData, "id" | "createdAt" | "updatedAt"> & { id?: string }): TrackData {
    const newTrack: TrackData = {
        ...track,
        id: track.id || `track_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    tracksStore.unshift(newTrack);
    return newTrack;
}

export function getLocalUserByEmail(email: string): UserData | null {
    const normalized = email.toLowerCase().trim();
    return usersStore.find(u => u.email.toLowerCase().trim() === normalized) || null;
}

export function getLocalUserById(id: string): UserData | null {
    return usersStore.find(u => u.id === id) || null;
}

export function addLocalUser(userData: { name?: string | null; email: string; passwordHash?: string | null; role?: string }): UserData {
    const existing = getLocalUserByEmail(userData.email);
    if (existing) {
        return existing;
    }
    const newUser: UserData = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: userData.name || "Music Lover",
        email: userData.email,
        passwordHash: userData.passwordHash || null,
        role: userData.role || "LISTENER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    usersStore.push(newUser);
    return newUser;
}

export function isTrackLiked(userId: string, trackId: string): boolean {
    return likesStore.has(`${userId}:${trackId}`);
}

export function toggleTrackLike(userId: string, trackId: string): boolean {
    const key = `${userId}:${trackId}`;
    if (likesStore.has(key)) {
        likesStore.delete(key);
        return false;
    } else {
        likesStore.add(key);
        return true;
    }
}

export function getLocalPlaylists() {
    return playlistsJson || [];
}
