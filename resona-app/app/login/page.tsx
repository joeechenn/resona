import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import LoginPage from '@/components/LoginPage';
import { getLoginCovers } from '@/lib/loginCovers';

export default async function Login() {
  const session = await auth();
  
  if (session) {
    redirect('/');
  }
  
  const covers = await getLoginCovers();

  return <LoginPage covers={covers} />;
}