"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Filter,
} from "lucide-react";

interface Booking {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  date: string;
  startHour: number;
  status: string;
  notes: string | null;
  hasDocument: boolean;
  documentId: string | null;
  documentName: string | null;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING_UPLOAD: {
    label: "Awaiting Upload",
    color: "bg-slate-100 text-slate-600",
  },
  PENDING_VERIFICATION: {
    label: "Needs Review",
    color: "bg-amber-100 text-amber-700",
  },
  APPROVED: {
    label: "Approved",
    color: "bg-emerald-100 text-emerald-700",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-green-100 text-green-700",
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-100 text-red-700",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-slate-100 text-slate-500",
  },
};

function formatHour(h: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:00 ${period}`;
}

export default function InstructorBookingsList({
  bookings,
}: {
  bookings: Booking[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);
  const [docUrl, setDocUrl] = useState<string | null>(null);

  const filtered =
    filter === "all"
      ? bookings
      : filter === "pending"
        ? bookings.filter((b) => b.status === "PENDING_VERIFICATION")
        : bookings.filter((b) => b.status === filter.toUpperCase());

  async function handleAction(bookingId: string, action: "approve" | "reject") {
    setActionLoading(bookingId);

    try {
      const res = await fetch(
        `/api/instructor/bookings/${bookingId}/${action}`,
        {
          method: "POST",
        },
      );

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Action failed");
        return;
      }

      router.refresh();
    } catch {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleViewDocument(documentId: string) {
    setViewingDoc(documentId);

    try {
      const res = await fetch(`/api/documents/${documentId}`);
      const data = await res.json();

      if (res.ok && data.url) {
        window.open(data.url, "_blank");
      } else {
        alert("Failed to load document");
      }
    } catch {
      alert("Failed to load document");
    } finally {
      setViewingDoc(null);
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400" />
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Needs Review" },
          { key: "approved", label: "Approved" },
          { key: "confirmed", label: "Confirmed" },
          { key: "rejected", label: "Rejected" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-sm px-4 py-1.5 rounded-full transition-colors ${
              filter === f.key
                ? "bg-[var(--navy)] text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results */}
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
            const status =
              statusConfig[b.status] || statusConfig.PENDING_UPLOAD;
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
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">
                        {b.studentName}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {dateStr} • {formatHour(b.startHour)} –{" "}
                      {formatHour(b.startHour + 1)}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      {b.studentEmail} • {b.studentPhone || "No phone"}
                    </p>
                    {b.notes && (
                      <p className="text-sm text-slate-500 mt-2 bg-slate-50 rounded-lg p-3">
                        <span className="font-medium">Notes:</span> {b.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* View document */}
                    {b.hasDocument && b.documentId && (
                      <button
                        onClick={() => handleViewDocument(b.documentId!)}
                        disabled={viewingDoc === b.documentId}
                        className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
                      >
                        {viewingDoc === b.documentId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        View Proof
                      </button>
                    )}

                    {/* Approve / Reject */}
                    {b.status === "PENDING_VERIFICATION" && (
                      <>
                        <button
                          onClick={() => handleAction(b.id, "approve")}
                          disabled={actionLoading === b.id}
                          className="flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {actionLoading === b.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(b.id, "reject")}
                          disabled={actionLoading === b.id}
                          className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
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
