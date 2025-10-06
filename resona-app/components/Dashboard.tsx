import Navbar from './Navbar';
import { Session } from 'next-auth';
import AnalyticsSidebar from './dashboard/analytics/AnalyticsSidebar';
import Feed from './dashboard/feed/Feed';
import StatsSidebar from './dashboard/stats/StatsSidebar';

export default function Dashboard({ session }: { session: Session }) {
  return (
    <div className="flex flex-col h-screen">
      <Navbar session={session} />
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-[300px_1fr_350px] gap-6 px-4 py-2 h-full">
          <AnalyticsSidebar />
          <Feed />
          <StatsSidebar />
        </div>
      </div>
    </div>
  );
}