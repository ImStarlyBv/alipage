import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/models";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const customer = await prisma.customer.findUnique({
          where: { email: credentials.email },
          select: { id: true, email: true, name: true, passwordHash: true, role: true },
        });

        if (!customer || !customer.passwordHash) {
          return null;
        }

        const passwordValid = await compare(credentials.password, customer.passwordHash);
        if (!passwordValid) {
          return null;
        }

        return {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          role: customer.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;

        // Find or create customer for this Google account
        const existing = await prisma.customer.findUnique({
          where: { email },
        });

        if (!existing) {
          // Create new customer from Google profile
          await prisma.customer.create({
            data: {
              email,
              name: user.name || email.split("@")[0],
              // No passwordHash — Google OAuth user
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user && account?.provider === "credentials") {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }

      if (account?.provider === "google" && user?.email) {
        // Look up the customer to get their DB id and role
        const customer = await prisma.customer.findUnique({
          where: { email: user.email },
          select: { id: true, role: true },
        });
        if (customer) {
          token.id = customer.id;
          token.role = customer.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
