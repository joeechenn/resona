import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Discover from '@/components/dashboard/discover/Discover';

export default async function DiscoverPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <Discover />;
}
