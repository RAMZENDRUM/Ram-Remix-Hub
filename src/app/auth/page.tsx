import { Suspense } from "react";
import LoginCard from "@/components/auth/LoginCard";
import { BrandLogo } from "@/components/BrandLogo";

export default function AuthPage() {
    return (
        <main className="min-h-screen text-white flex flex-col relative overflow-hidden bg-transparent">
            {/* Header */}
            <div className="absolute top-8 left-0 right-0 z-20 flex justify-center px-4 text-center">
                <BrandLogo variant="auth" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 max-w-7xl mx-auto w-full">
                {/* Right: Login Card */}
                <div className="w-full max-w-md">
                    <Suspense fallback={<div>Loading...</div>}>
                        <LoginCard />
                    </Suspense>
                </div>
            </div>
        </main>
    );
}
