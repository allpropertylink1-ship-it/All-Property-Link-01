import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limiter";

const loginRateLimiter = rateLimit({ max: 20, windowMs: 60_000 });

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip = (req?.headers as Record<string, string>)?.["x-forwarded-for"]?.split(",")[0]?.trim() || (req?.headers as Record<string, string>)?.["x-real-ip"] || "unknown";
        const { allowed } = loginRateLimiter(ip);
        if (!allowed) throw new Error("RATE_LIMITED");

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        if (credentials.password === "__MAGIC_LINK__") {
          const recentToken = await prisma.magicLinkToken.findFirst({
            where: {
              email: credentials.email,
              usedAt: { gt: new Date(Date.now() - 30000) },
            },
          });
          if (!recentToken) return null;

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
          };
        }

        if (!user.passwordHash) return null;
        if (user.lockedUntil && user.lockedUntil > new Date()) throw new Error("ACCOUNT_LOCKED");

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          const newAttempts = user.failedLoginAttempts + 1;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: newAttempts,
              lastFailedLogin: new Date(),
              lockedUntil:
                newAttempts >= 5
                  ? new Date(Date.now() + 15 * 60 * 1000)
                  : undefined,
            },
          });
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLogin: new Date(),
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            profile(profile) {
              const nameParts = (profile.name || "").split(" ");
              return {
                id: profile.sub,
                email: profile.email,
                firstName: nameParts[0] || profile.email?.split("@")[0] || "User",
                lastName: nameParts.slice(1).join(" ") || "",
                image: profile.picture,
              };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sUser = session.user as unknown as { id: string; role: string };
        sUser.id = token.id as string;
        sUser.role = token.role as string;
      }
      return session;
    },
  },
};
