"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface DashboardNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();

  function navClass(href: string) {
    const active = pathname === href;
    return `text-sm font-medium transition-colors ${active ? "text-slate-900 border-b-2 border-slate-900 pb-0.5" : "text-slate-500 hover:text-slate-900"}`;
  }

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-xl font-bold text-slate-900"
            >
              DriveHub
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className={navClass("/dashboard")}>
                Dashboard
              </Link>
              <Link href="/dashboard/bookings" className={navClass("/dashboard/bookings")}>
                My Bookings
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
