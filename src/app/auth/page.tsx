import { Suspense } from "react";
import RobotSection from "@/components/RobotSection";
import LoginCard from "@/components/auth/LoginCard";
import { BrandLogo } from "@/components/BrandLogo";

export default function AuthPage() {
    return (
        <main className="min-h-screen text-white flex flex-col relative overflow-hidden bg-transparent">
            {/* Header */}
            <div className="absolute top-8 left-0 right-0 z-20 flex justify-center px-4 text-center">
                <BrandLogo variant="auth" />
            </div>

            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-0 lg:gap-4 px-4 lg:px-12 relative z-10 max-w-7xl mx-auto w-full">
                {/* Left: Robot Section */}
                <div className="relative w-full lg:w-[55%] aspect-video lg:aspect-auto lg:h-[600px] flex justify-end">
                    <div className="w-full h-full">
                        <RobotSection />
                    </div>
                </div>

                {/* Right: Login Card */}
                <div className="w-full lg:w-[35%] flex justify-start lg:-ml-12">
                    <Suspense fallback={<div>Loading...</div>}>
                        <LoginCard />
                    </Suspense>
                </div>
            </div>
        </main>
    );
}
