"use client";

import RobotSection from "@/components/RobotSection";
import SignupCard from "@/components/auth/SignupCard";

export default function SignupPage() {
    return (
        <main className="min-h-screen text-white flex flex-col">
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 px-4 lg:px-12">
                {/* Left: Robot Section */}
                <div className="relative w-full lg:w-3/5 aspect-video lg:aspect-auto lg:h-[600px]">
                    <RobotSection />
                </div>

                {/* Right: Signup Card */}
                <div className="w-full lg:w-2/5 flex justify-center">
                    <SignupCard />
                </div>
            </div>
        </main>
    );
}
