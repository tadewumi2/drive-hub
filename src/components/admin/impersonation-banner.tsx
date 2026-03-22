"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";

interface Props {
  impersonatedName: string;
  impersonatedEmail: string;
}

export default function ImpersonationBanner({ impersonatedName, impersonatedEmail }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleExit() {
    setLoading(true);
    const res = await fetch("/api/admin/impersonate/exit", { method: "POST" });
    const data = await res.json();
    if (data.redirect) {
      router.push(data.redirect);
      router.refresh();
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-purple-700 text-white px-6 py-3 flex items-center justify-between gap-4 shadow-lg">
      <div className="flex items-center gap-2 text-sm">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>
          Viewing as <strong>{impersonatedName}</strong>
          <span className="text-purple-200 ml-1">({impersonatedEmail})</span>
        </span>
      </div>
      <button
        onClick={handleExit}
        disabled={loading}
        className="text-xs font-semibold bg-white text-purple-700 hover:bg-purple-50 px-4 py-1.5 rounded-full transition-colors disabled:opacity-50 shrink-0"
      >
        {loading ? "Exiting..." : "Exit Impersonation"}
      </button>
    </div>
  );
}
