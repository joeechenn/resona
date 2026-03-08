import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma";
import { getSpotifyRedirectUri } from "@/lib/spotify";

export async function GET(request: Request) {
    const session = await auth();

    // check if user is authenticated
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // read spotify callback parameters
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // handle denied or invalid callback requests
    if (error) {
        return NextResponse.redirect(
            `${process.env.AUTH_URL}/profile/${session.user.id}?spotify=denied`
        );
    }

    if (!code || !state) {
        return NextResponse.redirect(
            `${process.env.AUTH_URL}/profile/${session.user.id}?spotify=error`
        );
    }

    // verify callback state and the user who started the flow
    const cookieStore = await cookies();
    const storedState = cookieStore.get("spotify_oauth_state")?.value;
    const storedUserId = cookieStore.get("spotify_oauth_user")?.value;
    cookieStore.delete("spotify_oauth_state");
    cookieStore.delete("spotify_oauth_user");

    if (!storedState || state !== storedState) {
        return NextResponse.redirect(
            `${process.env.AUTH_URL}/profile/${session.user.id}?spotify=error`
        );
    }

    if (!storedUserId || storedUserId !== session.user.id) {
        return NextResponse.redirect(
            `${process.env.AUTH_URL}/profile/${session.user.id}?spotify=error`
        );
    }

    // exchange authorization code for spotify tokens
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
                `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64")}`,
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: getSpotifyRedirectUri(),
        }),
    });

    if (!tokenResponse.ok) {
        return NextResponse.redirect(
            `${process.env.AUTH_URL}/profile/${session.user.id}?spotify=error`
        );
    }

    const tokens = await tokenResponse.json();

    // fetch the spotify profile for the connected account
    const profileResponse = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileResponse.ok) {
        return NextResponse.redirect(
            `${process.env.AUTH_URL}/profile/${session.user.id}?spotify=error`
        );
    }

    const spotifyProfile = await profileResponse.json();

    // save the spotify account and tokens to the current user
    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                spotifyId: spotifyProfile.id,
                spotifyAccessToken: tokens.access_token,
                spotifyRefreshToken: tokens.refresh_token,
                spotifyTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
            },
        });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.redirect(
                `${process.env.AUTH_URL}/profile/${session.user.id}?spotify=already-linked`
            );
        }

        return NextResponse.redirect(
            `${process.env.AUTH_URL}/profile/${session.user.id}?spotify=error`
        );
    }

    return NextResponse.redirect(
        `${process.env.AUTH_URL}/profile/${session.user.id}?spotify=connected`
    );
}
