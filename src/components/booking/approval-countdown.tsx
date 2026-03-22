"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertTriangle } from "lucide-react";

const WINDOW_MS = 30 * 60 * 1000;

function getMsRemaining(deadline: string | null, extendedAt: string | null): number {
  if (!deadline) return 0;
  if (extendedAt) {
    return new Date(extendedAt).getTime() + WINDOW_MS - Date.now();
  }
  return new Date(deadline).getTime() - Date.now();
}

function formatTime(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

interface Props {
  bookingId: string;
  approvalDeadline: string | null;
  approvalExtendedAt: string | null;
}

export default function ApprovalCountdown({ bookingId, approvalDeadline, approvalExtendedAt }: Props) {
  const router = useRouter();
  const [msLeft, setMsLeft] = useState(() => getMsRemaining(approvalDeadline, approvalExtendedAt));
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getMsRemaining(approvalDeadline, approvalExtendedAt);
      setMsLeft(remaining);
      if (remaining <= 0) router.refresh();
    }, 1000);
    return () => clearInterval(interval);
  }, [approvalDeadline, approvalExtendedAt, router]);

  async function handleCancel() {
    setCancelling(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
      if (res.ok) {
        router.push("/instructors");
      } else {
        const d = await res.json();
        setError(d.error || "Failed to cancel");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setCancelling(false);
    }
  }

  const urgent = msLeft <= 5 * 60 * 1000;
  const isSecondWindow = !!approvalExtendedAt;
  const canCancel = isSecondWindow || msLeft <= 0;

  return (
    <div className="mt-3 space-y-2">
      <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${
        urgent ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
      }`}>
        <Clock className="w-3.5 h-3.5 shrink-0" />
        {msLeft > 0
          ? isSecondWindow
            ? `Final window — ${formatTime(msLeft)} remaining`
            : `Waiting for instructor — ${formatTime(msLeft)} remaining`
          : "Booking expired — booking will be auto-cancelled shortly"}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}

      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="w-full text-xs font-semibold border border-slate-300 text-slate-600 hover:bg-slate-50 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {cancelling ? "Cancelling..." : "Choose Another Instructor"}
        </button>
      )}
    </div>
  );
}
