import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Navbar from '@/components/Navbar';
import AnalyticsSidebar from '@/components/dashboard/analytics/AnalyticsSidebar';
import StatsSidebar from '@/components/dashboard/stats/StatsSidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode; }) {
    const session = await auth();

    // signed-in users who haven't completed onboarding get sent through it first
    if (session?.user?.id && !session.user.hasCompletedOnboarding) {
        redirect('/onboarding');
    }

  return (
    <div className="flex flex-col h-screen">
      <Navbar session={session} />
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-[300px_1fr_300px] gap-4 p-4 h-full">
          <AnalyticsSidebar />
          {children}
          <StatsSidebar />
        </div>
      </div>
    </div>
  );
}