"use client";

import { useState, useMemo } from "react";
import { ClipboardList, Search } from "lucide-react";

interface AuditEntry {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  USER_SIGNED_UP:           { label: "Signed Up",            color: "bg-blue-100 text-blue-700" },
  BOOKING_CREATED:          { label: "Booking Created",      color: "bg-amber-100 text-amber-700" },
  BOOKING_CANCELLED:        { label: "Booking Cancelled",    color: "bg-red-100 text-red-700" },
  BOOKING_APPROVED:         { label: "Booking Approved",     color: "bg-green-100 text-green-700" },
  BOOKING_REJECTED:         { label: "Booking Rejected",     color: "bg-red-100 text-red-700" },
  CHECKOUT_INITIATED:       { label: "Checkout Started",     color: "bg-purple-100 text-purple-700" },
  PAYMENT_COMPLETED:        { label: "Payment Completed",    color: "bg-green-100 text-green-700" },
  ADMIN_BOOKING_CANCELLED:  { label: "Admin Cancelled",      color: "bg-orange-100 text-orange-700" },
  ADMIN_REFUND_ISSUED:      { label: "Refund Issued",        color: "bg-orange-100 text-orange-700" },
  ADMIN_IMPERSONATED_USER:  { label: "Impersonated User",    color: "bg-purple-100 text-purple-700" },
  ADMIN_IMPERSONATION_EXITED: { label: "Exited Impersonation", color: "bg-slate-100 text-slate-600" },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-CA", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function parseDetails(raw: string | null): string {
  if (!raw) return "—";
  try {
    const obj = JSON.parse(raw);
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");
  } catch {
    return raw;
  }
}

export default function AuditLogClient({ logs }: { logs: AuditEntry[] }) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch =
        !search ||
        l.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase());
      const matchesAction = actionFilter === "ALL" || l.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [logs, search, actionFilter]);

  const uniqueActions = [...new Set(logs.map((l) => l.action))].sort();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6" />
          Audit Log
        </h1>
        <p className="text-slate-500 text-sm mt-1">Last 200 events across all users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by email or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Actions</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a]?.label ?? a}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Time</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">User</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Action</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Details</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No events found
                  </td>
                </tr>
              )}
              {filtered.map((log) => {
                const cfg = ACTION_LABELS[log.action] ?? { label: log.action, color: "bg-slate-100 text-slate-600" };
                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatTime(log.createdAt)}</td>
                    <td className="px-4 py-3 text-slate-700">{log.userEmail ?? <span className="text-slate-400">system</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{parseDetails(log.details)}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{log.ipAddress ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
