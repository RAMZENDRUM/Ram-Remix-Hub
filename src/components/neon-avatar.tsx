// components/neon-avatar.tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import clsx from "clsx";

type NeonAvatarProps = {
    name?: string | null;
    imageUrl?: string | null;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
};

const sizeWrapper: Record<NonNullable<NeonAvatarProps["size"]>, string> = {
    sm: "w-9 h-9",
    md: "w-11 h-11",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
};

const textSizeWrapper: Record<NonNullable<NeonAvatarProps["size"]>, string> = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-2xl",
    xl: "text-4xl",
};

export function NeonAvatar({
    name,
    imageUrl,
    size = "lg",
    className,
}: NeonAvatarProps) {
    const initial = (name || "?").trim().charAt(0).toUpperCase();

    return (
        <div
            className={clsx(
                "relative inline-flex items-center justify-center",
                sizeWrapper[size],
                className
            )}
        >
            {/* NEON GLOW RING */}
            <div
                className={clsx(
                    "absolute inset-0 rounded-full",
                    "bg-[conic-gradient(from_180deg_at_50%_50%,#7b3fff,#ff1cf7,#00f0ff,#7b3fff)]",
                    "opacity-80 blur-[6px]"
                )}
            />

            {/* DARK INNER DISC (metal look) */}
            <div
                className={clsx(
                    "absolute inset-[3px] rounded-full",
                    "bg-gradient-to-br from-[#050608] via-[#15171d] to-[#262933]",
                    "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_30px_rgba(0,0,0,0.9)]"
                )}
            />

            {/* ACTUAL AVATAR CONTENT (image or initial) */}
            <Avatar
                className={clsx(
                    "relative w-[calc(100%-6px)] h-[calc(100%-6px)] rounded-full",
                    "border border-white/15 bg-transparent overflow-hidden"
                )}
            >
                {imageUrl ? (
                    <AvatarImage src={imageUrl} alt={name || "Profile picture"} />
                ) : null}
                <AvatarFallback
                    className={clsx(
                        "w-full h-full flex items-center justify-center rounded-full",
                        "text-white font-semibold",
                        textSizeWrapper[size],
                        "bg-transparent"
                    )}
                >
                    {initial}
                </AvatarFallback>
            </Avatar>
        </div>
    );
}
