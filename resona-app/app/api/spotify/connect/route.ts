import { auth } from "@/auth";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { getSpotifyRedirectUri, SPOTIFY_SCOPES } from "@/lib/spotify";

export async function GET() {
    const session = await auth();

    // check if user is authenticated
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // generate oauth state for this spotify connect flow
    const state = crypto.randomBytes(16).toString("hex");

    // store temporary oauth state and user binding for callback validation
    const cookieStore = await cookies();
    cookieStore.set("spotify_oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 600,
        path: "/api/spotify",
        sameSite: "lax",
    });

    cookieStore.set("spotify_oauth_user", session.user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 600,
        path: "/api/spotify",
        sameSite: "lax",
    });

    // build spotify authorize parameters
    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        scope: SPOTIFY_SCOPES.join(" "),
        redirect_uri: getSpotifyRedirectUri(),
        state,
    });

    // redirect the user to spotify's authorize page
    return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}
