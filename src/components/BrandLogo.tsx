import React from "react";
import Link from "next/link";

type BrandLogoProps = {
    variant?: "nav" | "footer" | "hero" | "auth";
};

export function BrandLogo({ variant = "nav" }: BrandLogoProps) {
    const sizeClasses =
        variant === "hero" || variant === "auth"
            ? "h-9 w-9 md:h-11 md:w-11"
            : "h-7 w-7";

    const textClasses =
        variant === "hero" || variant === "auth"
            ? "text-2xl md:text-3xl"
            : "text-lg";

    return (
        <Link href="/" className="inline-flex items-center gap-2 md:gap-3 group">
            {/* Wave / bars icon wrapper */}
            <div
                className={`
          ${sizeClasses}
          rounded-full
          bg-white/10 border border-white/20 backdrop-blur-md
          flex items-center justify-center
          shadow-[0_0_20px_rgba(168,85,247,0.5)]
          group-hover:bg-white/20 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.8)]
          transition-all duration-300
        `}
            >
                {/* Wave icon bars */}
                <div className="flex items-end gap-[2px]">
                    <span className="w-[2px] h-[6px] md:h-[8px] bg-white rounded-full animate-[music-bar_1s_ease-in-out_infinite] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
                    <span className="w-[2px] h-[10px] md:h-[12px] bg-white rounded-full animate-[music-bar_1.2s_ease-in-out_infinite_0.1s] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
                    <span className="w-[2px] h-[7px] md:h-[9px] bg-white rounded-full animate-[music-bar_0.8s_ease-in-out_infinite_0.2s] drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
                </div>
            </div>

            {/* Brand text */}
            <span
                className={`${textClasses} font-semibold tracking-tight text-white/90 group-hover:text-white transition-colors duration-300`}
            >
                Ram Remix Hub
            </span>
        </Link>
    );
}
