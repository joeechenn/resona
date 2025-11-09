import { auth } from '@/auth';
import Navbar from '@/components/Navbar';
import AnalyticsSidebar from '@/components/dashboard/analytics/AnalyticsSidebar';
import StatsSidebar from '@/components/dashboard/stats/StatsSidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode; }) {
    const session = await auth();

  return (
    <div className="flex flex-col h-screen">
      <Navbar session={session} />
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-[300px_1fr_300px] gap-2 p-2 h-full">
          <AnalyticsSidebar />
          {children}
          <StatsSidebar />
        </div>
      </div>
    </div>
  );
}