"use client";

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";

export function SplineSceneBasic() {
    return (
        <Card className="relative h-[500px] w-full overflow-hidden bg-black/95">
            <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />

            <div className="flex h-full">
                {/* Left text */}
                <div className="relative z-10 flex flex-1 flex-col justify-center p-8">
                    <h1 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                        Interactive AI Robot
                    </h1>
                    <p className="mt-4 max-w-lg text-neutral-300">
                        A 3D assistant that welcomes you when you sign in. Move your mouse to see the
                        lighting react in real time.
                    </p>
                </div>

                {/* Right Spline scene */}
                <div className="relative flex-1">
                    <SplineScene
                        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                        className="h-full w-full"
                    />
                </div>
            </div>
        </Card>
    );
}
