"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface CustomDropdownProps {
    label: string;
    name: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
}

export function CustomDropdown({
    label,
    name,
    options,
    value,
    onChange,
    placeholder = "Select option",
    required = false,
}: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close on Escape key
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="relative flex flex-col gap-1" ref={dropdownRef}>
            <span className="text-xs font-medium text-neutral-300">{label}</span>

            {/* Hidden input for form submission compatibility */}
            <input type="hidden" name={name} value={value} required={required} />

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-3 w-full rounded-xl border bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 transition-all outline-none
          ${isOpen
                        ? "border-purple-400 ring-1 ring-purple-500/60"
                        : "border-neutral-700 hover:border-neutral-500"
                    }`}
            >
                <span className={`truncate ${!value ? "text-neutral-500" : ""}`}>
                    {value || placeholder}
                </span>
                <ChevronDown
                    className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-2xl border border-neutral-700/70 bg-neutral-900/95 backdrop-blur-md shadow-xl shadow-black/50 py-1 max-h-56 overflow-y-auto animate-fadeIn">
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => handleSelect(option)}
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors
                ${value === option
                                    ? "bg-purple-600/20 text-purple-200"
                                    : "text-neutral-200 hover:bg-purple-600/40 hover:text-white"
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
