"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import SearchBar from './SearchBar';
import { Settings } from 'lucide-react';

export default function Navbar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return name[0];
  };

  return (
    <nav className="flex-none border-b border-border bg-background py-3 2xl:py-4" aria-label="Main navigation">
      <div className="flex min-w-0 flex-wrap items-center gap-3 px-4 lg:gap-4 lg:px-6 2xl:px-8">
        <Link href="/" className="flex shrink-0 items-center space-x-3">
          <span className="text-xl font-extrabold">Resona</span>  
        </Link>
        
        <div className="order-last flex min-w-0 basis-full justify-center sm:order-none sm:flex-1 sm:basis-0 sm:px-2 lg:px-4 2xl:px-8">
          <SearchBar />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-4 2xl:gap-5">
          <Link
            href="/analytics"
            aria-current={pathname === '/analytics' ? 'page' : undefined}
            className="py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:underline aria-[current=page]:underline-offset-8"
          >
            Analytics
          </Link>
          <Link
            href="/discover"
            aria-current={pathname === '/discover' ? 'page' : undefined}
            className="py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:underline aria-[current=page]:underline-offset-8"
          >
            Discover
          </Link>
          <div ref={settingsRef} className="relative">
            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className="text-muted-foreground hover:text-white cursor-pointer transition-colors"
              aria-label="Open settings menu"
              aria-expanded={isSettingsOpen}
            >
              <Settings className="w-5 h-5" />
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 top-full mt-3 w-52 overflow-hidden rounded-2xl border border-border bg-background py-2 shadow-2xl backdrop-blur-md z-50">
                <Link
                  href="https://joeechenn.github.io/resona/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsSettingsOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-white hover:bg-card transition-colors"
                >
                  What&apos;s Resona
                </Link>
                <div className="mx-3 my-1 h-px bg-muted" />
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm font-medium text-white hover:bg-card transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
          
          <Link href={`/profile/${session.user.id}`} className="shrink-0">
          {session.user.image ? (
            <img 
              src={session.user.image} 
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-ring"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground text-sm font-semibold cursor-pointer hover:ring-2 hover:ring-ring">
              {getInitials(session.user.name)}
            </div>
          )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
