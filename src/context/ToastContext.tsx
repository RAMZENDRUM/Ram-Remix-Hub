"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type ToastType = "success" | "error";

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    pushToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const pushToast = useCallback((type: ToastType, message: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, message }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ pushToast }}>
            {children}
            <div className="pointer-events-none fixed inset-x-0 top-24 z-[100] flex flex-col items-center gap-3">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={cn(
                            "pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-2.5 shadow-lg shadow-black/50 backdrop-blur-xl bg-neutral-900/90 animate-in fade-in slide-in-from-top-2",
                            toast.type === "success" && "border-emerald-500/70",
                            toast.type === "error" && "border-red-500/70"
                        )}
                    >
                        <div
                            className={cn(
                                "h-2 w-2 rounded-full shadow-[0_0_16px_currentColor]",
                                toast.type === "success" && "bg-emerald-400 text-emerald-400",
                                toast.type === "error" && "bg-red-400 text-red-400"
                            )}
                        />
                        <span className="text-xs font-medium text-white">{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
