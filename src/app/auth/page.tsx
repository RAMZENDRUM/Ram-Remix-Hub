"use client";

import RobotSection from "@/components/RobotSection";
import LoginCard from "@/components/auth/LoginCard";

export default function AuthPage() {
    return (
        <main className="min-h-screen text-white flex flex-col relative overflow-hidden">
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 px-4 lg:px-12 relative z-10">
                {/* Left: Robot Section */}
                <div className="relative w-full lg:w-3/5 aspect-video lg:aspect-auto lg:h-[600px]">
                    <RobotSection />
                </div>

                {/* Right: Login Card */}
                <div className="w-full lg:w-2/5 flex justify-center">
                    <LoginCard />
                </div>
            </div>
        </main>
    );
}
