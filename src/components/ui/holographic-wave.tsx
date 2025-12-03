"use client";

import React, { useEffect, useRef } from 'react';

export default function HolographicWave() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        const particles: { x: number; y: number; speed: number; offset: number; color: string }[] = [];
        const particleCount = 100;

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: height / 2,
                speed: 0.02 + Math.random() * 0.03,
                offset: Math.random() * Math.PI * 2,
                color: Math.random() > 0.5 ? '#C69AFF' : '#5eead4' // Purple or Teal
            });
        }

        const render = (time: number) => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Trail effect
            ctx.fillRect(0, 0, width, height);

            // Draw connecting lines
            ctx.lineWidth = 0.5;

            particles.forEach((p, i) => {
                // Update position
                p.offset += p.speed;
                const waveY = Math.sin(p.offset + time * 0.001) * 100; // Wave amplitude
                const noiseY = Math.cos(p.offset * 2 + time * 0.002) * 30; // Add complexity

                p.y = height / 2 + waveY + noiseY;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                // Glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;

                // Connect to nearby particles
                particles.forEach((p2, j) => {
                    if (i === j) return;
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(198, 154, 255, ${0.1 - dist / 1000})`;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                });
            });

            animationFrameId = requestAnimationFrame(render);
        };

        const handleResize = () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        };

        window.addEventListener('resize', handleResize);
        render(0);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="w-full h-full relative overflow-hidden rounded-3xl border border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
}
