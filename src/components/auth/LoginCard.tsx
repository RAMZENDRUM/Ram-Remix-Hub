"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginCard() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const searchParams = useSearchParams();
    const urlError = searchParams.get("error");
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    useEffect(() => {
        if (urlError === "OAuthAccountNotLinked") {
            setError("Email already in use with a different provider. Please sign in with your password.");
        }
    }, [urlError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid email or password");
        } else {
            router.push(callbackUrl);
        }
    };

    return (
        <div className="w-full max-w-md bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 lg:p-8 backdrop-blur-md">
            <div className="mb-8 flex flex-col items-center gap-6 text-center">
                <div className="flex items-center gap-2 font-bold text-white text-xl">
                    <div className="flex items-end gap-1">
                        <span className="h-3 w-1 rounded-full bg-white" />
                        <span className="h-6 w-1 rounded-full bg-white" />
                        <span className="h-4 w-1 rounded-full bg-white" />
                    </div>
                    Ram Remix Hub
                </div>
                <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md text-center">
                        {error}
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
                        autoComplete="email"
                    />
                </div>
                <div className="space-y-2">
                    <Input
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-black/50 border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-neutral-700 h-11"
                        autoComplete="current-password"
                    />
                    <div className="flex justify-end">
                        <Link href="/forgot-password" className="text-sm text-neutral-400 hover:text-white hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-neutral-200 mt-2 h-11 font-semibold"
                >
                    Login
                </Button>

                <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-neutral-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-neutral-900 px-2 text-neutral-500">Or continue with</span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    className="w-full border-neutral-800 bg-black/50 text-white hover:bg-neutral-900 hover:text-white h-11"
                    type="button"
                    onClick={() => signIn("google", { callbackUrl })}
                >
                    <FcGoogle className="mr-2 h-5 w-5" />
                    Sign in with Google
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-neutral-500">
                Don't have an account?{" "}
                <Link href="/signup" className="font-medium text-white hover:underline">
                    Sign up
                </Link>
            </div>
        </div>
    );
}
