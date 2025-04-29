import argon2 from "argon2";
import { AuthOptions, User as NextAuthUser, Account as NextAuthAccount } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import db from "./db";
import { User as PrismaUser } from "@prisma/client";
import { nowZoned } from "./date";
import { logServerError } from "@/actions/actionUtils";

type ProviderUserInfo = Pick<NextAuthUser, 'email' | 'name' | 'image'>;
type ProviderAccountInfo = Pick<NextAuthAccount, 'provider' | 'providerAccountId' | 'type' | 'access_token' | 'refresh_token' | 'expires_at' | 'id_token' | 'scope' | 'session_state' | 'token_type'>;


// --- Database User/Account Handling ---
/**
 * Finds an existing user by email or creates a new one using provider details,
 * then ensures the specific OAuth provider account is linked to the user.
 * This operation is performed within a database transaction for atomicity.
 * User profile data (name, image) is only set on creation, not overwritten.
 *
 * @param userProfile - User profile data from the OAuth provider (must include email).
 * @param account - OAuth account details from NextAuth.
 * @returns The PrismaUser record (found or created).
 * @throws Error if email is missing or if the database transaction fails.
 */
const fetchOrCreateUser = async (
    userProfile: ProviderUserInfo,
    account: ProviderAccountInfo // Use the specific type
): Promise<PrismaUser> => {
    const email = userProfile.email;
    const providerName = userProfile.name;
    const providerImage = userProfile.image;
    const { provider, providerAccountId, type } = account;

    if (!email) {
        throw new Error(`Email is required for ${provider} sign-in.`);
    }
    try {
        const userInDb = await db.$transaction(async (tx) => {
            let localUser = await tx.user.findUnique({
                where: { email },
            });

            if (!localUser) {
                localUser = await tx.user.create({
                    data: {
                        email,
                        name: providerName || null,
                        image: providerImage || null,
                        emailVerified: nowZoned(),
                    },
                });
            } else {
            }
            if (!localUser) {
                throw new Error("Database error: Failed to find or create user.");
            }

            const userId = localUser.id;

            const existingAccount = await tx.account.findUnique({
                where: {
                    provider_providerAccountId: {
                        provider: provider,
                        providerAccountId: providerAccountId,
                    }
                },
                select: { id: true }
            });

            if (!existingAccount) {
                await tx.account.create({
                    data: {
                        userId: userId,
                        type: type,
                        provider: provider,
                        providerAccountId: providerAccountId,
                        access_token: account.access_token,
                        refresh_token: account.refresh_token,
                        expires_at: account.expires_at,
                        id_token: account.id_token,
                        scope: account.scope,
                        session_state: account.session_state,
                        token_type: account.token_type,
                    },
                });
            } else {
                await tx.account.update({ where: { id: existingAccount.id }, data: { access_token: account.access_token, refresh_token: account.refresh_token } });
            }

            return localUser;
        });

        return userInDb;

    } catch (error) {
        console.error("[Auth] Error in fetchOrCreateUser transaction:", error);
        throw new Error("Database operation failed during sign-in account handling.");
    }
};


export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            /**
             * authorize: Verifies credentials against your database.
             * MUST return the user object on success (without password) or null on failure.
             * Throwing an error here will also signify failure.
             */
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                const { email, password } = credentials;
                try {
                    const user = await db.user.findUnique({ where: { email } });
                    if (!user || !user.password) {
                        return null;
                    }

                    const isValid = await argon2.verify(user.password, password);

                    if (!isValid) {
                        return null;
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    };
                } catch (error: unknown) {
                    logServerError(error as Error, 'verifying credentials');
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60,
    },
    pages: {
        signIn: "/auth/signin",
    },
    callbacks: {
        /**
         * signIn: Controls if a sign-in attempt should be allowed to proceed.
         * Runs AFTER successful OAuth or authorize().
         */
        async signIn({ user, account, profile }) {

            if (account && profile && user && account.provider !== 'credentials') {
                try {
                    const providerUserInfo: ProviderUserInfo = {
                        email: profile.email,
                        name: profile.name ?? user.name,
                        image: profile.image ?? user.image,
                    };

                    if (!providerUserInfo.email) {
                        return false;
                    }

                    const prismaUser = await fetchOrCreateUser(providerUserInfo, account);
                    user.id = prismaUser.id;
                    return true;

                } catch (error: unknown) {
                    logServerError(error as Error, 'verifying credentials');

                    return false;
                }
            }

            return !!user;

        },

        /**
         * jwt: Modifies the JWT before it's saved.
         * - Initial sign in: `user` object from `authorize` or OAuth is available.
         * - Subsequent requests: Only `token` is available initially.
         */

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async jwt({ token, user,
            //  account, profile, 
            trigger, session }) {

            if (user?.id) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.picture = user.image;
            }

            if (trigger === "update" && session?.name && token.id) {
                try {
                    const dbUser = await db.user.findUnique({ where: { id: token.id }, select: { name: true, email: true, image: true } });
                    if (dbUser) {
                        token.name = dbUser.name;
                        token.email = dbUser.email;
                        token.picture = dbUser.image;
                    } else {
                    }
                } catch (error: unknown) {
                    logServerError(error as Error, 'verifying credentials');
                }
            }

            return token;
        },

        /**
         * session: Creates the session object returned to the client.
         * Receives the potentially modified JWT (`token`).
         */
        async session({ session, token }) {

            if (token?.id) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture;
            } else {
                session.user = { ...session.user, id: '', name: null, email: null, image: null };
            }
            return session;
        },
    },
};

