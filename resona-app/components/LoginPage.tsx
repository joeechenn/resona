import ChangelogModal from './ChangelogModal'
import CoverColumns from './CoverColumns'
import { loginWithGoogle } from "@/lib/auth-actions";
import Image from 'next/image';
import { APP_STAGE, APP_VERSION } from '@/lib/constants/version';
import type { LoginCover } from '@/lib/loginCovers';

const WAITLIST_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScGTJnO9qyJvnllRIwwDHxqJhWKjZvHGyX4ZjsF-eqr7Q3KtQ/viewform';
const ABOUT_URL = 'https://joeechenn.github.io/resona/';

export default function LoginPage({ covers }: { covers: LoginCover[] }) {
  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
        <CoverColumns covers={covers} />

        <div className="flex flex-col items-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-600">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/85 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                {APP_STAGE} &middot; {APP_VERSION}
            </span>

            <h1 className="mt-6 text-6xl font-extrabold tracking-tight sm:text-8xl">Resona</h1>
            <p className="mt-4 text-xl sm:text-2xl">
                Rate Everything. <span className="block sm:inline">Find Who Resonates.</span>
            </p>
            <p className="mt-3 max-w-md text-muted-foreground">
                Score any track, album, or artist from 0–10. Every rating becomes a post your friends can agree with, or argue with.
            </p>

            <form action={loginWithGoogle} className="mt-8 w-full max-w-80">
                <button
                type="submit"
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-foreground font-bold text-background transition-colors hover:bg-neutral-300"
                >
                    <Image src="/google.svg" alt="" width={18} height={18} />
                    Continue with Google
                </button>
            </form>

            <div className="mt-5 flex flex-col items-center gap-2.5 text-sm text-muted-foreground sm:flex-row sm:gap-6">
                <a
                href={WAITLIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground">
                    Not in yet? <span className="font-semibold text-foreground">Join the waitlist &rarr;</span>
                </a>
                <a
                href={ABOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground">
                    What&apos;s Resona?
                </a>
            </div>

            {covers.length > 0 && (
                <p className="mt-6 text-xs text-muted-foreground/70">
                    Every cover here was rated by someone in the beta.
                </p>
            )}
        </div>

        <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6">
            <ChangelogModal />
        </div>
    </div>
  );
}
