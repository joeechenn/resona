import NextAuth from "next-auth";
import SpotifyProvider  from "next-auth/providers/spotify";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

console.log("=== AUTH.TS LOADED ===");
console.log("SPOTIFY_CLIENT_ID:", process.env.SPOTIFY_CLIENT_ID ? "EXISTS" : "MISSING");
console.log("SPOTIFY_CLIENT_SECRET:", process.env.SPOTIFY_CLIENT_SECRET ? "EXISTS" : "MISSING");
console.log("AUTH_SECRET:", process.env.AUTH_SECRET ? "EXISTS" : "MISSING");
console.log("AUTH_URL:", process.env.AUTH_URL);
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("======================");

export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth({
    adapter: PrismaAdapter(prisma),
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    basePath: "/api/auth",
    session: {
        strategy: "database",
    },
    cookies: {
        pkceCodeVerifier: {
            name: "next-auth.pkce.code_verifier",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: false,
                maxAge: 900,
            },
        },
    },
    providers: [
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
 