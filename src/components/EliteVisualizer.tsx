"use client";

import React, { useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";

type EliteVisualizerProps = {
    audioRef?: React.RefObject<HTMLAudioElement | null>; // Optional, as we use context mainly
    coverUrl?: string;
    size?: number;
};

const EliteVisualizer: React.FC<EliteVisualizerProps> = ({
    coverUrl,
    size = 260,
}) => {
    // We use the shared analyser from PlayerContext.
    // This is CRITICAL because createMediaElementSource can only be called ONCE per audio element.
    // GlobalPlayer already sets this up, so we consume the data here.
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

        // High DPI scaling
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.scale(dpr, dpr);

        // Configuration
        const bufferLength = analyser ? analyser.frequencyBinCount : 2048;
        const dataArray = new Uint8Array(bufferLength);
        const BAR_COUNT = 100; // 80-120 bars as requested
        const prevBars = new Array(BAR_COUNT).fill(0);

        // Dimensions
        const center = { x: size / 2, y: size / 2 };
        const innerRadius = size * 0.28; // Album art radius
        const ringRadius = size * 0.35;  // Base of the bars
        const maxBarLen = size * 0.15;   // Max bar height

        let simOffset = 0;

        const renderFrame = () => {
            // 1. Get Audio Data
            let hasData = false;
            if (analyser && isPlaying) {
                analyser.getByteFrequencyData(dataArray);
                // Check if we actually have signal
                if (dataArray.some(v => v > 0)) hasData = true;
            }

            // 2. Compute Frequency Bands
            // Helper to get average energy of a range (0-255)
            const getEnergy = (startBin: number, endBin: number) => {
                if (!hasData) return 0;
                let sum = 0;
                const count = endBin - startBin;
                for (let i = startBin; i < endBin; i++) {
                    sum += dataArray[i] || 0;
                }
                return count > 0 ? sum / count : 0;
            };

            // Frequencies (assuming fftSize=2048, sampleRate=44.1k -> bin size ~21.5Hz)
            // Bass: 20-150Hz -> bins ~1 to ~7
            // Mids: 150-1kHz -> bins ~7 to ~46
            // Highs: 1k-20kHz -> bins ~46 to ~930

            let bass = 0, mids = 0, highs = 0;

            if (hasData) {
                bass = getEnergy(1, 8);      // Deep bass & kick
                mids = getEnergy(8, 50);     // Vocals & synths
                highs = getEnergy(50, 200);  // Hi-hats & shimmer
            } else if (isPlaying) {
                // Simulation mode (only if playing but no data yet)
                simOffset += 0.05;
                bass = 100 + Math.sin(simOffset) * 20;
                mids = 80 + Math.cos(simOffset * 1.5) * 15;
                highs = 60 + Math.sin(simOffset * 2) * 10;
            }

            // Normalize to 0-1 range for calculations
            const bassNorm = bass / 255;
            const midsNorm = mids / 255;
            const highsNorm = highs / 255;

            // Apply power curves for punchiness
            const bassPower = Math.pow(bassNorm, 2.5); // Stronger falloff for bass
            const midPower = Math.pow(midsNorm, 1.5);
            const highPower = Math.pow(highsNorm, 1.2);

            // 3. Clear Canvas
            ctx.clearRect(0, 0, size, size);

            // 4. Draw Background Glow (Bass Reactive)
            const totalEnergy = bassPower * 1.5 + midPower * 0.8;
            const glowRadius = innerRadius + (maxBarLen * 0.5 * totalEnergy);

            const glowGradient = ctx.createRadialGradient(center.x, center.y, innerRadius * 0.5, center.x, center.y, glowRadius * 1.5);
            glowGradient.addColorStop(0, "rgba(255, 255, 255, 0.05)");
            glowGradient.addColorStop(0.4, "rgba(168, 85, 247, 0.3)"); // Purple
            glowGradient.addColorStop(0.8, "rgba(6, 182, 212, 0.1)");  // Cyan
            glowGradient.addColorStop(1, "transparent");

            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(center.x, center.y, glowRadius * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // 5. Draw Album Art (Clipped)
            ctx.save();
            ctx.beginPath();
            ctx.arc(center.x, center.y, innerRadius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            if (imageRef.current && imageRef.current.complete) {
                ctx.drawImage(imageRef.current, center.x - innerRadius, center.y - innerRadius, innerRadius * 2, innerRadius * 2);
            } else {
                // Fallback placeholder
                ctx.fillStyle = "#171717";
                ctx.fill();
            }
            ctx.restore();

            // 6. Draw Neon Ring
            const ringGradient = ctx.createLinearGradient(
                center.x - innerRadius, center.y - innerRadius,
                center.x + innerRadius, center.y + innerRadius
            );
            ringGradient.addColorStop(0, "#06b6d4"); // Cyan
            ringGradient.addColorStop(0.5, "#a855f7"); // Purple
            ringGradient.addColorStop(1, "#f97316"); // Orange

            ctx.strokeStyle = ringGradient;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = "rgba(168, 85, 247, 0.6)";
            ctx.beginPath();
            ctx.arc(center.x, center.y, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset shadow for bars

            // 7. Draw Radial Bars
            // We map the 100 bars to the frequency spectrum.
            // We'll use a logarithmic distribution so more bars cover the bass/mids.

            for (let i = 0; i < BAR_COUNT; i++) {
                // Determine frequency index for this bar
                // Logarithmic scale: low i -> low freq, high i -> high freq
                const percent = i / BAR_COUNT;

                // Calculate target height based on frequency data
                let barValue = 0;
                if (hasData) {
                    // Simple mapping: 0-100 bars map to bins 0-200 (approx 4kHz)
                    const binIndex = Math.floor(percent * 150);
                    barValue = (dataArray[binIndex] || 0) / 255;
                } else if (isPlaying) {
                    // Sim
                    const angle = percent * Math.PI * 2;
                    barValue = (Math.sin(angle * 3 + simOffset) * 0.5 + 0.5) * 0.3;
                }

                // Apply Emphasis based on bands
                // Bass bars (low i) get boosted by bassPower
                let emphasis = 0;
                if (percent < 0.15) emphasis = bassPower;
                else if (percent < 0.5) emphasis = midPower;
                else emphasis = highPower;

                // Combine raw value with band power
                let targetHeight = Math.pow(barValue, 1.5) * 0.7 + emphasis * 0.3;
                targetHeight = Math.min(targetHeight, 1.2); // Cap at 1.2

                // Smoothing (Attack/Decay)
                const prev = prevBars[i];
                // Snap up fast (0.5), decay slow (0.15)
                const smoothFactor = targetHeight > prev ? 0.5 : 0.15;
                const currentHeight = prev + (targetHeight - prev) * smoothFactor;
                prevBars[i] = currentHeight;

                // Draw the bar
                const angle = (i / BAR_COUNT) * Math.PI * 2 - Math.PI / 2; // Start at top
                const barLen = currentHeight * maxBarLen;

                const x1 = center.x + ringRadius * Math.cos(angle);
                const y1 = center.y + ringRadius * Math.sin(angle);
                const x2 = center.x + (ringRadius + barLen) * Math.cos(angle);
                const y2 = center.y + (ringRadius + barLen) * Math.sin(angle);

                // Bar Gradient
                const barGrad = ctx.createLinearGradient(x1, y1, x2, y2);
                barGrad.addColorStop(0, "rgba(6, 182, 212, 0.1)"); // Cyan tip
                barGrad.addColorStop(0.5, "rgba(168, 85, 247, 0.8)"); // Purple body
                barGrad.addColorStop(1, "rgba(249, 115, 22, 0.9)"); // Orange base

                ctx.strokeStyle = barGrad;
                ctx.lineWidth = 2; // Thin, crisp bars
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }

            frameRef.current = requestAnimationFrame(renderFrame);
        };

        renderFrame();

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [analyser, isPlaying, size, coverUrl]);

    return (
        <div className="relative flex items-center justify-center">
            <canvas
                ref={canvasRef}
                style={{
                    width: size,
                    height: size,
                    display: "block",
                    filter: "drop-shadow(0 0 30px rgba(168,85,247,0.3))", // Global purple glow
                }}
            />
        </div>
    );
};

export default EliteVisualizer;
