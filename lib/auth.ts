import { AuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        // Gunakan ilike agar case-insensitive
        const [user] = await db.select().from(users).where(ilike(users.email, credentials.email.trim()));
        if (!user) return null;
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;
        return { 
          id: user.id.toString(), 
          name: user.name, 
          email: user.email, 
          role: user.role,
          className: user.className 
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { 
        token.role = (user as any).role; 
        token.id = user.id; 
        token.className = (user as any).className;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) { 
        (session.user as any).role = token.role; 
        (session.user as any).id = token.id; 
        (session.user as any).className = token.className;
      }
      return session;
    }
  },
  pages: { signIn: '/' },
  secret: process.env.NEXTAUTH_SECRET,
};

export const getAppSession = () => getServerSession(authOptions);