"use client";

import SignupCard from "@/components/auth/SignupCard";

export default function SignupPage() {
    return (
        <main className="min-h-screen text-white flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center px-4">
                {/* Right: Signup Card */}
                <div className="w-full max-w-md">
                    <SignupCard />
                </div>
            </div>
        </main>
    );
}
