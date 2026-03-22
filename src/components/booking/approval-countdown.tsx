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
  const [extending, setExtending] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const firstWindowExpired = approvalDeadline && Date.now() > new Date(approvalDeadline).getTime();
  const alreadyExtended = !!approvalExtendedAt;
  const canExtend = firstWindowExpired && !alreadyExtended && msLeft <= 0;

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getMsRemaining(approvalDeadline, approvalExtendedAt);
      setMsLeft(remaining);
      if (remaining <= 0) router.refresh();
    }, 1000);
    return () => clearInterval(interval);
  }, [approvalDeadline, approvalExtendedAt, router]);

  async function handleExtend() {
    setExtending(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/extend`, { method: "POST" });
      if (res.ok) {
        router.refresh();
      } else {
        const d = await res.json();
        setError(d.error || "Failed to extend");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setExtending(false);
    }
  }

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

  return (
    <div className="mt-3 space-y-2">
      <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${
        urgent ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
      }`}>
        <Clock className="w-3.5 h-3.5 shrink-0" />
        {msLeft > 0
          ? `Waiting for instructor — ${formatTime(msLeft)} remaining`
          : alreadyExtended
            ? "Extended time expired — booking will be cancelled"
            : "Time expired — extend or choose another instructor"}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}

      {msLeft <= 0 && (
        <div className="flex gap-2">
          {canExtend && (
            <button
              onClick={handleExtend}
              disabled={extending}
              className="flex-1 text-xs font-semibold border border-amber-400 text-amber-700 hover:bg-amber-50 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {extending ? "Extending..." : "Wait 30 More Mins"}
            </button>
          )}
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex-1 text-xs font-semibold border border-slate-300 text-slate-600 hover:bg-slate-50 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "Choose Another Instructor"}
          </button>
        </div>
      )}
    </div>
  );
}
