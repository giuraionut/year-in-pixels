// lib/auth.ts
import db from "@/lib/db";  // assuming db is needed later for session handling
import { AuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            image?: string;
        };
    }
}
export const authOptions: AuthOptions = {
    pages:{
        signIn:'/auth/signin'
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: User }) {
            if (user) {
                token.id = String(user.id);
            }
            return token;
        },
        async session({ session }: { session: Session }) {
            const email = session.user?.email;
            if (!email) {
                console.error("Email is missing in session");
                return session;
            }

            const sessionUser = await db.user.findUnique({ where: { email } });

            if (session.user && sessionUser) {
                session.user.id = sessionUser.id;
            } else {
                console.error("User not found in session or DB");
            }

            return session;
        },
        async signIn({ user, account, profile }) {
            console.log(profile);

            if (!account) {
                throw new Error('Missing account');
            }

            const email = user.email;
            const provider = account.provider;
            const providerAccountId = account?.id;
            const accountType = account?.type || 'oauth';

            if (!email) {
                console.error('Email is missing in OAuth profile');
                return false;
            }

            const providerStr = provider ? String(provider) : '';
            const providerAccountIdStr = providerAccountId
                ? String(providerAccountId)
                : '';

            try {
                const existingUser = await db.user.findUnique({
                    where: { email },
                });

                if (!existingUser) {
                    console.log("NO EXISTING USER FOUND");
                    const newUser = await db.user.create({
                        data: {
                            email,
                            name: user.name || '',
                            image: user.image || '',
                        },
                    });
                    if (newUser && newUser.id) {
                        console.log("New user created:", newUser);
                        await db.account.create({
                            data: {
                                userId: newUser.id,
                                type: accountType,
                                provider: providerStr,
                                providerAccountId: providerAccountIdStr,
                            },
                        });
                        return true;
                    } else {
                        console.error('Failed to create user');
                        return false;
                    }
                } else {
                    // Handle existing user logic here
                }
                console.log("USER ALREADY EXISTS");
                // If the user exists, update the account (if needed)
                const existingAccount = await db.account.findUnique({
                    where: {
                        provider_providerAccountId: {
                            provider: providerStr,
                            providerAccountId: providerAccountIdStr,
                        },
                    },
                });

                if (!existingAccount) {
                    console.log("NO EXISTING ACCOUNT FOR PROVIDER");
                    // If no account exists for this provider, create it
                    await db.account.create({
                        data: {
                            userId: existingUser.id,
                            type: accountType,
                            provider: provider,
                            providerAccountId: providerAccountIdStr, // Default to empty string if null
                        },
                    });
                    console.log("Account linked to existing user:", existingUser.id);
                }

                return true;
            } catch (error) {
                console.error('Error during signIn callback:', error);
                return false;  // If there’s an error, prevent sign-in
            }
        },
    }
};
