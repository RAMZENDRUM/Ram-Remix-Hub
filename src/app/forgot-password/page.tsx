"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setMessage({ type: 'success', text: "If an account exists with this email, you will receive a password reset link." });
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
                    <h2 className="text-2xl font-semibold text-white">Reset Password</h2>
                    <p className="text-neutral-400 text-sm">Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {message && (
                        <div className={`p-3 text-sm rounded-md text-center ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Input
                            type="email"
                            placeholder="Email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-black/50 border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-neutral-700 h-11"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-white text-black hover:bg-neutral-200 mt-2 h-11 font-semibold"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Sending..." : "Send Reset Link"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-neutral-500">
                    <Link href="/auth" className="font-medium text-white hover:underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
