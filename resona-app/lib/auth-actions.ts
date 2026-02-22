"use server";

import { signIn, signOut } from "@/auth";

export const loginWithGoogle = async () => {
    await signIn("google", { redirectTo: "/" });
}

export const loginWithSpotify = async () => {
    await signIn("spotify", { redirectTo: "/" });
}

export const logout = async () => {
    await signOut({ redirectTo: "/login" });
}