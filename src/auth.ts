import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Email + password only for now — no OAuth provider appears anywhere in
// the Stitch screens (docs/stitch-export/02-sign-up.html, 03-log-in.html).
// JWT sessions, not database sessions: we don't need a full Auth.js
// DrizzleAdapter (accounts/sessions/verificationToken tables) for a single
// Credentials provider, and it would fight ADR-0002's RLS model (those
// adapter tables would need their own policies for no real benefit here).
export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        // Plain `db`, not withUserContext: there's no session yet to scope
        // by — this IS the query that establishes one. schema.ts's
        // users_select_for_login policy allows this specific lookup on its
        // own. Every other query in the app should go through
        // withUserContext instead.
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()))
          .limit(1);

        if (!user) return null;

        const passwordMatches = await compare(password, user.passwordHash);
        if (!passwordMatches) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
