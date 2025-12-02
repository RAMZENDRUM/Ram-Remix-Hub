'use client';

import React, { useEffect, useState } from 'react';
import Hero from '@/components/Hero';
import RemixCard from '@/components/RemixCard';
import styles from './page.module.css';
import uiText from '@/data/ui-text.json';
import { useSession } from 'next-auth/react';

interface Track {
  id: string;
  title: string;
  coverImageUrl?: string;
  isUnlisted: boolean;
}

import { usePlayer } from "@/context/PlayerContext";
import { formatTime } from "@/lib/formatTime";

export default function Home() {
  const { home } = uiText;
  const { data: session } = useSession();
  const user = session?.user;
  const [remixes, setRemixes] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentTrack, currentTime, duration, isPlaying } = usePlayer();

  useEffect(() => {
    async function fetchTracks() {
      try {
        const res = await fetch('/api/tracks');
        if (res.ok) {
          const data = await res.json();
          setRemixes(data);
        }
      } catch (error) {
        console.error("Failed to fetch tracks", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTracks();
  }, []);

  if (loading) {
    return (
      <main className="relative min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-neutral-500">Loading tracks...</div>
      </main>
    );
  }

  const newRemixes = remixes.slice(0, 4);
  const topRated = [...remixes].reverse().slice(0, 4);

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

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

      {/* Main content container */}
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pt-24 pb-16 md:flex-row md:items-center md:justify-between">
        {/* LEFT: Hero text */}
        <section className="max-w-xl space-y-6">
          {user && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium text-white/70">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Welcome back, {user.name || 'Ram'}
            </div>
          )}

          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
              Remix the <span className="text-sky-400">Future</span>.
            </h1>
            <p className="text-sm md:text-base text-white/70">
              Experience exclusive remixes, beats, and BGMs crafted by Ram.
              Dive back into your sound universe in one click.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              className="rounded-full bg-white px-7 py-2.5 text-sm font-semibold text-black
                         shadow-[0_0_30px_rgba(255,255,255,0.18)]
                         hover:bg-zinc-100 transition"
            >
              Continue Listening
            </button>
            <button
              className="text-sm font-medium text-white/70 hover:text-white/100 underline-offset-4 hover:underline"
            >
              View Playlists
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/50">
            <div className="flex -space-x-1">
              <span className="h-6 w-6 rounded-full bg-gradient-to-tr from-sky-500 to-emerald-400" />
              <span className="h-6 w-6 rounded-full bg-gradient-to-tr from-fuchsia-500 to-indigo-500" />
              <span className="h-6 w-6 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500" />
            </div>
            <span>Listeners are streaming your latest remix right now.</span>
          </div>
        </section>

        {/* RIGHT: Now Playing / Featured card */}
        <section
          className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5
                     p-5 backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.65)]
                     space-y-4"
        >
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/50">Now Playing</p>
              <p className="text-sm font-medium text-white/90">Your Remix Feed</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
              128 kbps
            </div>
          </header>

          {/* Fake equalizer / waveform */}
          <div className="flex h-20 items-end gap-[3px] overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-gradient-to-t from-white/5 via-sky-400/80 to-white"
                style={{
                  height: `${30 + (Math.sin(i * 0.5) + 1) * 20}px`,
                  animation: `bounceBar 1.4s ease-in-out ${i * 0.03}s infinite`,
                  animationPlayState: isPlaying ? 'running' : 'paused',
                }}
              />
            ))}
          </div>

          <div className="space-y-3 text-xs text-white/70">
            <div className="flex items-center justify-between">
              <span className="font-medium text-white/90 truncate max-w-[200px]">
                {currentTrack ? currentTrack.title : (remixes[0]?.title || 'Latest Remix')}
              </span>
              <span>{currentTrack ? `${formatTime(currentTime)} / ${formatTime(duration)}` : '03:42'}</span>
            </div>

            {/* Progress Bar */}
            <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-sky-400 transition-[width] duration-150"
                style={{ width: currentTrack ? `${Math.min(progress, 100)}%` : '40%' }}
              />
            </div>

            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                Up Next
              </p>
              <ul className="space-y-1.5">
                {remixes.slice(1, 4).map((track) => (
                  <li key={track.id} className="flex items-center justify-between">
                    <span className="truncate max-w-[200px]">{track.title}</span>
                    <span className="text-white/40">03:00</span>
                  </li>
                ))}
                {remixes.length < 2 && (
                  <>
                    <li className="flex items-center justify-between">
                      <span>Midnight Drive (Lo-Fi)</span>
                      <span className="text-white/40">02:57</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Cyber Pulse (EDM)</span>
                      <span className="text-white/40">04:11</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Existing Sections (New Remixes & Top Rated) */}
      <div className={styles.container}>
        {/* New Remixes Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{home.newRemixes}</h2>
            {newRemixes.length > 0 && <span className={styles.seeAll}>See All</span>}
          </div>
          {newRemixes.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 bg-neutral-900 rounded-lg border border-neutral-800">
              No remixes yet. Sign in as admin to upload your first track.
            </div>
          ) : (
            <div className={styles.grid}>
              {newRemixes.map((remix) => (
                <RemixCard
                  key={remix.id}
                  id={remix.id}
                  title={remix.title}
                  artist="Ram"
                  coverUrl={remix.coverImageUrl}
                />
              ))}
            </div>
          )}
        </section>

        {/* Top Rated Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{home.topRated}</h2>
            {topRated.length > 0 && <span className={styles.seeAll}>See All</span>}
          </div>
          {topRated.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 bg-neutral-900 rounded-lg border border-neutral-800">
              No rated remixes yet.
            </div>
          ) : (
            <div className={styles.grid}>
              {topRated.map((remix) => (
                <RemixCard
                  key={remix.id}
                  id={remix.id}
                  title={remix.title}
                  artist="Ram"
                  coverUrl={remix.coverImageUrl}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
