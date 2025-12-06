import React from "react";
import { cn } from "@/lib/utils";

type DownloadStatus = "preparing" | "downloading" | "done" | "error";

interface DownloadModalProps {
    progress: number;
    status: DownloadStatus;
    onClose: () => void;
}

const statusText = {
    preparing: "Preparing your file…",
    downloading: "Downloading…",
    done: "Complete!",
    error: "Error downloading file"
};

export default function DownloadModal({ progress, status, onClose }: DownloadModalProps) {
    return (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-[2000] flex items-center justify-center animate-in fade-in duration-200" onClick={status === "done" ? onClose : undefined}>
            <div
                className="w-[340px] p-7 rounded-[20px] bg-[radial-gradient(circle_at_0_0,_#ffffff22,_#05060f)] border border-white/10 shadow-[0_16px_46px_#000000dd] text-center animate-in slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="mb-2 text-xl font-bold text-[#f5f5ff]">Downloading Remix</h3>

                <p className="text-[13px] text-[#a8afd2] mb-[18px]">
                    {statusText[status]}
                </p>

                <div className="w-full h-[7px] rounded-full bg-[#2a2a3e] overflow-hidden mb-[14px]">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[#7b2ff7] to-[#2fd8f5] transition-[width] duration-150 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b4cff] shadow-[0_0_10px_#8b4cff] animate-pulse"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b4cff] shadow-[0_0_10px_#8b4cff] animate-pulse delay-75"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b4cff] shadow-[0_0_10px_#8b4cff] animate-pulse delay-150"></span>
                </div>
            </div>
        </div>
    );
}
