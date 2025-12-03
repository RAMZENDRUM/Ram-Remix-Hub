"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Application, SPEObject } from "@splinetool/runtime";

// Dynamically import Spline to avoid SSR
const Spline = dynamic(() => import("@splinetool/react-spline"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-black/50 animate-pulse" />,
});

export default function RobotSection() {
    const splineRef = useRef<Application | null>(null);
    const robotRef = useRef<SPEObject | null>(null);
    const requestRef = useRef<number | null>(null);
    const [shouldRender, setShouldRender] = useState(false);

    // Only render on desktop to save resources
    useEffect(() => {
        const checkScreen = () => {
            setShouldRender(window.innerWidth >= 1024);
        };
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    function onLoad(spline: Application) {
        splineRef.current = spline;
        const robot = spline.findObjectByName('Robot') || spline.findObjectByName('Group');
        if (robot) {
            robotRef.current = robot;
        }
    }

    useEffect(() => {
        if (!shouldRender) return;

        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        let isIdle = false;

        const handleMouseMove = (e: MouseEvent) => {
            targetX = (e.clientX / window.innerWidth) * 2 - 1;
            targetY = (e.clientY / window.innerHeight) * 2 - 1;
            isIdle = false;
        };

        const updateRobot = () => {
            if (robotRef.current) {
                const ease = 0.1;
                const diffX = targetX - currentX;
                const diffY = targetY - currentY;

                if (Math.abs(diffX) < 0.001 && Math.abs(diffY) < 0.001) {
                    if (!isIdle) {
                        isIdle = true;
                    }
                } else {
                    currentX += diffX * ease;
                    currentY += diffY * ease;

                    robotRef.current.rotation.y = currentX * 0.5;
                    robotRef.current.rotation.x = -currentY * 0.3;
                }
            }
            requestRef.current = requestAnimationFrame(updateRobot);
        };

        window.addEventListener("mousemove", handleMouseMove);
        requestRef.current = requestAnimationFrame(updateRobot);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [shouldRender]);

    if (!shouldRender) return null;

    return (
        <div className="relative w-full h-full overflow-hidden">
            <Spline
                className="w-full h-full"
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                onLoad={onLoad}
            />
        </div>
    );
}
