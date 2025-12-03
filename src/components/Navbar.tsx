'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Globe, User, ShieldCheck, Home, Disc, ListMusic } from 'lucide-react';
import { useSession } from 'next-auth/react';
import SearchOverlay from './SearchOverlay';
import { LanguageSwitcher } from "./ui/language-switcher";
import { useLanguage } from "@/context/LanguageContext";
import { BrandLogo } from "@/components/BrandLogo";

const Navbar = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user;
    const { t } = useLanguage();

    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Simple admin check based on email
    const isAdmin = user?.email === 'ramzendrum@gmail.com';

    const navLinks = [
        { name: t("nav.home"), href: "/", icon: Home },
        { name: t("nav.releases"), href: "/releases", icon: Disc },
        { name: t("nav.playlists"), href: "/playlists", icon: ListMusic },
        { name: t("nav.about"), href: "/about", icon: User },
    ];

    if (isAdmin) {
        navLinks.push({ name: t("nav.admin"), href: "/admin", icon: ShieldCheck });
    }

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <BrandLogo variant="nav" />

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`text-sm font-medium transition-colors hover:text-purple-400 ${isActive ? "text-purple-500" : "text-neutral-400"
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-4">
                            <button
                                className="p-2 text-neutral-400 hover:text-white transition-colors"
                                onClick={() => setIsSearchOpen(true)}
                            >
                                <Search size={20} />
                            </button>

                            <LanguageSwitcher />

                            {user ? (
                                <Link href="/profile" className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center overflow-hidden">
                                        {user.image ? (
                                            <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={16} className="text-neutral-400" />
                                        )}
                                    </div>
                                </Link>
                            ) : (
                                <Link href="/auth" className="p-2 text-neutral-400 hover:text-white transition-colors">
                                    <User size={20} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

export default Navbar;
