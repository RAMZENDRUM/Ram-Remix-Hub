"use client";

import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

interface Login1Props {
    heading?: string;
    logo?: {
        url: string;
        src: string;
        alt: string;
        title?: string;
    };
    buttonText?: string;
    googleText?: string;
    signupText?: string;
    signupUrl?: string;
}

const Login1 = ({
    heading = "Welcome back",
    logo = {
        url: "/",
        src: "/logo-light.svg",
        alt: "Ram Remix Hub",
        title: "Ram Remix Hub",
    },
    buttonText = "Login",
    googleText = "Sign up with Google",
    signupText = "Don't have an account?",
    signupUrl = "/auth?mode=signup",
}: Login1Props) => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(email);
    };

    return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900/80 p-8 shadow-2xl backdrop-blur-sm">
                {/* Header/Logo */}
                <div className="mb-8 flex flex-col items-center gap-6 text-center">
                    {/* Logo Icon + Text */}
                    <div className="flex items-center gap-2 font-bold text-white text-xl">
                        {/* Simple waveform icon to match footer/brand */}
                        <div className="flex items-end gap-1">
                            <span className="h-3 w-1 rounded-full bg-white" />
                            <span className="h-6 w-1 rounded-full bg-white" />
                            <span className="h-4 w-1 rounded-full bg-white" />
                        </div>
                        Ram Remix Hub
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-black/50 border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-neutral-700 h-11"
                        />
                    </div>

                    <Button type="submit" className="w-full bg-white text-black hover:bg-neutral-200 mt-2 h-11 font-semibold">
                        {buttonText}
                    </Button>

                    <Button variant="outline" className="w-full border-neutral-800 bg-black/50 text-white hover:bg-neutral-900 hover:text-white h-11" type="button">
                        <FcGoogle className="mr-2 h-5 w-5" />
                        {googleText}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-neutral-500">
                    {signupText}{" "}
                    <a href={signupUrl} className="font-medium text-white hover:underline">
                        Sign up
                    </a>
                </div>
            </div>
        </div>
    );
};

export { Login1 };
