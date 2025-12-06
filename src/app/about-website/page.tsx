import React from 'react';
import { Music, Zap, Globe, Shield, Activity, Headphones } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export default function AboutWebsitePage() {
    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Hero Section */}
            <section className="relative h-[55vh] flex items-center justify-center overflow-hidden pt-10">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-black/50 to-black z-0" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 z-[-1]" />

                <div className="relative z-10 text-center px-4 flex flex-col items-center">
                    <div className="scale-150 mb-8">
                        <BrandLogo variant="hero" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400 mb-4 tracking-tighter leading-none drop-shadow-2xl">
                        The Future of Remixes
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto font-light tracking-wide">
                        Where innovation meets the beat. Experience music like never before.
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 -mt-12 relative z-20">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
                    {/* Feature 1 */}
                    <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-white/5 transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Music className="text-purple-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Exclusive Remix Library</h3>
                        <p className="text-neutral-400 leading-relaxed">
                            Dive into a vast, handpicked collection of high-quality remixes across various genres, carefully curated to ensure a premium listening experience found nowhere else.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-white/5 transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Headphones className="text-indigo-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Premium Listening</h3>
                        <p className="text-neutral-400 leading-relaxed">
                            Lossless audio quality and an immersive visualizer experience that reacts to every beat, ensuring you feel the music, not just hear it.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-white/5 transition-all duration-300 group">
                        <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Globe className="text-pink-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Global Community</h3>
                        <p className="text-neutral-400 leading-relaxed">
                            Connect with fellow audiophiles, share your favorite tracks, and discover hidden gems from a curated library of exclusive remixes.
                        </p>
                    </div>
                </div>

                {/* Mission Statement */}
                <div className="max-w-4xl mx-auto mt-20 text-center space-y-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Redefining the Remix Culture</h2>
                    <p className="text-lg text-neutral-300 leading-relaxed font-light">
                        Ram Remix Hub isn't just a music library; it's a testament to the power of technology in art. We believe that the future of music lies in the collaboration between human emotion and machine precision. Every track on this platform is a result of this philosophy—crafted with passion, enhanced by intelligence.
                    </p>
                </div>
            </section>
        </div>
    );
}
