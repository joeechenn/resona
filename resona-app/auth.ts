import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth({
    adapter: PrismaAdapter(prisma),
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    basePath: "/api/auth",
    session: {
        strategy: "database",
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
            authorization: {
                url: "https://accounts.spotify.com/authorize",
                params: {
                    scope: [
                        "user-read-email",
                        "user-read-private",
                        "user-top-read",
                        "user-read-recently-played",
                        "playlist-read-private",
                        "playlist-read-collaborative",
                        "user-follow-read",
                    ].join(" "),
                    redirect_uri: "http://127.0.0.1:3000/api/auth/callback/spotify",
                },
            },
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            session.user.id = user.id;
            return session;
        },
    },
    debug: true,
});