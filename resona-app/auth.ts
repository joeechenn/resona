import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth({
    adapter: PrismaAdapter(prisma),
    secret: process.env.AUTH_SECRET,
    session: {
        strategy: "database",
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, profile }) {
            // refresh Google profile image on every sign-in so URL stays current
            if (profile?.picture && user.email) {
                await prisma.user.update({
                    where: { email: user.email },
                    data: { image: profile.picture }
                });
            }
            return true;
        },
        async session({ session, user }) {
            session.user.id = user.id;
            return session;
        },
    },
    debug: false,
});
