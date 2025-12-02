"use client";

import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
    const router = useRouter();
    const { token } = use(params);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords do not match" });
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setMessage({ type: 'success', text: "Password reset successfully. Redirecting to login..." });
            setTimeout(() => {
                router.push("/auth");
            }, 2000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <div className="w-full max-w-md bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 lg:p-8 backdrop-blur-md">
                <div className="mb-8 flex flex-col items-center gap-6 text-center">
                    <div className="flex items-center gap-2 font-bold text-white text-xl">
                        Ram Remix Hub
                    </div>
                    <h2 className="text-2xl font-semibold text-white">Set New Password</h2>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {message && (
                        <div className={`p-3 text-sm rounded-md text-center ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="New Password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-black/50 border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-neutral-700 h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Confirm New Password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-black/50 border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-neutral-700 h-11"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-white text-black hover:bg-neutral-200 mt-2 h-11 font-semibold"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Resetting..." : "Reset Password"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
