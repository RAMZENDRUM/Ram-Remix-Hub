import React from "react";
import { X, Copy, Share2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface ShareModalProps {
    url: string;
    title: string;
    onClose: () => void;
}

export default function ShareModal({ url, title, onClose }: ShareModalProps) {
    const { showToast } = useToast();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            showToast({ variant: 'success', message: 'Link copied to clipboard' });
        } catch (err) {
            console.error(err);
            showToast({ variant: 'error', message: 'Failed to copy link' });
        }
        onClose();
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Listen to ${title} on Ram Remix Hub`,
                    url: url,
                });
            } catch (err) {
                console.error(err);
            }
        } else {
            handleCopy();
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-[2000] flex items-center justify-center animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="w-[320px] p-6 rounded-[20px] bg-[radial-gradient(circle_at_0_0,_#ffffff22,_#05060f)] border border-white/10 shadow-[0_16px_46px_#000000dd] animate-in slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#f5f5ff]">Share Remix</h3>
                    <button onClick={onClose} className="text-[#a8afd2] hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <p className="text-[13px] text-[#a8afd2] mb-5">
                    Share this track with your friends.
                </p>

                <div className="flex gap-3 mb-5">
                    <button
                        onClick={handleCopy}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#161623] border border-white/20 text-[#e3e6ff] text-xs font-medium hover:bg-[#7b2ff733] transition-colors"
                    >
                        <Copy size={14} /> Copy Link
                    </button>
                    <button
                        onClick={handleNativeShare}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#161623] border border-white/20 text-[#e3e6ff] text-xs font-medium hover:bg-[#7b2ff733] transition-colors"
                    >
                        <Share2 size={14} /> System Share
                    </button>
                </div>

                <div className="flex justify-between gap-3">
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Listen to ${title}: ${url}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 rounded-xl bg-[#0e0e1b] border border-white/10 text-[#f7f9ff] text-xs text-center hover:bg-white/5 transition-colors"
                    >
                        WhatsApp
                    </a>
                    <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Listen to ${title}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 rounded-xl bg-[#0e0e1b] border border-white/10 text-[#f7f9ff] text-xs text-center hover:bg-white/5 transition-colors"
                    >
                        X
                    </a>
                    <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Listen to ${title}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 rounded-xl bg-[#0e0e1b] border border-white/10 text-[#f7f9ff] text-xs text-center hover:bg-white/5 transition-colors"
                    >
                        Telegram
                    </a>
                </div>
            </div>
        </div>
    );
}
