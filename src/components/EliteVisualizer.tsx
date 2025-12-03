"use client";

import React, { useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";

type EliteVisualizerProps = {
    coverUrl?: string;
    size?: number;
    audioRef?: React.RefObject<HTMLAudioElement | null>; // Optional to match interface
};

const EliteVisualizer: React.FC<EliteVisualizerProps> = ({
    coverUrl,
    size = 260,
}) => {
    const { analyser, isPlaying } = usePlayer();

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const frameRef = useRef<number | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    // Load cover image
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
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const bufferLength = analyser ? analyser.frequencyBinCount : 2048;
        const dataArray = new Uint8Array(bufferLength);
        const BAR_COUNT = 96;
        const prevBars = new Array(BAR_COUNT).fill(0);

        const center = { x: size / 2, y: size / 2 };
        const innerRadius = size * 0.27;
        const ringRadius = size * 0.34;
        const maxBarLen = size * 0.16;

        // Shockwave state
        let shockwaveRadius = 0;
        let shockwaveAlpha = 0;
        let simOffset = 0;

        const renderFrame = () => {
            let hasData = false;
            if (analyser && isPlaying) {
                analyser.getByteFrequencyData(dataArray);
                if (dataArray.some(v => v > 0)) hasData = true;
            }

            // Helper to get average energy of a range
            const getEnergy = (start: number, end: number) => {
                if (!hasData) return 0;
                let sum = 0;
                let count = 0;
                for (let i = start; i < end; i++) {
                    sum += dataArray[i];
                    count++;
                }
                return count ? sum / (count * 255) : 0;
            };

            // Frequency bands
            let bass = 0, mids = 0, highs = 0;
            if (hasData) {
                bass = getEnergy(0, 40);
                mids = getEnergy(40, 140);
                highs = getEnergy(140, 256);
            } else if (isPlaying) {
                // Simulation
                simOffset += 0.05;
                bass = (Math.sin(simOffset) + 1) * 0.3;
                mids = (Math.cos(simOffset * 1.5) + 1) * 0.2;
                highs = (Math.sin(simOffset * 2) + 1) * 0.1;
            }

            const bassPower = Math.pow(bass, 2.2);
            const midPower = Math.pow(mids, 1.6);
            const highPower = Math.pow(highs, 1.2);

            // Clear canvas
            ctx.clearRect(0, 0, size, size);

            // Trigger Bass Shockwave
            if (bassPower > 0.32 && shockwaveAlpha < 0.05) {
                shockwaveRadius = ringRadius + maxBarLen * 0.3;
                shockwaveAlpha = 0.8;
            }

            // Background Glow
            const totalPower = bassPower * 1.4 + midPower * 0.8 + highPower * 0.4;
            const glowRadius = innerRadius + maxBarLen * (0.45 + totalPower);

            const glowGradient = ctx.createRadialGradient(
                center.x, center.y, innerRadius * 0.3,
                center.x, center.y, glowRadius
            );
            glowGradient.addColorStop(0, "rgba(255,255,255,0.06)");
            glowGradient.addColorStop(0.45, "rgba(129, 140, 248, 0.5)"); // Indigo/Purple
            glowGradient.addColorStop(1, "rgba(0,0,0,0)");

            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(center.x, center.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            // Center Cover Art
            const img = imageRef.current;
            if (img && img.complete) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(center.x, center.y, innerRadius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(img, center.x - innerRadius, center.y - innerRadius, innerRadius * 2, innerRadius * 2);
                ctx.restore();
            } else {
                ctx.beginPath();
                ctx.arc(center.x, center.y, innerRadius, 0, Math.PI * 2);
                ctx.fillStyle = "#171717";
                ctx.fill();
            }

            // Base Neon Ring
            const ringGradient = ctx.createLinearGradient(
                center.x - innerRadius, center.y - innerRadius,
                center.x + innerRadius, center.y + innerRadius
            );
            ringGradient.addColorStop(0, "#a855f7"); // Purple
            ringGradient.addColorStop(0.5, "#22c55e"); // Green
            ringGradient.addColorStop(1, "#ef4444"); // Red

            ctx.lineWidth = 4;
            ctx.strokeStyle = ringGradient;
            ctx.shadowColor = "rgba(168,85,247,0.65)";
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.arc(center.x, center.y, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Radial Bars
            const step = Math.floor(bufferLength / BAR_COUNT);

            for (let i = 0; i < BAR_COUNT; i++) {
                let avg = 0;
                if (hasData) {
                    let sum = 0;
                    for (let j = 0; j < step; j++) {
                        const idx = i * step + j;
                        if (idx < bufferLength) sum += dataArray[idx];
                    }
                    avg = sum / (step || 1) / 255;
                } else if (isPlaying) {
                    const angle = (i / BAR_COUNT) * Math.PI * 2;
                    avg = (Math.sin(angle * 5 + simOffset) * 0.5 + 0.5) * 0.3;
                }

                const positionFactor = i / BAR_COUNT; // 0 (low) -> 1 (high)

                // Emphasis
                const emphasis = 1.1 * bassPower * (1 - positionFactor) + 0.7 * midPower + 0.5 * highPower * positionFactor;
                let value = Math.pow(avg, 1.7) + emphasis * 0.35;

                // Smoothing
                const prev = prevBars[i] || 0;
                const smoothed = prev + (value - prev) * 0.4;
                prevBars[i] = smoothed;

                const barLen = maxBarLen * Math.min(smoothed, 1.4);
                const angle = (i / BAR_COUNT) * Math.PI * 2 - Math.PI / 2;

                const x0 = center.x + ringRadius * Math.cos(angle);
                const y0 = center.y + ringRadius * Math.sin(angle);
                const x1 = center.x + (ringRadius + barLen) * Math.cos(angle);
                const y1 = center.y + (ringRadius + barLen) * Math.sin(angle);

                // Color by band: Low=Purple, Mid=Green, High=Red
                let startColor, endColor;
                if (positionFactor < 0.33) { // Bass
                    startColor = "rgba(147, 51, 234, 0.4)"; // Purple
                    endColor = "rgba(216, 180, 254, 1)";
                } else if (positionFactor < 0.66) { // Mids
                    startColor = "rgba(34, 197, 94, 0.45)"; // Green
                    endColor = "rgba(190, 242, 100, 1)";
                } else { // Highs
                    startColor = "rgba(239, 68, 68, 0.45)"; // Red
                    endColor = "rgba(254, 202, 202, 1)";
                }

                const barGradient = ctx.createLinearGradient(x0, y0, x1, y1);
                barGradient.addColorStop(0, startColor);
                barGradient.addColorStop(1, endColor);

                ctx.lineWidth = 2;
                ctx.strokeStyle = barGradient;
                ctx.beginPath();
                ctx.moveTo(x0, y0);
                ctx.lineTo(x1, y1);
                ctx.stroke();
            }

            // Draw Bass Shockwave
            if (shockwaveAlpha > 0.01) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(center.x, center.y, shockwaveRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(74, 222, 128, ${shockwaveAlpha})`; // Emerald
                ctx.lineWidth = 3;
                ctx.shadowColor = `rgba(74, 222, 128, ${shockwaveAlpha})`;
                ctx.shadowBlur = 24;
                ctx.stroke();
                ctx.restore();

                shockwaveRadius += 2.4;
                shockwaveAlpha *= 0.9;
            }

            frameRef.current = requestAnimationFrame(renderFrame);
        };

        renderFrame();

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [analyser, isPlaying, size, coverUrl]);

    return (
        <div className="relative flex items-center justify-center bg-transparent">
            <canvas
                ref={canvasRef}
                style={{
                    width: size,
                    height: size,
                    display: "block",
                    background: "transparent",
                }}
            />
        </div>
    );
};

export default EliteVisualizer;
