'use client';

import React, { useEffect, useState, useRef } from 'react';
import Hero from '@/components/Hero';
import RemixCard from '@/components/RemixCard';
import styles from './page.module.css';
import uiText from '@/data/ui-text.json';
import { useSession } from 'next-auth/react';
import EliteVisualizer from '@/components/EliteVisualizer';
import { usePlayer } from "@/context/PlayerContext";
import { formatTime } from "@/lib/formatTime";

interface Track {
  id: string;
  title: string;
  coverImageUrl?: string;
  isUnlisted: boolean;
}

export default function Home() {
  const { home } = uiText;
  const { data: session } = useSession();
  const { currentTrack, isPlaying, playTrack, togglePlay, queue, currentTime, duration } = usePlayer();
  const [greeting, setGreeting] = useState('');
  const user = session?.user;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const [remixes, setRemixes] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

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
      <section className="relative max-w-6xl mx-auto px-6 lg:px-12 pt-20 pb-10 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center">
        {/* LEFT: Hero text */}
        <div className="space-y-6">
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
        </div>

        {/* RIGHT: Visualizer & Now Playing */}
        <div className="flex flex-col items-center gap-4">
          {currentTrack ? (
            <>
              <div className="circular-visualizer relative">
                <EliteVisualizer
                  coverUrl={currentTrack.coverImageUrl}
                  size={300}
                />
              </div>

              <div
                className="
                  min-w-[260px]
                  rounded-2xl
                  bg-slate-900/60
                  px-5 py-4
                  shadow-[0_0_35px_rgba(56,189,248,0.35)]
                  backdrop-blur
                  translate-y-[-12px]
                "
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
                      Now Playing
                    </p>
                    <p className="text-sm font-semibold text-slate-50">
                      {currentTrack?.title ?? "—"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {currentTrack?.artist ?? ""}
                    </p>
                  </div>

                  {/* Small subtle status pill, NO 'LIVE' text */}
                  <div className="mt-[2px] flex items-center rounded-full border border-slate-700/70 bg-slate-900/80 px-2 py-[2px]">
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                    <span className="text-[10px] font-medium tracking-[0.18em] text-slate-300">
                      ACTIVE
                    </span>
                  </div>
                </div>

                {/* Progress line under text (optional) */}
                <div className="mt-3 h-[2px] w-full rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400"
                    style={{ width: progress + "%" }} // 0–100
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="relative flex items-center justify-center h-[300px] w-[300px] rounded-full border border-dashed border-neutral-800 bg-neutral-900/30">
              <div className="text-center text-neutral-500">
                <p className="text-sm font-medium">Select a track</p>
                <p className="text-xs opacity-50">to start visualizer</p>
              </div>
            </div>
          )}
        </div>
      </section>

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
