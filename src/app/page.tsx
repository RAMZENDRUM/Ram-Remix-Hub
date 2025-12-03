'use client';

import React, { useEffect, useState, useRef } from 'react';
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

const AudioVisualizer = () => {
  const { analyser, isPlaying } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Store previous values for smoothing
  const previousDataRef = useRef<number[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    // FFT size 256 = 128 bins. We'll use a subset for the visualizer.
    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    // Initialize previous data if needed
    if (previousDataRef.current.length !== 40) {
      previousDataRef.current = new Array(40).fill(0);
    }

    // Linear Interpolation for smoothness
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    let simOffset = 0;

    const draw = () => {
      animationId = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      let hasData = false;
      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
        if (dataArray.some(v => v > 0)) hasData = true;
      }

      // SIMULATION FALLBACK
      if (!hasData) {
        if (isPlaying) {
          simOffset += 0.15; // Faster beat
          for (let i = 0; i < 40; i++) {
            // Complex wave simulation
            const val = Math.sin(i * 0.2 + simOffset) * 40 +
              Math.cos(i * 0.3 - simOffset * 1.5) * 20 + 80;
            // Fill dataArray for the loop below to consume
            // We map our 40 bars to the first 40 bins of dataArray for simplicity here
            dataArray[i] = val;
          }
        } else {
          // Idle gentle wave
          simOffset += 0.05;
          for (let i = 0; i < 40; i++) {
            dataArray[i] = Math.sin(i * 0.1 + simOffset) * 10 + 20;
          }
        }
      }

      // RENDER LOOP
      const barCount = 40;
      const barWidth = (width / barCount) * 0.6; // Thinner, more elegant bars
      const gap = (width - (barCount * barWidth)) / (barCount + 1);

      // Create Premium Gradient
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, '#0ea5e9'); // Sky 500 (Bottom)
      gradient.addColorStop(0.5, '#8b5cf6'); // Violet 500
      gradient.addColorStop(1, '#d946ef'); // Fuchsia 500 (Top)

      ctx.fillStyle = gradient;

      // Add Glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(139, 92, 246, 0.4)";

      // Step size to distribute 128 bins across 40 bars
      // We focus on the lower half (bass/mids) which is usually index 0-60
      const step = Math.floor(60 / barCount);

      for (let i = 0; i < barCount; i++) {
        // Get target value
        let value = 0;
        if (hasData) {
          // Average a few bins for stability
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += dataArray[(i * step) + j] || 0;
          }
          value = sum / step;
        } else {
          // Use simulated data
          value = dataArray[i];
        }

        // Apply Smoothing (Lerp)
        // factor 0.2 = responsive but smooth. 0.1 = very smooth/slow.
        const smoothValue = lerp(previousDataRef.current[i], value, 0.2);
        previousDataRef.current[i] = smoothValue;

        // Calculate Height
        // Scale 0-255 to 0-height
        const barHeight = (smoothValue / 255) * height;

        // Draw Rounded Bar
        const x = gap + i * (barWidth + gap);
        const y = height - barHeight;

        // Draw rect
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 4); // 4px border radius
        ctx.fill();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyser, isPlaying]);

  return <canvas ref={canvasRef} width={400} height={100} className="w-full h-full" />;
};

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

          {/* Real-time Audio Visualizer */}
          <div className="flex h-20 items-end justify-center gap-[2px] overflow-hidden w-full px-4">
            <AudioVisualizer />
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
