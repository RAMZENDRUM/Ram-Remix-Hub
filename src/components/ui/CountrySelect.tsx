"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { COUNTRIES } from "@/data/countries";
import { cn } from "@/lib/utils";

interface CountrySelectProps {
    value: string | null;
    onChange: (countryName: string) => void;
}

export function CountrySelect({ value, onChange }: CountrySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredCountries = COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white/5 rounded-2xl border border-white/10 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
            >
                <span className={cn("text-sm", value ? "text-white" : "text-white/40")}>
                    {value || "Select country"}
                </span>
                <ChevronDown size={16} className="text-white/50" />
            </div>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full max-h-60 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                    {/* Search */}
                    <div className="p-2 border-b border-white/5">
                        <div className="relative">
                            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                                type="text"
                                placeholder="Search country..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:bg-white/10 transition-colors"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1 p-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {filteredCountries.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-white/40">
                                No countries found
                            </div>
                        ) : (
                            filteredCountries.map((country) => (
                                <div
                                    key={country.code}
                                    onClick={() => {
                                        onChange(country.name);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    className={cn(
                                        "px-3 py-2 rounded-lg text-sm flex items-center justify-between cursor-pointer transition-colors",
                                        value === country.name
                                            ? "bg-gradient-to-r from-[#C69AFF]/20 to-[#6F5BFF]/20 text-white"
                                            : "text-white/70 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <span>{country.name}</span>
                                    {value === country.name && <Check size={12} className="text-[#C69AFF]" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
