"use client";

import Link from "next/link";
import { Session } from "next-auth";
import SearchBar from './SearchBar';
import { Bell, Settings } from 'lucide-react';

export default function Navbar({ session }: { session: Session | null }) {
  if (!session) return null;
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return name[0];
  };

    if (!session?.user) {
    return null;
  }

  return (
    <nav className="bg-background shadow-md py-4 border-b border-gray-850">
      <div className="flex items-center px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-3">
          <span className="text-xl font-extrabold">Resona</span>  
        </Link>
        
        <div className="flex-1 flex justify-center px-8">
            <SearchBar />
            </div>

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
          <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          <Settings className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          
          {session.user.image ? (
            <img 
              src={session.user.image} 
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-sky-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold cursor-pointer hover:ring-2 hover:ring-sky-500">
              {getInitials(session.user.name)}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}