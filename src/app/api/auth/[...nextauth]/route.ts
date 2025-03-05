import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { User } from "@/db/models";
import connectDB from "@/db/db";
import { ADMIN_EMAIL } from "@/config";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: {label: "Email", type: "text"},
        password: {label: "Password", type: "password"}
      },
        async authorize(credentials: any): Promise<any> {
          try {
            await connectDB();

            const user = await User.findOne({
              email: credentials.email,
            });

            if (!user) {
              throw new Error("Invalid credentials");
            }

            const isPasswordMatched = await bcrypt.compare(
              credentials.password,
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
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user = {
          email: token.email,
          id: token.id,
        } as any;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
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