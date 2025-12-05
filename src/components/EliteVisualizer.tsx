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

    // optional – still load cover for future use if you need it
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
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // reset & scale once

        const bufferLength = analyser ? analyser.frequencyBinCount : 256;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            const width = size;
            const height = size;
            const centerX = width / 2;
            const centerY = height / 2;

            ctx.clearRect(0, 0, width, height);

            const minDim = Math.min(width, height);
            // keep ~10% padding (enough for glow, but maximize size)
            const safeRadius = (minDim / 2) * 0.90;

            // ======== ANALYSE CURRENT AUDIO FRAME =========
            let sumSq = 0;
            let bassSum = 0;
            let bassCount = 0;

            const bassEnd = Math.floor(bufferLength * 0.15); // lowest ~15% = bass

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 255; // 0..1
                sumSq += v * v;
                if (i < bassEnd) {
                    bassSum += v;
                    bassCount++;
                }
            }

            const rms = Math.sqrt(sumSq / bufferLength) || 0; // overall loudness
            const bassAvg = bassCount ? bassSum / bassCount : 0; // bass energy

            // global breathing based on bass
            const globalPulse = 1 + bassAvg * 0.2;

            const numPoints = 220; // more points → smoother 360° ring
            // Reduce base size so there's ROOM to spike
            const baseRadius = safeRadius * 0.38 * globalPulse;

            // Soft central glow (stays inside safe radius)
            const innerGlowRadius = baseRadius * 1.5;
            const glowGrad = ctx.createRadialGradient(
                centerX,
                centerY,
                innerGlowRadius * 0.15,
                centerX,
                centerY,
                innerGlowRadius
            );
            glowGrad.addColorStop(0, "rgba(15,23,42,0)");
            glowGrad.addColorStop(0.55, "rgba(56,189,248,0.25)"); // neon cyan
            glowGrad.addColorStop(1, "rgba(88,28,135,0.15)"); // deep purple
            ctx.beginPath();
            ctx.arc(centerX, centerY, innerGlowRadius, 0, Math.PI * 2);
            ctx.fillStyle = glowGrad;
            ctx.fill();

            const numRings = 3;

            // these control how hard the spectrum moves
            const baseSensitivity = 0.65; // overall scale
            const beatBoost = 0.8 + bassAvg * 0.8 + rms * 0.4; // reacts to beat+volume

            for (let ring = 0; ring < numRings; ring++) {
                // ======== RING GEOMETRY =========
                // base ring radius – directly relative to safeRadius, so we don't need a clamp
                const ringBaseFactor = 0.46 + ring * 0.16; // inner ~0.46, middle ~0.62, outer ~0.78
                const ringRadius =
                    safeRadius * ringBaseFactor * (1 + rms * 0.08);

                const opacity = 0.95 - ring * 0.18; // outer rings slightly lighter
                ctx.beginPath();

                // which part of spectrum this ring uses:
                const ringStart = ring === 0 ? 0 : (ring / numRings) * bufferLength;
                const ringEnd =
                    ring === numRings - 1
                        ? bufferLength
                        : ((ring + 1) / numRings) * bufferLength;
                const rangeSize = Math.max(1, Math.floor(ringEnd - ringStart));

                for (let i = 0; i < numPoints; i++) {
                    // map this angle to a small slice of the ring's frequency range
                    const indexInRange = Math.floor((i / numPoints) * rangeSize);
                    const dataIndex = Math.min(
                        bufferLength - 1,
                        Math.floor(ringStart + indexInRange)
                    );

                    // small smoothing window over neighbouring bins
                    const windowSize = 4;
                    let sum = 0;
                    let count = 0;
                    for (let w = 0; w < windowSize; w++) {
                        const idx = dataIndex + w;
                        if (idx < bufferLength) {
                            sum += dataArray[idx];
                            count++;
                        }
                    }
                    const avg = count ? sum / count : 0;

                    // normalize 0..1 and shape response
                    let norm = avg / 255;
                    norm = Math.pow(norm, 0.85); // make quieter parts still visible

                    // tie this ring's movement to beat/volume
                    const ringEnergy =
                        baseSensitivity *
                        beatBoost *
                        (ring === 0 ? 1.2 : ring === 1 ? 1.0 : 0.9);

                    const adjusted = norm * ringEnergy;

                    // how far the ring is allowed to "dance" outward (relative to safeRadius)
                    const spikeFactor = 0.32; // max extra 32% of safeRadius

                    const dynamicRadius =
                        ringRadius + safeRadius * spikeFactor * adjusted;
                    const angle = (i / numPoints) * Math.PI * 2;
                    const x = centerX + Math.cos(angle) * dynamicRadius;
                    const y = centerY + Math.sin(angle) * dynamicRadius;

                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                ctx.closePath();

                // ======== NEON GRADIENT PER RING =========
                let gradient: CanvasGradient;
                const gradInnerR = ringRadius * 0.75;
                const gradOuterR = ringRadius * 1.3;

                gradient = ctx.createRadialGradient(
                    centerX,
                    centerY,
                    gradInnerR,
                    centerX,
                    centerY,
                    gradOuterR
                );

                if (ring === 0) {
                    // inner: purple → magenta
                    gradient.addColorStop(
                        0,
                        `rgba(168, 85, 247, ${opacity * 1.0})` // neon purple
                    );
                    gradient.addColorStop(
                        0.6,
                        `rgba(244, 114, 182, ${opacity * 0.9})` // pink
                    );
                    gradient.addColorStop(
                        1,
                        `rgba(56, 189, 248, ${opacity * 0.55})` // cyan edge
                    );
                } else if (ring === 1) {
                    // middle: cyan → blue → purple
                    gradient.addColorStop(
                        0,
                        `rgba(56, 189, 248, ${opacity * 0.9})`
                    );
                    gradient.addColorStop(
                        0.5,
                        `rgba(59, 130, 246, ${opacity * 1.0})`
                    );
                    gradient.addColorStop(
                        1,
                        `rgba(129, 140, 248, ${opacity * 0.8})`
                    );
                } else {
                    // outer: electric blue → violet haze
                    gradient.addColorStop(
                        0,
                        `rgba(96, 165, 250, ${opacity * 0.9})`
                    );
                    gradient.addColorStop(
                        0.5,
                        `rgba(129, 140, 248, ${opacity * 0.85})`
                    );
                    gradient.addColorStop(
                        1,
                        `rgba(55, 48, 163, ${opacity * 0.55})`
                    );
                }

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2.5 + (numRings - ring) * 0.8;
                ctx.lineJoin = "round";
                ctx.lineCap = "round";
                ctx.shadowBlur = 22;
                ctx.shadowColor = "rgba(167, 139, 250, 0.9)";
                ctx.stroke();
            }

            // reset shadow so it doesn't leak into next frame
            ctx.shadowBlur = 0;
        };

        const renderFrame = () => {
            if (analyser && isPlaying) {
                analyser.getByteFrequencyData(dataArray);
                draw();
                frameRef.current = requestAnimationFrame(renderFrame);
            } else {
                // idle state: faint, slow breathing ring
                for (let i = 0; i < bufferLength; i++) {
                    dataArray[i] = 20; // tiny baseline
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
