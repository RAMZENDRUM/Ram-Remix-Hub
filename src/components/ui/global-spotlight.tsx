"use client";

import React, { useEffect, useRef } from 'react';

export function GlobalSpotlight() {
    const spotlightRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateSpotlight = (e: PointerEvent) => {
            if (spotlightRef.current) {
                const x = e.clientX;
                const y = e.clientY;
                spotlightRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(139, 92, 246, 0.15), transparent 40%)`;
            }
        };

        window.addEventListener('pointermove', updateSpotlight);
        return () => window.removeEventListener('pointermove', updateSpotlight);
    }, []);

    return (
        <div
            ref={spotlightRef}
            className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
            style={{
                background: 'radial-gradient(600px circle at 50% 50%, rgba(139, 92, 246, 0.15), transparent 40%)',
            }}
        />
    );
}
