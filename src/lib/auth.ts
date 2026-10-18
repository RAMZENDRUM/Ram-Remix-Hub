import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getLocalUserByEmail, addLocalUser } from "@/lib/localData";

export const authOptions: NextAuthOptions = {
    // Pure JWT strategy: No external DB required, runs 100% serverless without Supabase or local laptop DB
    secret: process.env.NEXTAUTH_SECRET || "ehfoichwbfwufh4hbvrhjvfubcfoeveb",
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                isGuest: { label: "isGuest", type: "text" }
            },
            async authorize(credentials) {
                // 1. Instant Guest Sign-In (no password or email required)
                if (credentials?.isGuest === "true") {
                    return {
                        id: "guest-user",
                        name: "Guest Listener",
                        email: "guest@ramremixhub.com",
                        image: null,
                        role: "LISTENER",
                    };
                }

                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email.toLowerCase().trim();

                // 2. Check local bundled users (stored directly in code / JSON)
                const localUser = getLocalUserByEmail(email);
                if (localUser && localUser.passwordHash) {
                    const isValid = await bcrypt.compare(credentials.password, localUser.passwordHash);
                    if (isValid) {
                        return {
                            id: localUser.id,
                            name: localUser.name || "User",
                            email: localUser.email,
                            image: localUser.image || null,
                            role: localUser.role || "LISTENER",
                        };
                    }
                }

                // 3. Fallback attempt for any Prisma DB if connected
                try {
                    const { prisma } = await import("@/lib/prisma");
                    const user = await prisma.user.findUnique({
                        where: { email }
                    });

                    if (user && user.passwordHash) {
                        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
                        if (isValid) {
                            return {
                                id: user.id,
                                name: user.name || "User",
                                email: user.email || email,
                                image: user.image || null,
                                role: user.role || "LISTENER",
                            };
                        }
                    }
                } catch (e) {
                    // Safe silent fallback: DB is offline / not using Supabase
                    console.log("Database offline, authenticated against local user data");
                }

                return null;
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth",
    },
    callbacks: {
        async jwt({ token, user, trigger, session, account }) {
            if (trigger === "update" && session?.user) {
                token.name = session.user.name;
                token.picture = session.user.image;
            }

            if (user) {
                token.id = user.id;
                token.role = (user as any).role || "LISTENER";
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).role = token.role as any;
            }
            return session;
        }
    }
};
