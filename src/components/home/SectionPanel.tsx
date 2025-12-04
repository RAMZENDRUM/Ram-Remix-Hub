import React from 'react';
import Link from 'next/link';
import { HomeRemixCard, Remix } from './HomeRemixCard';

type SectionPanelProps = {
    title: string;
    subtitle?: string;
    href?: string;
    remixes: Remix[];
};

export function SectionPanel({ title, subtitle, href, remixes }: SectionPanelProps) {
    return (
        <section className="relative">
            {/* subtle underglow line */}
            <div className="pointer-events-none absolute -bottom-2 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent blur-[2px] opacity-60" />

            <div className="rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_24px_70px_rgba(0,0,0,0.8)] px-5 py-5 sm:px-7 sm:py-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-white">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-xs text-white/45 mt-1">{subtitle}</p>
                        )}
                    </div>

                    {href && (
                        <Link
                            href={href}
                            className="text-xs sm:text-sm text-white/60 hover:text-white inline-flex items-center gap-1 transition"
                        >
                            See all
                            <span className="text-[11px]">→</span>
                        </Link>
                    )}
                </div>

                <div className="flex gap-4 overflow-x-auto pt-4 pb-4 scrollbar-hide -mt-4">
                    {remixes.length === 0 ? (
                        <div className="text-sm text-white/40 py-6">
                            No remixes yet. Sign in as admin to upload your first track.
                        </div>
                    ) : (
                        remixes.map((remix) => (
                            <HomeRemixCard key={remix.id} remix={remix} />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
