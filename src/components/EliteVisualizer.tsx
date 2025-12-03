"use client";

import React, { useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";

type EliteVisualizerProps = {
    coverUrl?: string; // Made optional to match existing usage
    size?: number; // canvas size in px
};

const EliteVisualizer: React.FC<EliteVisualizerProps> = ({
    coverUrl,
    size = 260,
}) => {
    const { analyser, isPlaying } = usePlayer();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const frameRef = useRef<number | null>(null);

    // load cover image
    const imageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        if (coverUrl) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = coverUrl;
            imageRef.current = img;
        }
    }, [coverUrl]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.scale(dpr, dpr);

        // We use the shared analyser from context instead of creating a new one
        // to avoid InvalidStateError from calling createMediaElementSource twice.
        // The analyser in GlobalPlayer is already configured with fftSize=2048.

        const bufferLength = analyser ? analyser.frequencyBinCount : 1024;
        const dataArray = new Uint8Array(bufferLength);

        const barCount = 96;
        const prevBars = new Array(barCount).fill(0);

        const center = { x: size / 2, y: size / 2 };
        const innerRadius = size * 0.27; // image radius
        const ringRadius = size * 0.34; // where bars start
        const maxBarLen = size * 0.16;

        let simOffset = 0;

        const draw = () => {
            let hasData = false;
            if (analyser && isPlaying) {
                analyser.getByteFrequencyData(dataArray);
                if (dataArray.some(v => v > 0)) hasData = true;
            }

            // --- compute 3 bands for overall “mood” ---
            const band = (start: number, end: number) => {
                let sum = 0;
                let count = 0;
                for (let i = start; i < end; i++) {
                    sum += dataArray[i];
                    count++;
                }
                return count ? sum / (count * 255) : 0;
            };

            let bass = 0, mids = 0, highs = 0;

            if (hasData) {
                bass = band(0, 40);        // 20–150 Hz
                mids = band(40, 140);      // 150–1k Hz
                highs = band(140, 256);    // 1k–20k Hz
            } else {
                // Simulation when paused or no data
                if (isPlaying) {
                    simOffset += 0.05;
                    bass = (Math.sin(simOffset) + 1) * 0.3;
                    mids = (Math.cos(simOffset * 1.5) + 1) * 0.2;
                }
            }

            // mood / intensity
            const bassPower = Math.pow(bass, 2.2);
            const midPower = Math.pow(mids, 1.6);
            const highPower = Math.pow(highs, 1.2);

            ctx.clearRect(0, 0, size, size);

            // background glow
            const totalPower = bassPower * 1.4 + midPower * 0.8 + highPower * 0.5;
            const glowRadius = innerRadius + maxBarLen * (0.4 + totalPower);

            const glowGradient = ctx.createRadialGradient(
                center.x,
                center.y,
                innerRadius * 0.4,
                center.x,
                center.y,
                glowRadius
            );
            glowGradient.addColorStop(0, "rgba(255, 255, 255, 0.08)");
            glowGradient.addColorStop(0.35, "rgba(168, 85, 247, 0.45)"); // purple
            glowGradient.addColorStop(0.7, "rgba(59, 130, 246, 0.12)");  // blue
            glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(center.x, center.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            // album image in center
            const img = imageRef.current;
            if (img && img.complete) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(center.x, center.y, innerRadius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(
                    img,
                    center.x - innerRadius,
                    center.y - innerRadius,
                    innerRadius * 2,
                    innerRadius * 2
                );
                ctx.restore();
            } else {
                // Fallback placeholder
                ctx.beginPath();
                ctx.arc(center.x, center.y, innerRadius, 0, Math.PI * 2);
                ctx.fillStyle = "#171717";
                ctx.fill();
            }

            // neon ring base
            const ringGradient = ctx.createLinearGradient(
                center.x - innerRadius,
                center.y - innerRadius,
                center.x + innerRadius,
                center.y + innerRadius
            );
            ringGradient.addColorStop(0, "#22d3ee"); // cyan
            ringGradient.addColorStop(0.5, "#a855f7"); // purple
            ringGradient.addColorStop(1, "#f97316"); // orange

            ctx.lineWidth = 4;
            ctx.strokeStyle = ringGradient;
            ctx.shadowColor = "rgba(168, 85, 247, 0.6)";
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.arc(center.x, center.y, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // bars around ring
            const step = Math.floor(bufferLength / barCount);

            for (let i = 0; i < barCount; i++) {
                let avg = 0;
                if (hasData) {
                    let sum = 0;
                    for (let j = 0; j < step; j++) {
                        const idx = i * step + j;
                        if (idx < bufferLength) sum += dataArray[idx];
                    }
                    avg = sum / (step || 1) / 255;
                } else {
                    // Simulation
                    const angle = (i / barCount) * Math.PI * 2;
                    if (isPlaying) {
                        avg = (Math.sin(angle * 5 + simOffset) * 0.5 + 0.5) * 0.3;
                    }
                }

                // emphasise bass for lower bars, highs for upper bars
                const positionFactor = i / barCount;
                const emphasis =
                    0.9 * bassPower * (1 - positionFactor) +
                    0.6 * midPower +
                    0.5 * highPower * positionFactor;

                let value = Math.pow(avg, 1.7) + emphasis * 0.35;

                // smoothing
                const prev = prevBars[i] || 0;
                const smoothed = prev + (value - prev) * 0.4;
                prevBars[i] = smoothed;

                const barLen = maxBarLen * Math.min(smoothed, 1.4);

                const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;

                const x0 = center.x + ringRadius * Math.cos(angle);
                const y0 = center.y + ringRadius * Math.sin(angle);
                const x1 = center.x + (ringRadius + barLen) * Math.cos(angle);
                const y1 = center.y + (ringRadius + barLen) * Math.sin(angle);

                const barGradient = ctx.createLinearGradient(x0, y0, x1, y1);
                barGradient.addColorStop(0, "rgba(56, 189, 248, 0.0)");
                barGradient.addColorStop(0.35, "rgba(56, 189, 248, 0.65)");
                barGradient.addColorStop(1, "rgba(244, 114, 182, 0.95)");

                ctx.strokeStyle = barGradient;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x0, y0);
                ctx.lineTo(x1, y1);
                ctx.stroke();
            }
        };

        const loop = () => {
            draw();
            frameRef.current = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [analyser, isPlaying, size]);

    return (
        <div className="relative flex items-center justify-center">
            <canvas
                ref={canvasRef}
                style={{
                    width: size,
                    height: size,
                    display: "block",
                    filter: "drop-shadow(0 0 25px rgba(59,130,246,0.40))",
                }}
            />
        </div>
    );
};

export default EliteVisualizer;
