import NextAuth from "next-auth";
import SpotifyProvider  from "next-auth/providers/spotify";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const {auth, signIn, signOut, handlers: { GET, POST }} = NextAuth({
    trustHost: true,
    secret: process.env.NEXTAUTH_SECRET,
    adapter: PrismaAdapter(prisma),
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
                }},
            }),
        ],
});
 