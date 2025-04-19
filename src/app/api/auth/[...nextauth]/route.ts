import { authOptions } from "@/lib/auth";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
      user: {
          id: string | undefined;
      } & DefaultSession["user"];
  }
  interface User {
      id: string;
  }
}
declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        name?: string | null;
        email?: string | null;
        picture?: string | null;
        // Add any other custom fields you want in the token
    }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST };
