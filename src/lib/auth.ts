import db from "@/lib/db";
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

/**
 * Utility: Fetch or Create User and Account
 */
const fetchOrCreateUser = async (
    user: User,
    account: { provider: string; id: string; type: string }
) => {
    const { email, name, image } = user;
    const { provider, id: providerAccountId, type } = account;

    if (!email) throw new Error("Email is required for OAuth");

    const providerStr = String(provider);
    const providerAccountIdStr = String(providerAccountId);

    // Find or create user
    let existingUser = await db.user.findUnique({ where: { email } });

    if (!existingUser) {
        existingUser = await db.user.create({
            data: {
                email,
                name: name || "",
                image: image || "",
            },
        });
    }

    // Check if account exists, else link the account
    const existingAccount = await db.account.findUnique({
        where: {
            provider_providerAccountId: {
                provider: providerStr,
                providerAccountId: providerAccountIdStr,
            },
        },
    });

    if (!existingAccount) {
        await db.account.create({
            data: {
                userId: existingUser.id,
                type,
                provider: providerStr,
                providerAccountId: providerAccountIdStr,
            },
        });
    }

    return existingUser;
};

export const authOptions: AuthOptions = {
    pages: {
        signIn: "/auth/signin",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    callbacks: {
        /**
         * JWT Callback: Add user ID to the token
         */
        async jwt({ token, user }: { token: JWT; user?: User }) {
            if (user) token.id = String(user.id);
            return token;
        },

        /**
         * Session Callback: Add user ID to the session
         */
        async session({ session }: { session: Session }) {
            const email = session.user?.email;
            if (!email) {
                console.error("Session error: Missing email");
                return session;
            }

            const dbUser = await db.user.findUnique({ where: { email } });
            if (dbUser) {
                session.user.id = dbUser.id;
            } else {
                console.error("Session error: User not found in database");
            }

            return session;
        },

        /**
         * Sign-In Callback: Handle user and account creation
         */
        async signIn({ user, account }) {
            try {
                if (!account) throw new Error("Missing account information");

                await fetchOrCreateUser(user, {
                    provider: account.provider,
                    id: String(account.id),
                    type: account.type || "oauth",
                });

                return true;
            } catch (error) {
                return false;
            }
        },
    },
};
