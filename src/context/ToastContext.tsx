"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Toast, ToastProps, ToastVariant } from "@/components/ui/Toast";

interface ToastContextType {
    showToast: (props: { message: string; variant?: ToastVariant }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<Omit<ToastProps, "onClose"> | null>(null);

    const showToast = useCallback(({ message, variant = "info" }: { message: string; variant?: ToastVariant }) => {
        const id = Date.now().toString();
        setToast({ id, message, variant });
    }, []);

    const closeToast = useCallback(() => {
        setToast(null);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 pointer-events-none">
                {toast && (
                    <Toast
                        key={toast.id}
                        id={toast.id}
                        message={toast.message}
                        variant={toast.variant}
                        onClose={closeToast}
                    />
                )}
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
