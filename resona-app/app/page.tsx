import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Dashboard from '@/components/Dashboard';

export default async function HomePage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  return <Dashboard session={session} />;
}