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
          bg-gradient-to-b from-[#C69AFF] to-[#6F5BFF]
          flex items-center justify-center
          shadow-[0_0_18px_rgba(140,92,255,0.7)]
          group-hover:scale-110 transition-transform duration-300
        `}
            >
                {/* Wave icon bars */}
                <div className="flex items-end gap-[2px]">
                    <span className="w-[2px] h-[6px] md:h-[8px] bg-white/80 rounded-full animate-[music-bar_1s_ease-in-out_infinite]" />
                    <span className="w-[2px] h-[10px] md:h-[12px] bg-white rounded-full animate-[music-bar_1.2s_ease-in-out_infinite_0.1s]" />
                    <span className="w-[2px] h-[7px] md:h-[9px] bg-white/80 rounded-full animate-[music-bar_0.8s_ease-in-out_infinite_0.2s]" />
                </div>
            </div>

            {/* Brand text */}
            <span
                className={`${textClasses} font-semibold tracking-tight bg-gradient-to-r from-white to-[#C69AFF] bg-clip-text text-transparent group-hover:to-white transition-all duration-300`}
            >
                Ram Remix Hub
            </span>
        </Link>
    );
}
