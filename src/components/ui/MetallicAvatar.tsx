"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MetallicAvatarProps {
    name?: string | null;
    image?: string | null;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-base",
    lg: "w-14 h-14 text-lg",
    xl: "w-32 h-32 text-4xl",
};

export function MetallicAvatar({ name, image, size = "md", className }: MetallicAvatarProps) {
    const initial = (name || "?").trim().charAt(0).toUpperCase();
    const sizeClass = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={cn("relative shrink-0 select-none", sizeClass, className)}>
            {image ? (
                <img
                    src={image}
                    alt={name || "User"}
                    className="w-full h-full rounded-full object-cover border border-white/10"
                />
            ) : (
                <div
                    className={cn(
                        "flex w-full h-full items-center justify-center rounded-full",
                        // BLACK METALLIC / 3D LOOK - Forced with !important to ensure override
                        "bg-gradient-to-br from-[#050608] via-[#15171d] to-[#21242c] !important",
                        "shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_20px_rgba(124,58,237,0.5),0_10px_25px_rgba(0,0,0,0.9)] !important",
                        "border border-white/10 !important",
                        "text-white font-semibold !important"
                    )}
                >
                    <span className="drop-shadow-md">{initial}</span>
                </div>
            )}
        </div>
    );
}
