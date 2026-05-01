import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import OnboardingClient from '@/components/onboarding/OnboardingClient';

export default async function OnboardingPage() {
    const session = await auth();

    // not signed in -> bounce to login (will return here after auth)
    if (!session?.user?.id) {
        redirect('/login');
    }

    // already onboarded -> no need to revisit
    if (session.user.hasCompletedOnboarding) {
        redirect('/');
    }

    return <OnboardingClient />;
}
