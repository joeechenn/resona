import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import LoginPage from '@/components/LoginPage';

export default async function Login() {
  const session = await auth();
  
  if (session) {
    redirect('/');
  }
  
  return <LoginPage />;
}