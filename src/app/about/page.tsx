import React from 'react';
import { Mail, MapPin, Music, Cpu, Instagram } from 'lucide-react';

// Manually adding Spotify icon
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

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Hero Section */}
            <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black/50 to-black z-0" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 z-[-1]" />

                <div className="relative z-10 text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400 mb-4 tracking-tight">
                        About the Creator
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
                        Crafting the future of sound with AI and human creativity.
                    </p>
                </div>
            </section>

            {/* Profile Section */}
            <section className="container mx-auto px-4 -mt-20 relative z-20">
                <div className="max-w-4xl mx-auto bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 md:p-12 shadow-2xl shadow-purple-900/20">
                    <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">

                        {/* Avatar / Image Placeholder */}
                        <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-1 shadow-2xl shadow-purple-500/30 flex-shrink-0">
                            <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center overflow-hidden relative">
                                {/* Replace with actual image if available */}
                                <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-indigo-400">R</span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left space-y-6">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">Ram</h2>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
                                    <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center gap-2">
                                        <Music size={14} /> Remix Creator
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-6 text-neutral-300 leading-relaxed">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">The Architect of Future Sound</h3>
                                    <p>
                                        I am Ram, a music producer dedicated to redefining the auditory experience. Standing at the intersection of traditional artistry and artificial intelligence, I don't just remix tracks—I reimagine them.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-purple-200 mb-1">Innovation Meets Emotion</h3>
                                    <p>
                                        My process fuses the soul of classic production with the limitless potential of generative AI. This synergy allows me to craft immersive soundscapes that are both technically precise and deeply emotional.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-indigo-200 mb-1">Beyond Genres</h3>
                                    <p>
                                        From high-octane EDM to introspective Lo-Fi, my work refuses to be boxed in. Every release is an exploration, a commitment to quality, and a step towards the future of music.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 pt-4 border-t border-neutral-800">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-center md:justify-start gap-3 text-neutral-400">
                                        <Mail size={18} className="text-purple-500" />
                                        <span>ramzendrum@gmail.com</span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-3 text-neutral-400">
                                        <MapPin size={18} className="text-purple-500" />
                                        <span>Chennai, India</span>
                                    </div>
                                </div>

                                <div className="flex-1 flex justify-center md:justify-end items-center gap-4">
                                    <a
                                        href="https://www.instagram.com/ramzendrum?igsh=MXBkYXE4YnZmdHN0aA=="
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-3 rounded-full bg-neutral-800 text-neutral-400 hover:bg-purple-600 hover:text-white transition-all hover:scale-110"
                                    >
                                        <Instagram size={20} />
                                    </a>
                                    <a
                                        href="https://open.spotify.com/artist/3imsDaYqTYfQZ8ZhSjMD4T?si=PcXvQrghS5O7Y65u5eIc6A"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-3 rounded-full bg-neutral-800 text-neutral-400 hover:bg-green-600 hover:text-white transition-all hover:scale-110"
                                    >
                                        <Spotify className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>

                            <div className="pt-4">
                                <a
                                    href="mailto:ramzendrum@gmail.com"
                                    className="inline-block w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-105 transition-all text-center"
                                >
                                    Contact Me
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
