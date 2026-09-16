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
    <div className="flex h-dvh flex-col overflow-hidden">
      <Navbar session={session} />
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="dashboard-grid">
          <aside className="dashboard-analytics min-h-0">
            <AnalyticsSidebar />
          </aside>
          <main className="dashboard-main flex min-h-0 min-w-0 overflow-hidden">
            {children}
          </main>
          <aside className="dashboard-stats min-h-0 overflow-y-auto">
            <StatsSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
