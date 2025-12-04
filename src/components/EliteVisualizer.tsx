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

        const draw = () => {
            const width = size;
            const height = size;
            const centerX = width / 2;
            const centerY = height / 2;

            ctx.clearRect(0, 0, width, height);

            const numPoints = 180;
            const baseRadius = Math.min(width, height) * 0.25;

            // Soft purple inner glow
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius * 1.2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(168, 85, 255, 0.05)";
            ctx.fill();

            const numRings = 3;
            // Audio reactivity constants (simulated or passed)
            const audioSensitivity = 5;
            const audioReactivity = 1.2;

            for (let ring = 0; ring < numRings; ring++) {
                const ringRadius = baseRadius * (0.9 + ring * 0.15);
                const opacity = 0.8 - ring * 0.2;

                ctx.beginPath();

                for (let i = 0; i < numPoints; i++) {
                    const freqRangeStart = Math.floor(
                        (ring * bufferLength) / (numRings * 2)
                    );
                    const freqRangeEnd = Math.floor(
                        ((ring + 1) * bufferLength) / (numRings * 2)
                    );

                    const freqRange = Math.max(1, freqRangeEnd - freqRangeStart);

                    let sum = 0;
                    const dataIndex = freqRangeStart + Math.floor((i / numPoints) * freqRange);

                    const windowSize = 4;
                    let count = 0;
                    for (let w = 0; w < windowSize; w++) {
                        if (dataIndex + w < bufferLength) {
                            sum += dataArray[dataIndex + w];
                            count++;
                        }
                    }
                    const value = count > 0 ? sum / count : 0;

                    const adjustedValue = (value / 255) * (audioSensitivity / 5) * audioReactivity;

                    const dynamicRadius = ringRadius * (1 + adjustedValue * 0.3);
                    const angle = (i / numPoints) * Math.PI * 2;
                    const x = centerX + Math.cos(angle) * dynamicRadius;
                    const y = centerY + Math.sin(angle) * dynamicRadius;

                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                ctx.closePath();

                let gradient;
                if (ring === 0) {
                    gradient = ctx.createRadialGradient(
                        centerX, centerY, ringRadius * 0.8,
                        centerX, centerY, ringRadius * 1.2
                    );
                    gradient.addColorStop(0, `rgba(168, 85, 255, ${opacity})`);
                    gradient.addColorStop(1, `rgba(109, 40, 217, ${opacity * 0.7})`);
                } else if (ring === 1) {
                    gradient = ctx.createRadialGradient(
                        centerX, centerY, ringRadius * 0.8,
                        centerX, centerY, ringRadius * 1.2
                    );
                    gradient.addColorStop(0, `rgba(109, 40, 217, ${opacity})`);
                    gradient.addColorStop(1, `rgba(233, 213, 255, ${opacity * 0.7})`);
                } else {
                    gradient = ctx.createRadialGradient(
                        centerX, centerY, ringRadius * 0.8,
                        centerX, centerY, ringRadius * 1.2
                    );
                    gradient.addColorStop(0, `rgba(233, 213, 255, ${opacity})`);
                    gradient.addColorStop(1, `rgba(168, 85, 255, ${opacity * 0.7})`);
                }

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2 + (numRings - ring);
                ctx.shadowBlur = 15;
                ctx.shadowColor = "rgba(168, 85, 255, 0.7)";
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
        };

        const renderFrame = () => {
            if (analyser && isPlaying) {
                analyser.getByteFrequencyData(dataArray);
                draw();
                frameRef.current = requestAnimationFrame(renderFrame);
            } else {
                // Draw static idle state
                for (let i = 0; i < bufferLength; i++) {
                    dataArray[i] = 10; // Low baseline
                }
                draw();
            }
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
