"use client";

import React, { useEffect, useState } from "react";
import { Check, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "info" | "error";

export interface ToastProps {
    id: string;
    message: string;
    variant?: ToastVariant;
    onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, variant = "info", onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        const timer = requestAnimationFrame(() => setIsVisible(true));
        return () => cancelAnimationFrame(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for exit animation to finish before removing from DOM
        setTimeout(() => onClose(id), 300);
    };

    // Auto-dismiss
    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const getIcon = () => {
        switch (variant) {
            case "success":
                return <Check size={16} className="text-black" strokeWidth={3} />;
            case "error":
                return <AlertTriangle size={16} className="text-black" strokeWidth={3} />;
            default:
                return <Info size={16} className="text-black" strokeWidth={3} />;
        }
    };

    const getGlowColors = () => {
        switch (variant) {
            case "success":
                return "from-[#C8FFB0] to-[#6F5BFF]";
            case "error":
                return "from-[#FF6FA0] to-[#C69AFF]";
            default:
                return "from-[#C69AFF] to-[#6F5BFF]";
        }
    };

    return (
        <div
            role="status"
            aria-live="polite"
            onClick={handleClose}
            className={cn(
                "pointer-events-auto relative flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-[#1A1025] via-[#12091F] to-[#1A1025] px-4 py-3 shadow-[0_0_35px_rgba(140,92,255,0.4)] backdrop-blur-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02]",
                isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
            )}
            style={{
                width: "min(90vw, 400px)",
            }}
        >
            {/* Top Glow Bar */}
            <div
                className={cn(
                    "absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r opacity-80",
                    getGlowColors()
                )}
            />

            {/* Icon Circle */}
            <div
                className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br shadow-[0_0_15px_rgba(140,92,255,0.5)]",
                    getGlowColors()
                )}
            >
                {getIcon()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/90 leading-tight">{message}</p>
            </div>

            {/* Close Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                }}
                className="shrink-0 rounded-full p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
                <X size={14} />
            </button>
        </div>
    );
};
