"use client";

import Link from "next/link";
import { Session } from "next-auth";
import SearchBar from './SearchBar';

export default function Navbar({ session }: { session: Session | null }) {
  if (!session) return null;
  
  return (
    <nav className="bg-background shadow-md py-4 border-b border-gray-850">
      <div className="container mx-4 flex justify-between items-center px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-3">
          <span className="text-xl font-extrabold">Resona</span>  
        </Link>
        <SearchBar />
        <div className="flex items-center space-x-4">
          <Link href="/analytics" className="text-slate-900 hover:text-sky-500">
            <button className="flex items-center justify-center bg-white hover:bg-gray-300 text-black font-bold py-1 px-4 rounded-lg cursor-pointer">
              Analytics
            </button>
          </Link>
          <Link href="/discover" className="text-slate-900 hover:text-sky-500">
            <button className="flex items-center justify-center bg-transparent hover:bg-neutral-800 text-white border border-gray-700 py-1 px-4 rounded-lg cursor-pointer">
              Discover
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}