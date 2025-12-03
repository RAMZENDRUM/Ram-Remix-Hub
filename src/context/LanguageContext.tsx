"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ta' | 'de' | 'ja' | 'fr';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
    en: {
        "nav.home": "Home",
        "nav.releases": "Releases",
        "nav.playlists": "Playlists",
        "nav.about": "About",
        "nav.admin": "Admin",
        "nav.search": "Search",
        "lang.en": "English (UK)",
        "lang.ta": "தமிழ் (Tamil)",
        "lang.de": "Deutsch (German)",
        "lang.ja": "日本語 (Japanese)",
        "lang.fr": "Français (French)",
        "settings.language": "Language & Region",
        "settings.language.desc": "Choose your app language. Changes apply instantly for this account.",
        "settings.default": "Default: English (UK)",
    },
    ta: {
        "nav.home": "முகப்பு",
        "nav.releases": "வெளியீடுகள்",
        "nav.playlists": "பிளேலிஸ்ட்கள்",
        "nav.about": "பற்றி",
        "nav.admin": "நிர்வாகம்",
        "nav.search": "தேடு",
        "lang.en": "English (UK)",
        "lang.ta": "தமிழ் (Tamil)",
        "lang.de": "Deutsch (German)",
        "lang.ja": "日本語 (Japanese)",
        "lang.fr": "Français (French)",
        "settings.language": "மொழி & பிராந்தியம்",
        "settings.language.desc": "உங்கள் செயலி மொழியைத் தேர்ந்தெடுக்கவும். மாற்றங்கள் உடனடியாகப் பயன்படுத்தப்படும்.",
        "settings.default": "இயல்புநிலை: English (UK)",
    },
    de: {
        "nav.home": "Startseite",
        "nav.releases": "Veröffentlichungen",
        "nav.playlists": "Wiedergabelisten",
        "nav.about": "Über",
        "nav.admin": "Admin",
        "nav.search": "Suche",
        "lang.en": "English (UK)",
        "lang.ta": "தமிழ் (Tamil)",
        "lang.de": "Deutsch (German)",
        "lang.ja": "日本語 (Japanese)",
        "lang.fr": "Français (French)",
        "settings.language": "Sprache & Region",
        "settings.language.desc": "Wählen Sie Ihre App-Sprache. Änderungen werden sofort angewendet.",
        "settings.default": "Standard: English (UK)",
    },
    ja: {
        "nav.home": "ホーム",
        "nav.releases": "リリース",
        "nav.playlists": "プレイリスト",
        "nav.about": "概要",
        "nav.admin": "管理",
        "nav.search": "検索",
        "lang.en": "English (UK)",
        "lang.ta": "தமிழ் (Tamil)",
        "lang.de": "Deutsch (German)",
        "lang.ja": "日本語 (Japanese)",
        "lang.fr": "Français (French)",
        "settings.language": "言語と地域",
        "settings.language.desc": "アプリの言語を選択してください。変更はすぐに適用されます。",
        "settings.default": "デフォルト: English (UK)",
    },
    fr: {
        "nav.home": "Accueil",
        "nav.releases": "Sorties",
        "nav.playlists": "Playlists",
        "nav.about": "À propos",
        "nav.admin": "Admin",
        "nav.search": "Rechercher",
        "lang.en": "English (UK)",
        "lang.ta": "தமிழ் (Tamil)",
        "lang.de": "Deutsch (German)",
        "lang.ja": "日本語 (Japanese)",
        "lang.fr": "Français (French)",
        "settings.language": "Langue et région",
        "settings.language.desc": "Choisissez la langue de l'application. Les changements s'appliquent instantanément.",
        "settings.default": "Défaut: English (UK)",
    }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('app-language') as Language;
        if (savedLang && translations[savedLang]) {
            setLanguage(savedLang);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('app-language', lang);
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
