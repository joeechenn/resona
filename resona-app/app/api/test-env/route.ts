export async function GET() {
    return Response.json({
        SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID || "MISSING",
        SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET ? "EXISTS (hidden)" : "MISSING",
        AUTH_SECRET: process.env.AUTH_SECRET ? "EXISTS (hidden)" : "MISSING",
        AUTH_URL: process.env.AUTH_URL || "MISSING",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "MISSING",
    });
}