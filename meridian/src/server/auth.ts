import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import type { Provider } from "next-auth/providers";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { loginSchema } from "@/server/validation/auth";

/** Social login is optional: a provider is enabled only when both of its env vars are set. */
export const socialProviders = {
  google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  linkedin: Boolean(process.env.AUTH_LINKEDIN_ID && process.env.AUTH_LINKEDIN_SECRET),
};

const providers: Provider[] = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw) {
      const parsed = loginSchema.safeParse(raw);
      if (!parsed.success) return null;
      const user = await db.user.findUnique({ where: { email: parsed.data.email } });
      if (!user?.passwordHash) return null;
      const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
      return ok ? { id: user.id, email: user.email, name: user.name } : null;
    },
  }),
];
if (socialProviders.google) providers.push(Google({ allowDangerousEmailAccountLinking: false }));
if (socialProviders.linkedin) providers.push(LinkedIn({ allowDangerousEmailAccountLinking: false }));

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  // Credentials login requires JWT sessions.
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/login" },
  providers,
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
