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
        const BAR_COUNT = 64;
        const CENTER = size / 2;
        const RADIUS = size * 0.25;
        const MAX_BAR_HEIGHT = size * 0.2;

        const renderFrame = () => {
            // 1. Get Data
            if (analyser && isPlaying) {
                analyser.getByteFrequencyData(dataArray);
            } else {
                // Sim data
                for (let i = 0; i < bufferLength; i++) {
                    dataArray[i] = 10; // Low baseline
                }
            }

            ctx.clearRect(0, 0, size, size);

            // 2. Draw Circular Visualizer Background (Purple)
            // Soft purple fill
            ctx.beginPath();
            ctx.arc(CENTER, CENTER, RADIUS * 1.4, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(168, 85, 255, 0.05)";
            ctx.fill();

            // Purple Glow Gradient
            const glowGradient = ctx.createRadialGradient(CENTER, CENTER, RADIUS, CENTER, CENTER, RADIUS * 1.5);
            glowGradient.addColorStop(0, "rgba(168, 85, 255, 0.2)");
            glowGradient.addColorStop(1, "rgba(109, 40, 217, 0)");
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(CENTER, CENTER, RADIUS * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // 3. Draw Cover Art (Circular)
            ctx.save();
            ctx.beginPath();
            ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            if (imageRef.current && imageRef.current.complete) {
                ctx.drawImage(imageRef.current, CENTER - RADIUS, CENTER - RADIUS, RADIUS * 2, RADIUS * 2);
            } else {
                ctx.fillStyle = "#1a1a1a";
                ctx.fill();
            }
            ctx.restore();

            // 4. Draw Radial Bars (Purple Spectrum)
            // We'll use a subset of the data array to match BAR_COUNT
            const step = Math.floor(bufferLength / BAR_COUNT);

            for (let i = 0; i < BAR_COUNT; i++) {
                const dataIndex = i * step;
                const value = dataArray[dataIndex] || 0;

                const percent = value / 255;
                const barHeight = Math.max(4, percent * MAX_BAR_HEIGHT);

                const angle = (i / BAR_COUNT) * Math.PI * 2 - Math.PI / 2;

                // Purple hue range: 260 - 280
                const hue = 260 + (i / BAR_COUNT) * 20;
                ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

                ctx.save();
                ctx.translate(CENTER, CENTER);
                ctx.rotate(angle);
                // Draw bar starting from just outside the radius
                ctx.fillRect(RADIUS + 10, -2, barHeight, 4);
                ctx.restore();
            }

            // 5. Inner Ring (Light Purple)
            ctx.beginPath();
            ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(168, 85, 255, 0.5)";
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
