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
    size = 400, // Default size from CSS
}) => {
    const { analyser, isPlaying } = usePlayer();

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const waveRef = useRef<HTMLDivElement | null>(null);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        // Audio Data
        const bufferLength = analyser ? analyser.frequencyBinCount : 2048;
        const frequencyData = new Uint8Array(bufferLength);
        const audioData = new Uint8Array(bufferLength);

        // Config
        const audioSensitivity = 5.0;
        const audioReactivity = 1.0;

        const renderFrame = () => {
            // 1. Get Data
            if (analyser && isPlaying) {
                analyser.getByteFrequencyData(frequencyData);
                analyser.getByteTimeDomainData(audioData);
            } else {
                // Sim data if not playing
                for (let i = 0; i < bufferLength; i++) {
                    frequencyData[i] = 50 + Math.random() * 50;
                    audioData[i] = 128 + Math.sin(i * 0.1 + Date.now() * 0.005) * 20;
                }
            }

            const width = size;
            const height = size;
            const centerX = width / 2;
            const centerY = height / 2;

            // 2. Draw Circular Visualizer
            ctx.clearRect(0, 0, width, height);

            const numPoints = 180;
            const baseRadius = size * 0.35; // Slightly smaller to fit

            // Base Circle
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius * 1.2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 78, 66, 0.05)";
            ctx.fill();

            const numRings = 3;
            for (let ring = 0; ring < numRings; ring++) {
                const ringRadius = baseRadius * (0.7 + ring * 0.15);
                const opacity = 0.8 - ring * 0.2;

                ctx.beginPath();
                for (let i = 0; i < numPoints; i++) {
                    const freqRangeStart = Math.floor(
                        (ring * bufferLength) / (numRings * 1.5)
                    );
                    const freqRangeEnd = Math.floor(
                        ((ring + 1) * bufferLength) / (numRings * 1.5)
                    );
                    const freqRange = freqRangeEnd - freqRangeStart;

                    let sum = 0;
                    const segmentSize = Math.floor(freqRange / numPoints) || 1;
                    for (let j = 0; j < segmentSize; j++) {
                        const freqIndex = freqRangeStart + ((i * segmentSize + j) % freqRange);
                        sum += frequencyData[freqIndex] || 0;
                    }

                    const value = sum / (segmentSize * 255);
                    const adjustedValue = value * (audioSensitivity / 5) * audioReactivity;
                    const dynamicRadius = ringRadius * (1 + adjustedValue * 0.5);

                    const angle = (i / numPoints) * Math.PI * 2;
                    const x = centerX + Math.cos(angle) * dynamicRadius;
                    const y = centerY + Math.sin(angle) * dynamicRadius;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();

                // Gradients
                let gradient;
                if (ring === 0) {
                    gradient = ctx.createRadialGradient(centerX, centerY, ringRadius * 0.8, centerX, centerY, ringRadius * 1.2);
                    gradient.addColorStop(0, `rgba(255, 78, 66, ${opacity})`);
                    gradient.addColorStop(1, `rgba(194, 54, 47, ${opacity * 0.7})`);
                } else if (ring === 1) {
                    gradient = ctx.createRadialGradient(centerX, centerY, ringRadius * 0.8, centerX, centerY, ringRadius * 1.2);
                    gradient.addColorStop(0, `rgba(194, 54, 47, ${opacity})`);
                    gradient.addColorStop(1, `rgba(255, 179, 171, ${opacity * 0.7})`);
                } else {
                    gradient = ctx.createRadialGradient(centerX, centerY, ringRadius * 0.8, centerX, centerY, ringRadius * 1.2);
                    gradient.addColorStop(0, `rgba(255, 179, 171, ${opacity})`);
                    gradient.addColorStop(1, `rgba(255, 78, 66, ${opacity * 0.7})`);
                }

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2 + (numRings - ring);
                ctx.stroke();

                ctx.shadowBlur = 15;
                ctx.shadowColor = "rgba(255, 78, 66, 0.7)";
            }
            ctx.shadowBlur = 0;

            // 3. Update Audio Wave (DOM Element)
            if (waveRef.current) {
                let sum = 0;
                for (let i = 0; i < audioData.length; i++) {
                    sum += Math.abs(audioData[i] - 128);
                }
                const average = sum / audioData.length;
                const normalizedAverage = average / 128; // Normalize roughly

                const scale = 1 + normalizedAverage * audioReactivity * (audioSensitivity / 5);
                waveRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
                waveRef.current.style.borderColor = `rgba(255, 78, 66, ${0.1 + normalizedAverage * 0.3})`;
            }

            frameRef.current = requestAnimationFrame(renderFrame);
        };

        renderFrame();

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [analyser, isPlaying, size]);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Scanner Frame */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full border border-[#ff4e42] flex justify-center items-center pointer-events-none">
                {/* Corners */}
                <div className="absolute top-[-1px] left-[-1px] w-5 h-5 border-t-2 border-l-2 border-[#ff4e42]"></div>
                <div className="absolute top-[-1px] right-[-1px] w-5 h-5 border-t-2 border-r-2 border-[#ff4e42]"></div>
                <div className="absolute bottom-[-1px] left-[-1px] w-5 h-5 border-b-2 border-l-2 border-[#ff4e42]"></div>
                <div className="absolute bottom-[-1px] right-[-1px] w-5 h-5 border-b-2 border-r-2 border-[#ff4e42]"></div>

                {/* Scanner Line */}
                <div className="absolute w-full h-[2px] bg-[rgba(255,78,66,0.7)] top-0 shadow-[0_0_10px_#ff4e42] animate-[scan_4s_linear_infinite]"></div>

                {/* IDs */}
                <div className="absolute -bottom-8 left-0 text-xs text-[#ff4e42] font-mono">GSAP.TIMELINE</div>
                <div className="absolute -bottom-8 right-0 text-xs text-[#ff4e42] font-mono">IX2.SEQ(0x4F2E)</div>
            </div>

            {/* Audio Wave Ring */}
            <div
                ref={waveRef}
                className="absolute top-1/2 left-1/2 w-[110%] h-[110%] rounded-full border border-[rgba(255,78,66,0.1)] pointer-events-none z-0"
                style={{ transform: 'translate(-50%, -50%)' }}
            >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full border border-[rgba(255,78,66,0.05)] animate-[pulse_4s_infinite]"></div>
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    display: "block",
                    position: 'relative',
                    zIndex: 10
                }}
            />

            {/* Cover Art (Optional, centered) */}
            {coverUrl && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full overflow-hidden border border-[#ff4e42] z-20 opacity-80">
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                </div>
            )}

            <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes pulse {
          0% { width: 100%; height: 100%; opacity: 0.5; }
          50% { width: 120%; height: 120%; opacity: 0; }
          100% { width: 100%; height: 100%; opacity: 0.5; }
        }
      `}</style>
        </div>
    );
};

export default EliteVisualizer;
