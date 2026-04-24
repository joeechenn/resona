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
            // waitlist gate
            const entry = await prisma.waitlistEntry.findUnique({
                where: { email: user.email! },
            });
            if (!entry?.approved) return false;

            // refresh Google profile image on every sign-in so URL stays current
            if (profile?.picture && user.email) {
                try {
                    await prisma.user.update({
                        where: { email: user.email },
                        data: { image: profile.picture }
                    });
                } catch {
            // user doesn't exist yet on first sign-in, adapter creates them after this callback
            }
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
