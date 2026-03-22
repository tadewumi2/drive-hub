"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  bookingId: string;
  approvalDeadline: string | null;    // ISO string
  approvalExtendedAt: string | null;  // ISO string
  status: string;
}

const WINDOW_MS = 30 * 60 * 1000;

function getMsRemaining(
  deadline: string | null,
  extendedAt: string | null,
): number {
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

export default function ConfirmationActions({
  bookingId,
  approvalDeadline,
  approvalExtendedAt,
  status,
}: Props) {
  const router = useRouter();
  const [msLeft, setMsLeft] = useState(() =>
    getMsRemaining(approvalDeadline, approvalExtendedAt),
  );
  const [cancelling, setCancelling] = useState(false);
  const [extending, setExtending] = useState(false);
  const [error, setError] = useState("");

  const firstWindowExpired =
    approvalDeadline && Date.now() > new Date(approvalDeadline).getTime();
  const alreadyExtended = !!approvalExtendedAt;
  const canExtend = firstWindowExpired && !alreadyExtended && msLeft <= 0;

  useEffect(() => {
    if (status !== "PENDING_APPROVAL") return;
    const interval = setInterval(() => {
      const remaining = getMsRemaining(approvalDeadline, approvalExtendedAt);
      setMsLeft(remaining);
      if (remaining <= 0) {
        // Refresh server data to reflect auto-cancel
        router.refresh();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [approvalDeadline, approvalExtendedAt, status, router]);

  async function handleCancel() {
    setCancelling(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
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

  async function handleExtend() {
    setExtending(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/extend`, {
        method: "POST",
      });
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

  if (status === "CONFIRMED") {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
        <p className="text-sm text-green-700 font-medium">
          Your instructor has confirmed this booking. See you at your lesson!
        </p>
      </div>
    );
  }

  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
        <XCircle className="w-5 h-5 text-slate-400 shrink-0" />
        <p className="text-sm text-slate-500">
          This booking has been cancelled. Any payment has been refunded.
        </p>
      </div>
    );
  }

  if (status !== "PENDING_APPROVAL") return null;

  return (
    <div className="space-y-3">
      {/* Countdown */}
      <div
        className={`rounded-xl p-4 border ${
          msLeft > 5 * 60 * 1000
            ? "bg-amber-50 border-amber-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Clock
            className={`w-4 h-4 ${msLeft > 5 * 60 * 1000 ? "text-amber-600" : "text-red-500"}`}
          />
          <p
            className={`text-sm font-semibold ${
              msLeft > 5 * 60 * 1000 ? "text-amber-700" : "text-red-600"
            }`}
          >
            {msLeft > 0
              ? `Waiting for instructor approval — ${formatTime(msLeft)} remaining`
              : alreadyExtended
                ? "Extended time has expired"
                : "Approval window expired"}
          </p>
        </div>
        <p className="text-xs text-slate-500 ml-6">
          {alreadyExtended
            ? "This was your one extension. The booking will be auto-cancelled shortly."
            : "Your instructor has up to 30 minutes to approve your booking."}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {/* Extend button — only when first window expired and not yet extended */}
        {canExtend && (
          <button
            onClick={handleExtend}
            disabled={extending}
            className="flex-1 border-2 border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold-light)] font-semibold py-2.5 rounded-full text-sm transition-colors disabled:opacity-50"
          >
            {extending ? "Extending..." : "Give 30 More Minutes"}
          </button>
        )}

        {/* Cancel button */}
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="flex-1 border-2 border-red-300 text-red-500 hover:bg-red-50 font-semibold py-2.5 rounded-full text-sm transition-colors disabled:opacity-50"
        >
          {cancelling ? "Cancelling..." : "Cancel & Get Refund"}
        </button>
      </div>
    </div>
  );
}
