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
    size = 260,
}) => {
    const { analyser, isPlaying } = usePlayer();

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        // Make canvas slightly larger to fit the perspective grid
        const width = size * dpr;
        const height = size * dpr;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.scale(dpr, dpr);

        // Audio Data
        const bufferLength = analyser ? analyser.frequencyBinCount : 2048;
        const dataArray = new Uint8Array(bufferLength);

        // Grid Config
        const COLS = 20;
        const ROWS = 20;
        const GRID_SIZE = size * 1.5; // Larger than canvas to cover edges
        const CELL_SIZE = GRID_SIZE / COLS;

        // Animation State
        let offsetZ = 0;
        let time = 0;

        // Simple pseudo-noise function for "flowing" effect
        const noise = (x: number, z: number, t: number) => {
            return Math.sin(x * 0.1 + t) * Math.cos(z * 0.1 + t) * 10;
        };

        const renderFrame = () => {
            // 1. Get Audio
            let audioLevel = 0;
            if (analyser && isPlaying) {
                analyser.getByteFrequencyData(dataArray);
                // Calculate average bass/mid energy
                let sum = 0;
                const range = 50; // Check first 50 bins (bass/low-mids)
                for (let i = 0; i < range; i++) sum += dataArray[i];
                audioLevel = sum / range / 255; // 0-1
            } else if (isPlaying) {
                // Sim
                audioLevel = 0.3 + Math.sin(time * 2) * 0.1;
            }

            // Update State
            time += 0.05;
            offsetZ -= 1.5; // Move grid towards camera
            if (offsetZ < -CELL_SIZE) offsetZ += CELL_SIZE; // Loop

            // Clear
            ctx.clearRect(0, 0, size, size);

            // Background (Dark Void)
            ctx.fillStyle = "rgba(0,0,0,0)"; // Transparent
            ctx.fillRect(0, 0, size, size);

            // Setup 3D Projection
            const fov = 250;
            const viewX = size / 2;
            const viewY = size / 3; // Look slightly down

            // Dynamic Color
            const r = Math.floor(50 + audioLevel * 100);
            const g = Math.floor(50);
            const b = Math.floor(200 + audioLevel * 55);
            const color = `rgb(${r},${g},${b})`;

            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 10 + audioLevel * 20;
            ctx.shadowColor = color;

            // Draw Grid
            ctx.beginPath();

            // We draw lines by iterating grid points
            // To center the grid, we offset X and Z
            const startX = -GRID_SIZE / 2;
            const startZ = 0; // Start slightly in front

            // Function to project 3D point to 2D
            const project = (x: number, y: number, z: number) => {
                const scale = fov / (fov + z);
                const x2d = viewX + x * scale;
                const y2d = viewY + y * scale;
                return { x: x2d, y: y2d };
            };

            // Horizontal Lines (along X)
            for (let z = 0; z < ROWS; z++) {
                const zPos = startZ + z * CELL_SIZE + offsetZ;
                // Don't draw if too close or behind camera
                if (zPos < -50) continue;

                let first = true;
                for (let x = 0; x <= COLS; x++) {
                    const xPos = startX + x * CELL_SIZE;

                    // Height displacement
                    // Base wave + Audio kick
                    const dist = Math.sqrt(xPos * xPos + zPos * zPos);
                    const wave = noise(x, z, time);
                    const audioKick = audioLevel * 80 * Math.exp(-dist * 0.005); // Higher in center

                    const yPos = 100 + wave + audioKick; // 100 is base floor level (below viewY)

                    const p = project(xPos, yPos, zPos);

                    if (first) {
                        ctx.moveTo(p.x, p.y);
                        first = false;
                    } else {
                        ctx.lineTo(p.x, p.y);
                    }
                }
            }

            // Vertical Lines (along Z)
            for (let x = 0; x <= COLS; x++) {
                const xPos = startX + x * CELL_SIZE;

                let first = true;
                for (let z = 0; z < ROWS; z++) {
                    const zPos = startZ + z * CELL_SIZE + offsetZ;
                    if (zPos < -50) continue;

                    const dist = Math.sqrt(xPos * xPos + zPos * zPos);
                    const wave = noise(x, z, time);
                    const audioKick = audioLevel * 80 * Math.exp(-dist * 0.005);

                    const yPos = 100 + wave + audioKick;

                    const p = project(xPos, yPos, zPos);

                    if (first) {
                        ctx.moveTo(p.x, p.y);
                        first = false;
                    } else {
                        ctx.lineTo(p.x, p.y);
                    }
                }
            }
            ctx.stroke();

            // Optional: Draw Cover Art floating above?
            // The user wanted the "WaelYasmina" visualizer which is usually just the mesh.
            // But we have coverUrl. Let's render it floating in the middle if provided.
            if (coverUrl) {
                // ... logic to draw image if needed, but maybe clean wireframe is better.
                // Let's skip image for now to match the "wireframe" aesthetic strictly.
            }

            frameRef.current = requestAnimationFrame(renderFrame);
        };

        renderFrame();

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [analyser, isPlaying, size]);

    return (
        <div className="relative flex items-center justify-center bg-transparent overflow-hidden rounded-xl">
            <canvas
                ref={canvasRef}
                style={{
                    width: size,
                    height: size,
                    display: "block",
                    background: "radial-gradient(circle at center, rgba(20,20,30,0) 0%, rgba(0,0,0,0) 100%)",
                }}
            />
        </div>
    );
};

export default EliteVisualizer;
