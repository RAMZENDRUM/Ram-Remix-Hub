"use client";

import Link from "next/link";
import { Instagram, User, Disc } from "lucide-react";
import { WavePath } from "@/components/ui/wave-path";

// Manually adding Spotify icon since it might not be in all lucide versions or just to be safe
const Spotify = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14.5c2.5-1 5.5-1 8 0" />
        <path d="M8 11.5c2.5-1 5.5-1 8 0" />
        <path d="M8 8.5c2.5-1 5.5-1 8 0" />
    </svg>
);

const currentYear = new Date().getFullYear();

export function SiteFooter() {
    return (
        <footer className="w-full bg-black py-12 md:py-16 mt-auto relative">
            <div className="absolute top-0 left-0 w-full flex justify-center -translate-y-1/2 pointer-events-none">
                <WavePath className="w-full max-w-6xl" />
            </div>
            <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
                {/* Brand & Content Container */}
                <div className="flex flex-col gap-8">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-end gap-0.5">
                            <span className="h-4 w-1 rounded-full bg-purple-500" />
                            <span className="h-6 w-1 rounded-full bg-purple-500" />
                            <span className="h-3 w-1 rounded-full bg-purple-500" />
                            <span className="h-8 w-1 rounded-full bg-purple-500" />
                            <span className="h-5 w-1 rounded-full bg-purple-500" />
                        </div>
                        <span className="text-xl font-bold tracking-wide text-white">
                            Ram Remix Hub
                        </span>
                    </div>

                    {/* Info Rows with Aligned Navigation */}
                    <div className="w-full space-y-4">
                        {/* Row 1: Email & About Me */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-900/50 pb-2">
                            <p className="flex items-center gap-2 text-sm text-neutral-400">
                                <span className="text-neutral-500 w-16">Email:</span>
                                <a
                                    href="mailto:ramzendrum@gmail.com"
                                    className="text-neutral-200 hover:text-purple-400 transition-colors"
                                >
                                    ramzendrum@gmail.com
                                </a>
                            </p>
                            <Link
                                href="/about"
                                className="text-sm font-medium text-neutral-400 hover:text-purple-400 transition-colors flex items-center gap-2 group"
                            >
                                <span>About Me</span>
                                <User className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </Link>
                        </div>

                        {/* Row 2: Location & Releases */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-900/50 pb-2">
                            <p className="flex items-center gap-2 text-sm text-neutral-400">
                                <span className="text-neutral-500 w-16">Location:</span>
                                <span className="text-neutral-200">Chennai, India</span>
                            </p>
                            <Link
                                href="/releases"
                                className="text-sm font-medium text-neutral-400 hover:text-purple-400 transition-colors flex items-center gap-2 group"
                            >
                                <span>Releases</span>
                                <Disc className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </Link>
                        </div>
                    </div>

                    {/* Social Icons */}
                    <div className="flex items-center gap-3 pt-2">
                        <a
                            href="https://www.instagram.com/ramzendrum?igsh=MXBkYXE4YnZmdHN0aA=="
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors border border-neutral-800 hover:border-neutral-700"
                        >
                            <Instagram className="h-5 w-5" />
                        </a>
                        <a
                            href="https://open.spotify.com/artist/3imsDaYqTYfQZ8ZhSjMD4T?si=PcXvQrghS5O7Y65u5eIc6A"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors border border-neutral-800 hover:border-neutral-700"
                        >
                            <Spotify className="h-5 w-5" />
                        </a>
                    </div>
                </div>

                <div className="mt-12 border-t border-neutral-800 pt-8 text-center text-xs text-neutral-500">
                    <p>&copy; {currentYear} Ram Remix Hub. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
