"use client";

import React from "react";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-neutral-900 to-black border border-neutral-700/80 shadow-2xl shadow-black/60 px-6 py-5 scale-100 animate-in zoom-in-95 duration-200">
                <h2 className="text-lg font-semibold text-white mb-1">{title}</h2>
                <p className="text-xs text-neutral-400 mb-6 leading-relaxed">{description}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="rounded-full border border-neutral-700 bg-transparent px-4 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded-full border border-red-500/70 bg-red-600/80 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-red-900/50 transition-all hover:bg-red-500 hover:shadow-red-500/80 active:scale-95"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
