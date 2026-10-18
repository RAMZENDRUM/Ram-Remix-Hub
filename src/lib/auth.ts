import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
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
                // Instant Guest Sign-In (no password or email required)
                if (credentials?.isGuest === "true") {
                    try {
                        const guestEmail = "guest@ramremixhub.com";
                        const guestUser = await prisma.user.upsert({
                            where: { email: guestEmail },
                            update: {},
                            create: {
                                email: guestEmail,
                                name: "Guest Listener",
                                role: "LISTENER",
                            },
                        });

                        return {
                            id: guestUser.id,
                            name: guestUser.name || "Guest Listener",
                            email: guestUser.email,
                            image: guestUser.image || null,
                            role: guestUser.role,
                        };
                    } catch (e) {
                        console.error("Error with guest account upsert in DB:", e);
                        return {
                            id: "guest-default-id",
                            name: "Guest Listener",
                            email: "guest@ramremixhub.com",
                            image: null,
                            role: "LISTENER",
                        };
                    }
                }

                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.passwordHash) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                };
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
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session?.user) {
                token.name = session.user.name;
                token.picture = session.user.image;
            }

            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as any;
            }
            return session;
        }
    }
};
