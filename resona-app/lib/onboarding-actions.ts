"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// flips the onboarding flag and bounces the user to the feed
// session is rebuilt on the next request so the dashboard redirect won't fire again
export async function completeOnboarding() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { hasCompletedOnboarding: true },
    });

    redirect("/");
}
