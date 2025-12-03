"use client";

import React, { useRef, useEffect } from 'react';
import { usePlayer } from '@/context/PlayerContext';

interface CircularSpectrumVisualizerProps {
    imageSrc?: string;
    size?: number;
}

const CircularSpectrumVisualizer: React.FC<CircularSpectrumVisualizerProps> = ({
    imageSrc,
    size = 300
}) => {
    const { analyser, isPlaying } = usePlayer();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    // Load image for canvas
    useEffect(() => {
        if (imageSrc) {
            const img = new Image();
            img.src = imageSrc;
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                imgRef.current = img;
            };
        }
    }, [imageSrc]);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        // Configuration
        const BARS = 120; // Number of bars
        const RADIUS = size / 3.5; // Radius of the inner circle (image)
        const MAX_BAR_HEIGHT = size / 4; // Max height of bars
        const CENTER_X = size / 2;
        const CENTER_Y = size / 2;

        // Data array
        const bufferLength = analyser ? analyser.frequencyBinCount : 128;
        const dataArray = new Uint8Array(bufferLength);

        // Simulation offset
        let simOffset = 0;

        const draw = () => {
            animationId = requestAnimationFrame(draw);
            ctx.clearRect(0, 0, size, size);

            // 1. Get Data
            let hasData = false;
            if (analyser && isPlaying) {
                analyser.getByteFrequencyData(dataArray);
                if (dataArray.some(v => v > 0)) hasData = true;
            }

            // 2. Draw Image (Circular Clip)
            ctx.save();
            ctx.beginPath();
            ctx.arc(CENTER_X, CENTER_Y, RADIUS - 5, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            if (imgRef.current) {
                ctx.drawImage(imgRef.current, CENTER_X - RADIUS, CENTER_Y - RADIUS, RADIUS * 2, RADIUS * 2);
            } else {
                // Fallback placeholder
                ctx.fillStyle = '#171717';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#525252';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('No Image', CENTER_X, CENTER_Y);
            }
            ctx.restore();

            // 3. Draw Spectrum Bars

            // Simulation Logic
            if (!hasData) {
                if (isPlaying) {
                    simOffset += 0.1;
                } else {
                    simOffset += 0.02;
                }
            }

            for (let i = 0; i < BARS; i++) {
                // Map bar index to frequency index
                // We want bass (low freq) at the bottom (approx index 0)
                // and highs at the top.
                // Or standard circular: 0 to 360 degrees.

                // Let's do a mirrored look: Bass at bottom (90 deg?), Highs at top.
                // Actually, standard visualizers often wrap:
                // 0 deg (Right) -> Highs
                // 90 deg (Bottom) -> Bass
                // 180 deg (Left) -> Highs
                // 270 deg (Top) -> Mids?

                // Let's try mapping 0-BARS to 0-FrequencyLength/2 and mirror it.
                // So we have 2 symmetrical sides.

                const freqIndex = Math.floor((i < BARS / 2 ? i : BARS - i) * (bufferLength / (BARS / 1.5)));

                let value = 0;
                if (hasData) {
                    value = dataArray[freqIndex] || 0;

                    // Bass boost for lower indices
                    if (freqIndex < 10) value *= 1.2;
                } else {
                    // Simulation
                    const angle = (i / BARS) * Math.PI * 2;
                    if (isPlaying) {
                        value = Math.sin(angle * 5 + simOffset) * 50 +
                            Math.cos(angle * 3 - simOffset * 2) * 30 + 60;
                        // Add kick
                        if (i % 20 === 0 && Math.sin(simOffset) > 0.8) value += 50;
                    } else {
                        value = Math.sin(angle * 3 + simOffset) * 10 + 20;
                    }
                }

                // Clamp value
                value = Math.min(255, value);

                // Calculate bar height
                const barHeight = (value / 255) * MAX_BAR_HEIGHT;

                // Angle for this bar
                const angle = (i / BARS) * Math.PI * 2;

                // Start point (on radius)
                const startX = CENTER_X + Math.cos(angle) * RADIUS;
                const startY = CENTER_Y + Math.sin(angle) * RADIUS;

                // End point
                const endX = CENTER_X + Math.cos(angle) * (RADIUS + barHeight);
                const endY = CENTER_Y + Math.sin(angle) * (RADIUS + barHeight);

                // Draw Bar
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);

                // Gradient Color
                // Purple -> Pink -> Orange
                const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
                gradient.addColorStop(0, '#a855f7'); // Purple
                gradient.addColorStop(0.5, '#ec4899'); // Pink
                gradient.addColorStop(1, '#f97316'); // Orange

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 3; // Bar thickness
                ctx.lineCap = 'round';

                // Glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#d946ef';

                ctx.stroke();
            }
        };

        draw();

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [analyser, isPlaying, size]);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <canvas
                ref={canvasRef}
                width={size}
                height={size}
                className="absolute inset-0 z-10"
            />
            {/* Glow backing */}
            <div
                className="absolute inset-0 rounded-full bg-purple-500/10 blur-3xl z-0"
                style={{ transform: 'scale(0.8)' }}
            />
        </div>
    );
};

export default CircularSpectrumVisualizer;
