import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "@/db/models";
import connectDB from "@/db/db";
import { ADMIN_EMAIL } from "@/config";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try {
          await connectDB();

          // const User = mongoose.models.User || mongoose.model('User', userSchemaDef);

          const user = await User.findOne({
            email: credentials?.email,
          });

          if (!user) {
            throw new Error("Invalid credentials");
          }

          const isPasswordMatched = await bcrypt.compare(
            credentials?.password as string,
            user.password
          );

          if (!isPasswordMatched) {
            throw new Error("Invalid credentials");
          }

          return {
            email: user.email,
            id: user._id.toString(),
          };
        } catch (error: any) {
          console.error("Authentication error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }: { token: any; user: any }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: ({ session, token }: { session: any; token: any }) => {
      if (token) {
        session.user = {
          email: token.email,
          id: token.id,
        } as any;
      }
      return session;
    },
    async signIn({ user, account, profile }: { user: any; account: any; profile?: any }) {
      return true
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 