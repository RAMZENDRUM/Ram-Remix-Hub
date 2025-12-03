"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

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
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-full bg-black/30 border border-white/10 px-3 py-1.5 text-sm font-medium text-white/90 hover:bg-black/50 hover:shadow-[0_0_15px_rgba(198,154,255,0.3)] hover:border-purple-500/30 transition-all active:scale-95"
            >
                <Globe size={16} className="text-purple-400" />
                <span className="hidden md:inline">{currentLang.label}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-[0_0_30px_rgba(140,92,255,0.3)] p-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="flex flex-col gap-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-left transition-all ${language === lang.code
                                        ? 'bg-gradient-to-r from-[#C69AFF] to-[#6F5BFF] text-white font-semibold shadow-lg'
                                        : 'text-white/80 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-sm">{lang.name}</span>
                                    <span className={`text-xs ${language === lang.code ? 'text-white/80' : 'text-white/50'}`}>
                                        {lang.label}
                                    </span>
                                </div>
                                {language === lang.code && <Check size={16} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
