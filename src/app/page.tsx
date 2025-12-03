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
  const previousDataRef = useRef<number[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    // Increase FFT size for better resolution (must be power of 2)
    // 2048 = 1024 frequency bins.
    // Sample rate is usually 44.1kHz.
    // Bin width ≈ 44100 / 2048 ≈ 21.5 Hz per bin.
    if (analyser) analyser.fftSize = 2048;

    const bufferLength = analyser ? analyser.frequencyBinCount : 1024;
    const dataArray = new Uint8Array(bufferLength);

    const BAR_COUNT = 40;
    if (previousDataRef.current.length !== BAR_COUNT) {
      previousDataRef.current = new Array(BAR_COUNT).fill(0);
    }

    // Linear Interpolation
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

      // --- FREQUENCY MAPPING LOGIC ---
      // We want 40 bars.
      // Bass (20-150Hz) -> Bins 1-7 (approx)
      // Low Mids (150-600Hz) -> Bins 8-28
      // Mids (600-2kHz) -> Bins 29-93
      // Highs (2k-20kHz) -> Bins 94+

      // We will distribute these logarithmically or manually to the 40 bars.
      // Center bars = Bass. Outer bars = Highs.

      const targetValues = new Array(BAR_COUNT).fill(0);

      if (hasData) {
        // Map frequency bins to bars.
        // We'll use a logarithmic scale to give more width to low frequencies.

        for (let i = 0; i < BAR_COUNT; i++) {
          // Logarithmic mapping:
          // We want to cover bins 0 to ~600 (up to ~12kHz)
          // Simple approach: Group bins.

          let startIndex, endIndex;

          // Custom mapping for 40 bars to emphasize bass
          if (i < 4) { // Deep Bass (20-60Hz)
            startIndex = 1 + i;
            endIndex = startIndex + 1;
          } else if (i < 12) { // Kick/Bass (60-250Hz)
            startIndex = 5 + (i - 4) * 2;
            endIndex = startIndex + 2;
          } else if (i < 24) { // Mids (250-2kHz)
            startIndex = 21 + (i - 12) * 8;
            endIndex = startIndex + 8;
          } else { // Highs (2k+)
            startIndex = 117 + (i - 24) * 25;
            endIndex = startIndex + 25;
          }

          // Average amplitude in this range
          let sum = 0;
          let count = 0;
          for (let j = startIndex; j < endIndex && j < bufferLength; j++) {
            sum += dataArray[j];
            count++;
          }
          const avg = count > 0 ? sum / count : 0;

          // Boost bass frequencies visually
          let boost = 1;
          if (i < 12) boost = 1.2; // Bass boost
          if (i > 30) boost = 1.5; // Treble boost (usually quieter)

          targetValues[i] = Math.min(255, avg * boost);
        }

      } else {
        // SIMULATION
        if (isPlaying) {
          simOffset += 0.2;
          for (let i = 0; i < BAR_COUNT; i++) {
            // Simulate a "kick" every ~60 frames
            const kick = (Math.sin(simOffset * 0.5) > 0.9) && (i < 10) ? 100 : 0;
            const wave = Math.sin(i * 0.3 + simOffset) * 30 + 50;
            targetValues[i] = wave + kick;
          }
        } else {
          simOffset += 0.05;
          for (let i = 0; i < BAR_COUNT; i++) {
            targetValues[i] = Math.sin(i * 0.1 + simOffset) * 10 + 10;
          }
        }
      }

      // --- RENDERING ---
      const barWidth = (width / BAR_COUNT) * 0.6;
      const gap = (width - (BAR_COUNT * barWidth)) / (BAR_COUNT + 1);

      // Gradient
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, '#0ea5e9'); // Sky
      gradient.addColorStop(0.5, '#8b5cf6'); // Violet
      gradient.addColorStop(1, '#d946ef'); // Fuchsia

      ctx.fillStyle = gradient;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(139, 92, 246, 0.5)";

      for (let i = 0; i < BAR_COUNT; i++) {
        // SMOOTHING
        // Attack is fast (0.3), Decay is slow (0.1)
        const current = previousDataRef.current[i];
        const target = targetValues[i];
        const factor = target > current ? 0.4 : 0.15; // Snap up, float down

        const smoothValue = lerp(current, target, factor);
        previousDataRef.current[i] = smoothValue;

        const barHeight = (smoothValue / 255) * height;

        // Draw Mirrored from Center? Or Standard?
        // Let's do Standard for accurate EQ visualization, 
        // OR Mirrored for aesthetics. User asked for "accurate beat".
        // Standard EQ (Low -> High) is often clearer for "beat accuracy".
        // But centered looks cooler. Let's do Mirrored but with Bass in Center.

        // To do Bass in Center:
        // We need to map our 0-40 array (Low->High) to Center->Out.
        // Array index 0 (Bass) goes to Center. Array index 39 (High) goes to Edges.

        // Actually, the previous code drew index 0 at the center and expanded out.
        // That means Center = Bass, Edges = Treble. This is perfect.

        const centerX = width / 2;
        const xOffset = (barWidth + 1) * i;

        // Right side
        ctx.fillRect(centerX + xOffset, (height - barHeight) / 2, barWidth, barHeight);
        // Left side
        ctx.fillRect(centerX - xOffset - barWidth, (height - barHeight) / 2, barWidth, barHeight);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyser, isPlaying]);

  return <canvas ref={canvasRef} width={400} height={100} className="w-full h-full opacity-90" />;
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
