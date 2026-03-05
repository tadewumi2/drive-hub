"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Car, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--blue-softer)] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
            <Car className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[var(--navy)] mb-2">
          Something went wrong
        </h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          An unexpected error occurred. Please try again or go back to the
          homepage.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 bg-[var(--navy)] text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm hover:bg-[var(--navy-light)]"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="border-2 border-[var(--navy)] text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white font-semibold px-6 py-3 rounded-full transition-all text-sm"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
