"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  Loader2,
  Filter,
  RotateCcw,
  Navigation,
  Building2,
} from "lucide-react";

interface Booking {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  instructorName: string;
  date: string;
  startHour: number;
  status: string;
  notes: string | null;
  pickupAddress: string | null;
  roadTestCenter: string | null;
  hourlyRate: number;
  paymentStatus: string | null;
  stripePaymentIntent: string | null;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT:  { label: "Awaiting Payment",  color: "bg-slate-100 text-slate-600"  },
  PENDING_APPROVAL: { label: "Needs Approval",    color: "bg-amber-100 text-amber-700"  },
  CONFIRMED:        { label: "Confirmed",          color: "bg-green-100 text-green-700"  },
  CANCELLED:        { label: "Cancelled",          color: "bg-slate-100 text-slate-500"  },
};

function formatHour(h: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:00 ${period}`;
}

export default function AdminBookingsList({
  bookings,
}: {
  bookings: Booking[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filtered =
    filter === "all"
      ? bookings
      : filter === "pending"
        ? bookings.filter((b) => b.status === "PENDING_APPROVAL")
        : bookings.filter((b) => b.status === filter.toUpperCase());

  async function handleCancel(bookingId: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Cancel failed");
        return;
      }
      router.refresh();
    } catch {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRefund(bookingId: string) {
    if (!confirm("Are you sure you want to refund this booking?")) return;

    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/refund`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Refund failed");
        return;
      }
      alert("Refund processed successfully");
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
          { key: "all",      label: "All"             },
          { key: "pending",  label: "Needs Approval"  },
          { key: "confirmed", label: "Confirmed"      },
          { key: "cancelled", label: "Cancelled"      },
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
            const st = statusConfig[b.status] ?? statusConfig.PENDING_APPROVAL;
            const dateStr = new Date(b.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-slate-200 p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${st.color}`}
                      >
                        {st.label}
                      </span>
                      {b.paymentStatus === "paid" && (
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                          Paid
                        </span>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs">Student</p>
                        <p className="font-medium text-slate-900">
                          {b.studentName}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {b.studentEmail}
                        </p>
                        {b.studentPhone && (
                          <p className="text-slate-400 text-xs">{b.studentPhone}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Instructor</p>
                        <p className="font-medium text-slate-900">
                          {b.instructorName}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Date & Time</p>
                        <p className="text-slate-700">
                          {dateStr} • {formatHour(b.startHour)} –{" "}
                          {formatHour(b.startHour + 1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Amount</p>
                        <p className="font-medium text-slate-900">
                          ${b.hourlyRate.toFixed(2)} CAD
                        </p>
                      </div>
                    </div>

                    {(b.pickupAddress || b.roadTestCenter) && (
                      <div className="mt-3 space-y-1">
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
                      <p className="text-sm text-slate-500 mt-3 bg-slate-50 rounded-lg p-3">
                        <span className="font-medium">Notes:</span> {b.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {b.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={actionLoading === b.id}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {actionLoading === b.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Ban className="w-3.5 h-3.5" />
                        )}
                        Cancel
                      </button>
                    )}

                    {b.status === "CONFIRMED" &&
                      b.paymentStatus === "paid" &&
                      b.stripePaymentIntent && (
                        <button
                          onClick={() => handleRefund(b.id)}
                          disabled={actionLoading === b.id}
                          className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Refund
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
