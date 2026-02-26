import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Feed from '@/components/dashboard/feed/Feed';

export default async function HomePage() {

  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <Feed />;

}