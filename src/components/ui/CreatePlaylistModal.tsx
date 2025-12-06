import { useState } from "react";
import { X } from "lucide-react";

interface CreatePlaylistModalProps {
    onClose: () => void;
    onCreate: (name: string) => void;
}

export default function CreatePlaylistModal({ onClose, onCreate }: CreatePlaylistModalProps) {
    const [name, setName] = useState("");

    const handleSubmit = () => {
        if (!name.trim()) return;
        onCreate(name.trim());
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-md p-6 rounded-2xl bg-[#0f0f13] border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">Create New Playlist</h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
                            Playlist Name
                        </label>
                        <input
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
                            type="text"
                            placeholder="My Awesome Playlist"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            className="px-5 py-2.5 rounded-full text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/20 transition-all transform hover:scale-105 active:scale-95"
                            onClick={handleSubmit}
                            disabled={!name.trim()}
                        >
                            Create Playlist
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
