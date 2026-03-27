"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Filter, Navigation, Building2 } from "lucide-react";

interface Booking {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  date: string;
  startHour: number;
  status: string;
  notes: string | null;
  pickupAddress: string | null;
  roadTestCenter: string | null;
  approvalDeadline: string | null;
  approvalExtendedAt: string | null;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT:  { label: "Awaiting Payment",  color: "bg-slate-100 text-slate-500"   },
  PENDING_APPROVAL: { label: "Needs Approval",    color: "bg-amber-100 text-amber-700"   },
  CONFIRMED:        { label: "Confirmed",          color: "bg-green-100 text-green-700"   },
  CANCELLED:        { label: "Cancelled",          color: "bg-slate-100 text-slate-500"   },
};

function formatHour(h: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:00 ${period}`;
}

function getMsLeft(deadline: string | null): number {
  if (!deadline) return 0;
  return new Date(deadline).getTime() - Date.now();
}

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "Expired";
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}m ${sec}s left`;
}

export default function InstructorBookingsList({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [, setTick] = useState(0);
  // rejectingId = bookingId currently showing the reason input; null = none open
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Re-render every second so timeLeft and button visibility stay in sync
  useEffect(() => {
    const hasPending = bookings.some((b) => b.status === "PENDING_APPROVAL");
    if (!hasPending) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [bookings]);

  const filtered =
    filter === "all"
      ? bookings
      : filter === "pending"
        ? bookings.filter((b) => b.status === "PENDING_APPROVAL")
        : bookings.filter((b) => b.status === filter.toUpperCase());

  async function handleApprove(bookingId: string) {
    setActionLoading(bookingId + ":approve");
    try {
      const res = await fetch(`/api/instructor/bookings/${bookingId}/approve`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Approval failed");
        return;
      }
      router.refresh();
    } catch {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(bookingId: string) {
    setActionLoading(bookingId + ":reject");
    try {
      const res = await fetch(`/api/instructor/bookings/${bookingId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Rejection failed");
        return;
      }
      setRejectingId(null);
      setRejectReason("");
      router.refresh();
    } catch {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400" />
        {[
          { key: "all",      label: "All"           },
          { key: "pending",  label: "Needs Approval" },
          { key: "confirmed", label: "Confirmed"     },
          { key: "cancelled", label: "Cancelled"     },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-sm px-4 py-1.5 rounded-full transition-colors ${
              filter === f.key
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500 mb-4">
        {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const dateStr = new Date(b.date).toLocaleDateString("en-US", {
              weekday: "short", month: "short", day: "numeric", year: "numeric",
            });

            const msLeft = b.status === "PENDING_APPROVAL" ? getMsLeft(b.approvalDeadline) : 1;
            const isExpired = msLeft <= 0;
            const timeLabel = isExpired ? "Expired" : formatTimeLeft(msLeft);

            // Single badge: red "Expired" or amber "Needs Approval" with countdown
            const badge = isExpired
              ? { label: "Expired", color: "bg-red-100 text-red-600" }
              : (statusConfig[b.status] ?? statusConfig.PENDING_APPROVAL);

            return (
              <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{b.studentName}</h3>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                      {b.status === "PENDING_APPROVAL" && !isExpired && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-600">
                          ⏱ {timeLabel}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-500">
                      {dateStr} • {formatHour(b.startHour)} – {formatHour(b.startHour + 1)}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      {b.studentEmail} • {b.studentPhone || "No phone"}
                    </p>

                    {(b.pickupAddress || b.roadTestCenter) && (
                      <div className="mt-2 space-y-1">
                        {b.pickupAddress && (
                          <p className="text-sm text-slate-600 flex items-center gap-1.5">
                            <Navigation className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span><span className="font-medium">Pickup:</span> {b.pickupAddress}</span>
                          </p>
                        )}
                        {b.roadTestCenter && (
                          <p className="text-sm text-slate-600 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span><span className="font-medium">Test Centre:</span> {b.roadTestCenter}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {b.notes && (
                      <p className="text-sm text-slate-500 mt-2 bg-slate-50 rounded-lg p-3">
                        <span className="font-medium">Notes:</span> {b.notes}
                      </p>
                    )}
                  </div>

                  {/* Approve / Reject actions — hidden once timer has expired */}
                  {b.status === "PENDING_APPROVAL" && !isExpired && (
                    <div className="shrink-0 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(b.id)}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {actionLoading === b.id + ":approve" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(rejectingId === b.id ? null : b.id);
                            setRejectReason("");
                          }}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Decline
                        </button>
                      </div>

                      {/* Inline rejection reason */}
                      {rejectingId === b.id && (
                        <div className="flex flex-col gap-2 mt-1">
                          <textarea
                            rows={2}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for declining (optional)"
                            className="w-full text-sm px-3 py-2 border border-red-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-200"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReject(b.id)}
                              disabled={!!actionLoading}
                              className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {actionLoading === b.id + ":reject" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : null}
                              Confirm Decline
                            </button>
                            <button
                              onClick={() => { setRejectingId(null); setRejectReason(""); }}
                              className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
