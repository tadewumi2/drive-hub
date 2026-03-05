import Link from "next/link";
import { Car } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--blue-softer)] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[var(--gold)] rounded-2xl flex items-center justify-center">
            <Car className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-[var(--navy)] mb-2">404</h1>
        <p className="text-xl text-slate-600 mb-2">Page not found</p>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-md shadow-amber-200/30 text-sm"
          >
            Go Home
          </Link>
          <Link
            href="/instructors"
            className="border-2 border-[var(--navy)] text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white font-semibold px-6 py-3 rounded-full transition-all text-sm"
          >
            Browse Instructors
          </Link>
        </div>
      </div>
    </div>
  );
}
