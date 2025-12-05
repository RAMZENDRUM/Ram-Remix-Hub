"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { ShinyButton } from "@/components/ui/ShinyButton";

const Pricing = () => {
    const [isAnnual, setIsAnnual] = useState(false);

    const plans = [
        {
            name: "Eclipse",
            price: "₹0",
            description: "For listeners",
            features: [
                "Unlimited streaming of all remixes, albums, soundtracks",
                "Free downloads (non-commercial)",
                "Standard audio",
                "Public playlists",
                "Community support",
            ],
            cta: "Continue with Eclipse",
            highlighted: false,
        },
        {
            name: "Stellar",
            price: isAnnual ? "₹950" : "₹99",
            description: "For dedicated fans",
            features: [
                "Everything in Eclipse",
                "Early access to releases before public",
                "Exclusive unreleased tracks / drafts",
                "HQ downloads (non-commercial)",
                "1 remix request / month (non-commercial)",
                "Priority email support",
            ],
            cta: "Upgrade to Stellar",
            highlighted: !isAnnual, // Highlighted only on Monthly
        },
        {
            name: "Cosmic",
            price: isAnnual ? "₹2,880" : "₹299",
            description: "For creators & filmmakers",
            features: [
                "Everything in Stellar",
                "Full custom remix requests",
                "Commercial license included",
                "Monetization allowed",
                "First-priority email & delivery",
            ],
            cta: "Upgrade to Cosmic",
            highlighted: isAnnual, // Highlighted only on Annual
        },
    ];

    return (
        <div className="bg-black mt-14">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                        Plans and Pricing
                    </h1>
                    <p className="mb-6 text-lg text-zinc-400">
                        Receive unlimited credits when you pay yearly, and save on your plan
                    </p>

                    <div className="inline-flex items-center rounded-full bg-white/5 p-1">
                        <button
                            className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-full ${!isAnnual
                                ? "bg-white/10 text-white"
                                : "text-zinc-400 hover:text-white"
                                }`}
                            onClick={() => setIsAnnual(false)}
                        >
                            Monthly
                        </button>
                        <button
                            className={`px-4 py-2.5 text-sm font-medium transition-colors rounded-full ${isAnnual
                                ? "bg-white/10 text-white"
                                : "text-zinc-400 hover:text-white"
                                }`}
                            onClick={() => setIsAnnual(true)}
                        >
                            Annual
                        </button>
                    </div>
                </div>

                {/* Plans */}
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-3xl border p-5 transition-all duration-300 backdrop-blur-xl ${plan.highlighted
                                ? "border-purple-400/60 bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-[0_0_40px_rgba(168,85,247,0.45)] scale-[1.02] z-10"
                                : "border-white/10 bg-white/[0.02] hover:border-purple-300/60 hover:shadow-[0_0_24px_rgba(168,85,247,0.35)]"
                                }`}
                        >
                            {/* Most popular badge */}
                            {plan.highlighted && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-purple-500/40 blur-[4px]" />
                                        <div className="relative rounded-full border border-white/20 bg-black/70 px-4 py-1.5 backdrop-blur-sm">
                                            <div className="flex items-center gap-1.5">
                                                <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
                                                <span className="text-xs font-medium text-slate-50">
                                                    {isAnnual ? "Best Value" : "Most Popular"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Plan name with neon edge */}
                            <div className="mb-6 space-y-4">
                                <div className="inline-flex items-center">
                                    <div className="inline-flex rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-sky-400 p-[1px] shadow-[0_0_18px_rgba(168,85,247,0.8)]">
                                        <span className="rounded-full bg-black px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-100">
                                            {plan.name}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-white">
                                        {plan.price}
                                    </span>
                                    {plan.price !== "Custom" && (
                                        <span className="text-sm text-zinc-400">
                                            /{isAnnual ? "year" : "month"}
                                        </span>
                                    )}
                                </div>

                                <p className="mt-2 text-sm text-zinc-400">
                                    {plan.description}
                                </p>
                            </div>

                            {/* Features */}
                            <div className="mb-6 space-y-3">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                        <Check className="h-4 w-4 text-emerald-400/80 shrink-0" />
                                        <span className="text-sm text-zinc-200">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA – ShinyButton with neon edge */}
                            <ShinyButton
                                className={`w-full text-xs px-4 whitespace-nowrap ${plan.highlighted
                                    ? "[--shiny-cta-highlight:#a855f7] [--shiny-cta-highlight-subtle:#22d3ee]"
                                    : "[--shiny-cta-highlight:#4b5563] [--shiny-cta-highlight-subtle:#9ca3af]"
                                    }`}
                                onClick={() => {
                                    // TODO: handle purchase / redirect here
                                    console.log("Selected plan:", plan.name);
                                }}
                            >
                                {plan.cta}
                            </ShinyButton>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Pricing;
