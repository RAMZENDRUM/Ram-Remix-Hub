'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    name: string;
    email: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: User | null;
    login: (email: string, rememberMe?: boolean) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check session storage first (current session), then local storage (remember me)
        const sessionUser = sessionStorage.getItem('ram_remix_user');
        const localUser = localStorage.getItem('ram_remix_user');

        if (sessionUser) {
            setUser(JSON.parse(sessionUser));
        } else if (localUser) {
            setUser(JSON.parse(localUser));
        }
        setIsLoading(false);
    }, []);

    const login = (email: string, rememberMe: boolean = false) => {
        const role: 'user' | 'admin' = email === 'ramzendrum@gmail.com' ? 'admin' : 'user';
        const newUser: User = { name: email.split('@')[0], email, role };
        setUser(newUser);

        if (rememberMe) {
            localStorage.setItem('ram_remix_user', JSON.stringify(newUser));
            sessionStorage.removeItem('ram_remix_user');
        } else {
            sessionStorage.setItem('ram_remix_user', JSON.stringify(newUser));
            localStorage.removeItem('ram_remix_user');
        }

        // router.push('/'); // Remove immediate redirect to let caller handle it or if it causes issues
        router.push('/');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ram_remix_user');
        sessionStorage.removeItem('ram_remix_user');
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
