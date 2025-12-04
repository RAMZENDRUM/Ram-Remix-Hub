'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/app/page.module.css';
import uiText from '@/data/ui-text.json';
import { useSession } from 'next-auth/react';
import { usePlayer } from "@/context/PlayerContext";
import { HeroSection } from './HeroSection';
import { SectionPanel } from './SectionPanel';
import { Remix } from './HomeRemixCard';

interface Track {
    id: string;
    title: string;
    artist?: string | null;
    coverImageUrl?: string | null;
    isUnlisted: boolean;
    createdAt: Date;
}

interface HomeClientProps {
    initialRemixes: Track[];
}

export default function HomeClient({ initialRemixes }: HomeClientProps) {
    const { home } = uiText;
    const { data: session } = useSession();
    const { currentTrack, queue, currentTime, duration } = usePlayer();
    const user = session?.user;

    const mapToRemix = (track: Track): Remix => ({
        id: track.id,
        title: track.title,
        artist: track.artist || 'Ram',
        coverUrl: track.coverImageUrl || '',
    });

    const newRemixes = initialRemixes.slice(0, 4).map(mapToRemix);
    // Note: Sorting should ideally be done on server or passed pre-sorted, but reversing here is cheap for small arrays
    const topRated = [...initialRemixes].reverse().slice(0, 4).map(mapToRemix);

    return (
        <main className="relative min-h-screen text-white overflow-hidden pb-24">
            {/* Soft spotlight background */}
            <div
                className="pointer-events-none absolute -left-40 top-10 h-[480px] w-[480px]
                   rounded-full bg-[radial-gradient(circle_at_center,_rgba(90,151,255,0.25),_transparent_70%)]
                   blur-3xl opacity-70"
            />
            <div
                className="pointer-events-none absolute right-[-200px] bottom-0 h-[520px] w-[520px]
                   rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12),_transparent_70%)]
                   blur-3xl opacity-60"
            />

            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 pb-32 pt-20 lg:px-0">
                <HeroSection
                    user={user}
                    currentTrack={currentTrack}
                    duration={duration}
                    currentTime={currentTime}
                />

                <SectionPanel
                    title={home.newRemixes}
                    subtitle="Fresh drops from Ram"
                    href="/releases"
                    remixes={newRemixes}
                />

                <SectionPanel
                    title={home.topRated}
                    subtitle="Most loved by listeners"
                    href="/top-rated"
                    remixes={topRated}
                />
            </div>
        </main>
    );
}
