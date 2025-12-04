"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

const languages = [
    { code: 'en', name: 'English (UK)', label: 'EN' },
    { code: 'ta', name: 'தமிழ் (Tamil)', label: 'TA' },
    { code: 'de', name: 'Deutsch (German)', label: 'DE' },
    { code: 'ja', name: '日本語 (Japanese)', label: 'JA' },
    { code: 'fr', name: 'Français (French)', label: 'FR' },
] as const;

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLang = languages.find(l => l.code === language) || languages[0];

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button - Icon Only, Compact */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 border",
                    isOpen
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/30 hover:text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                )}
                aria-label="Change Language"
            >
                <Globe
                    size={20}
                    className={cn(
                        "transition-transform duration-700 ease-in-out",
                        isOpen ? "rotate-180 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "group-hover:rotate-180 group-hover:text-purple-300"
                    )}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[#050505]/90 backdrop-blur-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] p-1.5 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 origin-top-right ring-1 ring-white/5">
                    {/* Decorative Neon Line */}
                    <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                    <div className="flex flex-col gap-0.5 relative">
                        {languages.map((lang) => {
                            const isActive = language === lang.code;
                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLanguage(lang.code);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "relative flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-left transition-all duration-200 group/item overflow-hidden",
                                        isActive
                                            ? "bg-purple-500/10 border border-purple-500/30 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                                            : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                                    )}
                                >
                                    {/* Hover Glow Effect */}
                                    {!isActive && (
                                        <div className="absolute inset-0 opacity-0 group-hover/item:opacity-100 bg-gradient-to-r from-purple-500/10 to-transparent transition-opacity duration-300" />
                                    )}

                                    <div className="flex items-center gap-3 relative z-10">
                                        <span className={cn(
                                            "text-sm font-medium tracking-wide",
                                            isActive ? "text-purple-100" : "group-hover/item:text-white"
                                        )}>
                                            {lang.name}
                                        </span>
                                    </div>

                                    {isActive && (
                                        <Check size={14} className="text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
