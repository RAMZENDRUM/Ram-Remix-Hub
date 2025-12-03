"use client";

import React, { useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";

type EliteVisualizerProps = {
    coverUrl?: string;
    size?: number;
    audioRef?: React.RefObject<HTMLAudioElement | null>;
};

const EliteVisualizer: React.FC<EliteVisualizerProps> = ({
    coverUrl,
    size = 380,
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

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const bufferLength = analyser ? analyser.frequencyBinCount : 128;
        const dataArray = new Uint8Array(bufferLength);

        // Config
        const BAR_COUNT = 80; // Number of bars
        const INNER_RADIUS = size * 0.28; // Radius of the cover art circle
        const MAX_BAR_HEIGHT = size * 0.18; // Max length of bars
        const CENTER = size / 2;

        const renderFrame = () => {
            // 1. Get Data
            if (analyser && isPlaying) {
                analyser.getByteFrequencyData(dataArray);
            } else {
                // Sim data
                for (let i = 0; i < bufferLength; i++) {
                    dataArray[i] = 20; // Low baseline
                }
            }

            ctx.clearRect(0, 0, size, size);

            // 2. Draw Glow
            const glowGradient = ctx.createRadialGradient(CENTER, CENTER, INNER_RADIUS, CENTER, CENTER, size * 0.5);
            glowGradient.addColorStop(0, "rgba(124, 58, 237, 0.2)"); // Purple glow
            glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(CENTER, CENTER, size * 0.5, 0, Math.PI * 2);
            ctx.fill();

            // 3. Draw Cover Art (Circular)
            ctx.save();
            ctx.beginPath();
            ctx.arc(CENTER, CENTER, INNER_RADIUS - 5, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            if (imageRef.current && imageRef.current.complete) {
                ctx.drawImage(imageRef.current, CENTER - INNER_RADIUS, CENTER - INNER_RADIUS, INNER_RADIUS * 2, INNER_RADIUS * 2);
            } else {
                ctx.fillStyle = "#1a1a1a";
                ctx.fill();
            }
            ctx.restore();

            // 4. Draw Radial Bars
            // We map the 80 bars to the frequency data
            // We usually want to skip the very high frequencies as they are often empty
            const step = Math.floor(bufferLength * 0.7 / BAR_COUNT);

            for (let i = 0; i < BAR_COUNT; i++) {
                const dataIndex = i * step;
                const value = dataArray[dataIndex] || 0;

                // Scale value
                const percent = value / 255;
                const barHeight = Math.max(4, percent * MAX_BAR_HEIGHT); // Min height 4px

                const angle = (i / BAR_COUNT) * Math.PI * 2 - Math.PI / 2; // Start from top

                ctx.stroke();
            }

            // 5. Draw Inner Ring Border
            ctx.beginPath();
            ctx.arc(CENTER, CENTER, INNER_RADIUS, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(139, 92, 246, 0.5)"; // Light purple ring
            ctx.lineWidth = 2;
            ctx.stroke();

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
                }}
            />
        </div>
    );
};

export default EliteVisualizer;
