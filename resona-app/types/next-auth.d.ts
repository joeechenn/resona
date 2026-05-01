import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            hasCompletedOnboarding: boolean;
        } & DefaultSession["user"];
    }
}
