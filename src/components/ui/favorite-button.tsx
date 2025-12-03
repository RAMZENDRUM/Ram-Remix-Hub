"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    trackId: string;
    initialIsFavorite: boolean;
}

export function FavoriteButton({ trackId, initialIsFavorite }: Props) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isPending, startTransition] = useTransition();

    const handleToggleFavorite = () => {
        startTransition(async () => {
            try {
                const res = await fetch("/api/favorites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ trackId }),
                });

                if (!res.ok) return;

                const data = await res.json();
                setIsFavorite(data.isFavorite);
            } catch (err) {
                console.error("Failed to toggle favorite", err);
            }
        });
    };

    return (
        <button
            onClick={handleToggleFavorite}
            disabled={isPending}
            className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition",
                isFavorite
                    ? "bg-pink-500/20 text-pink-400"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
            )}
            aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
        >
            <Heart
                className={cn("h-4 w-4", isFavorite && "fill-current")}
            />
        </button>
    );
}
