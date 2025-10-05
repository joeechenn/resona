import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Dashboard from '@/components/Dashboard';

export default async function HomePage() {

const mockSession = {
  user: {
    id: 'fatbeagle_dev',
    name: 'Joe Chen',
    email: 'turtlesrlyfenlove@gmail.com',
    image: '/profile-placeholder.jpg'  
  },
  expires: '2025-12-31'
};
  
  return <Dashboard session={mockSession} />;
}