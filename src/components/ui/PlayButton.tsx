"use client";

import React from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

type PlayButtonProps = {
    isPlaying: boolean;
    onClick: () => void;
    variant?: "circle" | "pill";
    label?: string;
    className?: string;
};

export function PlayButton({ isPlaying, onClick, variant = "pill", label, className }: PlayButtonProps) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={cn(
                "inline-flex items-center justify-center gap-2 border border-purple-500/50 bg-black hover:bg-black/80 backdrop-blur-lg transition-all duration-200 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] active:scale-95",
                variant === "pill" ? "rounded-full px-6 py-2.5 text-sm font-medium" : "rounded-full w-12 h-12 md:w-14 md:h-14",
                className
            )}
        >
            <div className={cn(
                "flex items-center justify-center",
                variant === "pill" ? "w-5 h-5" : "w-6 h-6"
            )}>
                {isPlaying ? (
                    <Pause className="fill-white w-full h-full" />
                ) : (
                    <Play className="fill-white w-full h-full ml-0.5" />
                )}
            </div>
            {variant === "pill" && label && (
                <span>{label}</span>
            )}
        </button>
    );
}
