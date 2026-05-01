import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getGlobalTop } from '@/lib/spotify';

export async function GET() {
    // onboarding is for signed-in users only
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tracks = await getGlobalTop(5);
        return NextResponse.json({ tracks });
    } catch (error) {
        console.error('Failed to fetch popular tracks for onboarding:', error);
        return NextResponse.json({ error: 'Failed to fetch popular tracks' }, { status: 502 });
    }
}
