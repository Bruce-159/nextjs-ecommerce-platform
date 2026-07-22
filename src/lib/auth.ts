import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

const googleProvider = Google({
  clientId: process.env.AUTH_GOOGLE_ID,
  clientSecret: process.env.AUTH_GOOGLE_SECRET,
  // Google 已驗證 email，允許與既有帳密帳號合併，避免同 email 建出第二個會員
  allowDangerousEmailAccountLinking: true,
  profile(profile) {
    return {
      // 必須使用穩定的 Google sub，否則每次登入會被當成新 Account
      id: profile.sub,
      name: profile.name,
      email: profile.email?.toLowerCase(),
      image: profile.picture,
      role: "user",
    };
  },
});

async function clearOAuthIntent() {
  const cookieStore = await cookies();
  cookieStore.delete("oauth_intent");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    googleProvider,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;

      const googleProfile = profile as {
        email_verified?: boolean;
        email?: string;
      };

      if (!googleProfile?.email_verified || !googleProfile.email) {
        await clearOAuthIntent();
        return false;
      }

      const email = googleProfile.email.toLowerCase();
      const cookieStore = await cookies();
      const intent = cookieStore.get("oauth_intent")?.value;

      // 從註冊頁走 Google：若帳號已存在，不直接登入，改導向登入頁詢問
      if (intent === "register") {
        const [existingAccount, existingUser] = await Promise.all([
          prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: "google",
                providerAccountId: account.providerAccountId,
              },
            },
            select: { id: true },
          }),
          prisma.user.findUnique({
            where: { email },
            select: { id: true },
          }),
        ]);

        if (existingAccount || existingUser) {
          await clearOAuthIntent();
          const params = new URLSearchParams({
            message: "google_exists",
            askGoogle: "1",
            email,
          });
          return `/login?${params.toString()}`;
        }
      }

      await clearOAuthIntent();
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // OAuth 登入時改以 DB 使用者為準，避免沿用暫存 profile id 造成身分錯亂
        if (account?.provider === "google" && user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email.toLowerCase() },
            select: { id: true, role: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            return token;
          }
        }
        token.id = user.id;
        token.role = user.role ?? "user";
      } else if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "user";
      }
      return session;
    },
  },
});
