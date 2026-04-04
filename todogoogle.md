# Adding Google Sign-In

## Current State
- Auth uses NextAuth with JWT strategy + credentials provider only
- Customer model has `passwordHash` (required) — needs to become optional for OAuth users
- No Account/Session tables in Prisma (needed for OAuth)

---

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select existing)
3. Go to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add **Authorized redirect URIs**:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy the **Client ID** and **Client Secret**

## Step 2: Environment Variables

Add to `.env`:
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Step 3: Install Google Provider

```bash
# Already included in next-auth, no extra package needed
```

## Step 4: Update Prisma Schema

The Customer model needs `passwordHash` to be optional (Google users won't have one).
Add Account + Session models for NextAuth OAuth adapter support.

```prisma
model Customer {
  id           String       @id @default(cuid())
  email        String       @unique
  name         String
  passwordHash String?                          // ← make optional
  role         CustomerRole @default(CUSTOMER)
  addresses    Json?
  orders       Order[]
  cart         Cart?
  accounts     Account[]                        // ← add
  createdAt    DateTime     @default(now())
}

// ← Add these two new models:

model Account {
  id                String  @id @default(cuid())
  customerId        String
  customer          Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text

  @@unique([provider, providerAccountId])
}
```

Then run:
```bash
npx prisma migrate dev --name add-google-oauth
npx prisma generate
```

## Step 5: Create a Prisma Adapter

NextAuth's built-in PrismaAdapter expects models named `User`, `Account`, `Session`.
Since we use `Customer`, we need a custom adapter.

Create `src/lib/auth/prisma-adapter.ts`:
```ts
import { prisma } from "@/lib/models";
import type { Adapter, AdapterUser, AdapterAccount } from "next-auth/adapters";

export function CustomPrismaAdapter(): Adapter {
  return {
    async createUser(user) {
      const created = await prisma.customer.create({
        data: {
          email: user.email,
          name: user.name || "User",
          // no passwordHash for OAuth users
        },
      });
      return { ...created, emailVerified: null } as AdapterUser;
    },

    async getUser(id) {
      const customer = await prisma.customer.findUnique({ where: { id } });
      if (!customer) return null;
      return { ...customer, emailVerified: null } as AdapterUser;
    },

    async getUserByEmail(email) {
      const customer = await prisma.customer.findUnique({ where: { email } });
      if (!customer) return null;
      return { ...customer, emailVerified: null } as AdapterUser;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        include: { customer: true },
      });
      if (!account) return null;
      return { ...account.customer, emailVerified: null } as AdapterUser;
    },

    async updateUser(user) {
      const updated = await prisma.customer.update({
        where: { id: user.id },
        data: { name: user.name ?? undefined, email: user.email ?? undefined },
      });
      return { ...updated, emailVerified: null } as AdapterUser;
    },

    async linkAccount(account) {
      await prisma.account.create({
        data: {
          customerId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
        },
      });
    },

    // These can be no-ops since we use JWT strategy, not database sessions
    async createSession() { return { sessionToken: "", userId: "", expires: new Date() }; },
    async getSessionAndUser() { return null; },
    async updateSession() { return null; },
    async deleteSession() {},
    async deleteUser() {},
    async unlinkAccount() {},
  };
}
```

## Step 6: Update Auth Options

Edit `src/lib/auth/options.ts`:
```ts
import GoogleProvider from "next-auth/providers/google";
import { CustomPrismaAdapter } from "./prisma-adapter";

export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      // ... keep existing credentials provider unchanged
    }),
  ],
  session: {
    strategy: "jwt",  // keep JWT — required when using credentials provider
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "CUSTOMER";
      }
      // On first Google sign-in, fetch role from DB
      if (account?.provider === "google" && user) {
        const customer = await prisma.customer.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        token.role = customer?.role || "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      // ... keep existing session callback unchanged
    },
  },
  // ... keep rest unchanged
};
```

## Step 7: Update Login Page UI

Edit `src/app/auth/login/page.tsx` — add a Google button:
```tsx
import { signIn } from "next-auth/react";

// Inside the form, after the Sign In button:
<div className="relative my-4">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-primary/20" />
  </div>
  <div className="relative flex justify-center text-xs">
    <span className="bg-beige px-2 text-foreground/50">or</span>
  </div>
</div>

<button
  type="button"
  onClick={() => signIn("google", { callbackUrl })}
  className="flex w-full items-center justify-center gap-2 rounded-full border border-primary/20 bg-white py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-beige"
>
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
  Continue with Google
</button>
```

Do the same in `src/app/auth/register/page.tsx`.

## Step 8: Update Register Route

Edit `src/app/api/auth/register/route.ts`:
- Make `passwordHash` optional — but keep requiring password for email registration
- No changes needed if you keep the route as-is (it's only for email+password registration)

## Step 9: Guard Against passwordHash in Credentials Provider

In `authorize()` inside `options.ts`, add a check:
```ts
if (!customer.passwordHash) {
  return null; // This user signed up with Google, can't use credentials
}
```

---

## Summary of Files to Change

| File | Change |
|------|--------|
| `.env` | Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| `prisma/schema.prisma` | `passwordHash` optional, add `Account` model + relation |
| `src/lib/auth/prisma-adapter.ts` | **New** — custom adapter mapping to `Customer` |
| `src/lib/auth/options.ts` | Add GoogleProvider + adapter + account callback |
| `src/app/auth/login/page.tsx` | Add "Continue with Google" button |
| `src/app/auth/register/page.tsx` | Add "Continue with Google" button |

## Migration command
```bash
npx prisma migrate dev --name add-google-oauth
npx prisma generate
```
