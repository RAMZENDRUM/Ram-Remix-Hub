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
                    <h1 className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400 mb-4 tracking-tighter leading-none drop-shadow-2xl">
                        About the Creator
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto font-light tracking-wide">
                        Crafting the future of sound with AI and human creativity.
                    </p>
                </div>
            </section>

            {/* Profile Section */}
            <section className="container mx-auto px-4 -mt-24 relative z-20">
                <div className="max-w-5xl mx-auto bg-neutral-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-purple-900/20">
                    <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">

                        {/* Avatar / Logo */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full bg-black p-1 ring-1 ring-white/10 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] animate-[spin_4s_linear_infinite] opacity-20" />
                                <div className="absolute inset-1 rounded-full bg-neutral-950 flex items-center justify-center">
                                    <span className="text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-purple-500 tracking-tighter">R</span>
                                </div>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left space-y-8">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">Ram</h2>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    {["AI-Enhanced Production", "Remix Architect", "Cinematic Soundscapes"].map((tag) => (
                                        <span key={tag} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs md:text-sm font-medium text-purple-200 backdrop-blur-md">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-8 text-neutral-300 leading-relaxed text-lg font-light">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">The Architect of Future Sound</h3>
                                    <p className="text-neutral-400">
                                        I am Ram, a music producer dedicated to redefining the auditory experience. Standing at the intersection of traditional artistry and artificial intelligence, I don't just remix tracks—I reimagine them.
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-xl font-semibold text-purple-200 mb-2">Innovation Meets Emotion</h3>
                                        <p className="text-sm text-neutral-400">
                                            My process fuses the soul of classic production with the limitless potential of generative AI. This synergy allows me to craft immersive soundscapes that are both technically precise and deeply emotional.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-indigo-200 mb-2">Beyond Genres</h3>
                                        <p className="text-sm text-neutral-400">
                                            From high-octane EDM to introspective Lo-Fi, my work refuses to be boxed in. Every release is an exploration, a commitment to quality, and a step towards the future of music.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 pt-8 border-t border-white/5">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-center md:justify-start gap-3 text-neutral-400 group cursor-pointer hover:text-white transition-colors">
                                        <div className="p-2 rounded-full bg-white/5 group-hover:bg-purple-500/20 transition-colors">
                                            <Mail size={18} className="text-purple-400" />
                                        </div>
                                        <span className="text-sm">ramzendrum@gmail.com</span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-3 text-neutral-400">
                                        <div className="p-2 rounded-full bg-white/5">
                                            <MapPin size={18} className="text-purple-400" />
                                        </div>
                                        <span className="text-sm">Chennai, India</span>
                                    </div>
                                </div>

                                <div className="flex-1 flex justify-center md:justify-end items-center gap-4">
                                    <a
                                        href="https://www.instagram.com/ramzendrum?igsh=MXBkYXE4YnZmdHN0aA=="
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-4 rounded-full bg-white/5 text-neutral-400 hover:bg-purple-600 hover:text-white transition-all hover:scale-110 border border-white/5 hover:border-purple-500/50"
                                    >
                                        <Instagram size={22} />
                                    </a>
                                    <a
                                        href="https://open.spotify.com/artist/3imsDaYqTYfQZ8ZhSjMD4T?si=PcXvQrghS5O7Y65u5eIc6A"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-4 rounded-full bg-white/5 text-neutral-400 hover:bg-[#1DB954] hover:text-white transition-all hover:scale-110 border border-white/5 hover:border-[#1DB954]/50"
                                    >
                                        <Spotify className="w-6 h-6" />
                                    </a>
                                </div>
                            </div>

                            <div className="pt-6">
                                <a
                                    href="mailto:ramzendrum@gmail.com"
                                    className="inline-block w-full md:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold tracking-wide shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:scale-105 transition-all text-center text-sm uppercase"
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
