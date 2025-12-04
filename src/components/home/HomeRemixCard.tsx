import React from 'react';
import Link from 'next/link';

export type Remix = {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
};

export function HomeRemixCard({ remix }: { remix: Remix }) {
    return (
        <Link
            href={`/remix/${remix.id}`}
            className="
        group relative w-44 flex-shrink-0
        rounded-2xl border border-white/10
        bg-white/[0.03] backdrop-blur-lg
        shadow-[0_18px_40px_rgba(0,0,0,0.85)]
        overflow-hidden
        transition-all duration-300 ease-out
        hover:-translate-y-2 hover:shadow-[0_26px_60px_rgba(0,0,0,0.95)]
        block
      "
        >
            {/* cover */}
            <div className="relative h-40 w-full overflow-hidden">
                <img
                    src={remix.coverUrl}
                    alt={remix.title}
                    className="
            h-full w-full object-cover
            transition-transform duration-500 ease-out
            group-hover:scale-110
          "
                />
                {/* gradient overlay at bottom */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            </div>

            {/* text */}
            <div className="flex flex-col gap-1 px-3 pt-2 pb-3 text-left">
                <p className="line-clamp-1 text-sm font-semibold text-white">
                    {remix.title}
                </p>
                <p className="text-xs text-white/50">{remix.artist}</p>
            </div>


        </Link>
    );
}
