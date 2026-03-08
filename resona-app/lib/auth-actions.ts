"use server";

import { signIn, signOut } from "@/auth";

export const loginWithGoogle = async () => {
    await signIn("google", { redirectTo: "/" });
}

export const logout = async () => {
    await signOut({ redirectTo: "/login" });
}