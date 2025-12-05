"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface UserProfile {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
    profileImageUrl?: string | null;
}

interface UserContextType {
    user: UserProfile | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    refreshUser: async () => { },
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        if (status === "unauthenticated") {
            setUser(null);
            setLoading(false);
            return;
        }

        if (status === "loading") return;

        try {
            const res = await fetch("/api/user/me");
            if (res.ok) {
                const data = await res.json();
                console.log("[UserContext] Fetched User:", data?.email, data?.role); // Debug Identity
                setUser(data);
            } else {
                // If /api/user/me fails (e.g. 401), fall back to session or clear
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to fetch user profile", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [status, session?.user?.email]);

    return (
        <UserContext.Provider value={{ user, loading, refreshUser: fetchUser }}>
            {children}
        </UserContext.Provider>
    );
}
