import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getTracks } from '@/lib/spotify';

// curated pool of popular tracks shown during onboarding
const ONBOARDING_TRACK_IDS: string[] = [
    "3jHdKaLCkuNEkWcLVmQPCX",
    "7tr2za8SQg2CI8EDgrdtNl",
    "66dQdXAbtuPdSasezCQVZE",
    "6luBKkFUt5wTwz7hpLhp12",
    "7eKkW1zo5uzW8kUntiiBvz",
    "6xwhCiWXREsAIQVZqHswVw",
    "7DfFc7a6Rwfi3YQMRbDMau",
    "6t7WriKgVszATnrdBKSUAf",
    "5UnDJp9YMWi4ke0o9y5GIc",
    "6fACn9e0wdMIWZa9CZJym8"
];

// fisher-yates shuffle so each user sees a different order
function shuffle<T>(arr: readonly T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

export async function GET() {
    // onboarding is for signed-in users only
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // single batch call — one token fetch, one tracks request, nulls filtered inside getTracks
        const tracks = await getTracks(shuffle(ONBOARDING_TRACK_IDS));
        return NextResponse.json({ tracks });
    } catch (error) {
        console.error('Failed to fetch popular tracks for onboarding:', error);
        return NextResponse.json({ error: 'Failed to fetch popular tracks' }, { status: 502 });
    }
}
