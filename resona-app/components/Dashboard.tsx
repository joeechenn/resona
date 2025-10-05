import Navbar from './Navbar';
import { Session } from 'next-auth';

export default function Dashboard({ session }: { session: Session }) {
  return (
    <>
      <Navbar session={session} />
      <div className="container mx-auto px-6 py-8">
      </div>
    </>
  );
}