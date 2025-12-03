"use client";

import React, { useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";

type EliteVisualizerProps = {
    coverUrl?: string;
    size?: number;
    audioRef?: React.RefObject<HTMLAudioElement | null>; // Kept for interface compatibility
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

        // Liquid Ring Config
        const pointCount = 256; // resolution of the ring
        const prevOffsets = new Array(pointCount).fill(0);

        const center = { x: size / 2, y: size / 2 };
        const baseRadius = size * 0.32;   // where the ring sits
        const maxOffset = size * 0.09;    // how far peaks can go
        const innerImageRadius = size * 0.22;

        let simOffset = 0;

        const renderFrame = () => {
            let hasData = false;
            if (analyser && isPlaying) {
                analyser.getByteFrequencyData(dataArray);
                if (dataArray.some(v => v > 0)) hasData = true;
            }

            // Calculate average volume for breathing effect
            let volSum = 0;
            if (hasData) {
                // Only check the first ~half of bins where most energy is
                const checkLen = Math.floor(bufferLength / 2);
                for (let i = 0; i < checkLen; i++) volSum += dataArray[i];
                volSum = volSum / checkLen / 255;
            } else if (isPlaying) {
                // Sim volume
                simOffset += 0.05;
                volSum = (Math.sin(simOffset) + 1) * 0.15;
            }
            const avgVol = volSum; // 0-1

            ctx.clearRect(0, 0, size, size);

            // 1. Background Soft Glow
            const glowRadius = baseRadius + maxOffset * (0.4 + avgVol * 0.8);
            const glowGrad = ctx.createRadialGradient(
                center.x, center.y, innerImageRadius * 0.3,
                center.x, center.y, glowRadius
            );
            glowGrad.addColorStop(0, "rgba(59,130,246,0.35)");  // Blue
            glowGrad.addColorStop(0.5, "rgba(129,140,248,0.4)"); // Indigo
            glowGrad.addColorStop(1, "rgba(8,47,73,0)");         // Fade

            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(center.x, center.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            // 2. Center Cover Image
            const img = imageRef.current;
            if (img && img.complete) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(center.x, center.y, innerImageRadius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(img, center.x - innerImageRadius, center.y - innerImageRadius, innerImageRadius * 2, innerImageRadius * 2);
                ctx.restore();
            } else {
                ctx.beginPath();
                ctx.arc(center.x, center.y, innerImageRadius, 0, Math.PI * 2);
                ctx.fillStyle = "#171717";
                ctx.fill();
            }

            // 3. Liquid Ring Calculation
            const points: { x: number; y: number }[] = [];
            for (let i = 0; i < pointCount; i++) {
                let raw = 0;

                if (hasData) {
                    // Map FFT -> Radial Offsets
                    // We use the lower 80% of the spectrum
                    const freqIndex = Math.floor((i / pointCount) * bufferLength * 0.8);
                    raw = dataArray[freqIndex] / 255;
                } else if (isPlaying) {
                    // Simulation
                    const angle = (i / pointCount) * Math.PI * 2;
                    raw = (Math.sin(angle * 4 + simOffset) * 0.5 + 0.5) * 0.4;
                }

                let shaped = Math.pow(raw, 1.8); // Emphasise peaks

                // Smooth with previous value
                const prev = prevOffsets[i] || 0;
                const smoothed = prev + (shaped - prev) * 0.45;
                prevOffsets[i] = smoothed;

                const offset = maxOffset * smoothed;
                const radius = baseRadius + offset;

                const angle = (i / pointCount) * Math.PI * 2 - Math.PI / 2;
                const x = center.x + radius * Math.cos(angle);
                const y = center.y + radius * Math.sin(angle);
                points.push({ x, y });
            }

            // Close the ring
            if (points.length > 0) {
                points.push(points[0], points[1], points[2]);
            }

            // Ring Gradient (Purple <-> Blue)
            const ringGrad = ctx.createLinearGradient(
                center.x - baseRadius, center.y - baseRadius,
                center.x + baseRadius, center.y + baseRadius
            );
            ringGrad.addColorStop(0, "#22d3ee");  // Cyan-Blue
            ringGrad.addColorStop(0.5, "#6366f1"); // Indigo
            ringGrad.addColorStop(1, "#a855f7");   // Purple

            // 4. Draw Outer Soft Ring
            ctx.save();
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.beginPath();
            if (points.length > 0) {
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
            }
            ctx.closePath();
            ctx.strokeStyle = ringGrad;
            ctx.lineWidth = 14;
            ctx.shadowColor = "rgba(96,165,250,0.8)";
            ctx.shadowBlur = 28;
            ctx.globalAlpha = 0.65 + avgVol * 0.3;
            ctx.stroke();
            ctx.restore();

            // 5. Draw Inner Sharper Ring
            ctx.save();
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.beginPath();
            if (points.length > 0) {
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
            }
            ctx.closePath();
            ctx.strokeStyle = "rgba(191, 219, 254, 0.9)";
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.9;
            ctx.stroke();
            ctx.restore();

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
