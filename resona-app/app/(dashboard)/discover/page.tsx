import { Suspense } from 'react';
import Recommendations, { RecommendationsLoading } from '@/components/dashboard/discover/Recommendations';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Discover from '@/components/dashboard/discover/Discover';

export default async function DiscoverPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <Discover recommendations={
      <Suspense fallback={<RecommendationsLoading />}>
        <Recommendations />
      </Suspense>
    } />
  );
}
