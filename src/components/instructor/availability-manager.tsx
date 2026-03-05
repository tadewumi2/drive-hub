"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, CalendarOff, Loader2 } from "lucide-react";

interface Rule {
  id: string;
  dayOfWeek: string;
  startHour: number;
  endHour: number;
}

interface Exception {
  id: string;
  date: string;
  isBlocked: boolean;
}

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

function formatHour(h: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:00 ${period}`;
}

export default function AvailabilityManager({
  instructorId,
  initialRules,
  initialExceptions,
}: {
  instructorId: string;
  initialRules: Rule[];
  initialExceptions: Exception[];
}) {
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [exceptions, setExceptions] = useState<Exception[]>(initialExceptions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New rule form
  const [newDay, setNewDay] = useState("MONDAY");
  const [newStartHour, setNewStartHour] = useState(9);
  const [newEndHour, setNewEndHour] = useState(17);

  // New exception form
  const [newBlockDate, setNewBlockDate] = useState("");

  async function addRule() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/instructor/availability/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId,
          dayOfWeek: newDay,
          startHour: newStartHour,
          endHour: newEndHour,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess("Availability added");
      router.refresh();
      setRules(data.rules);
    } catch {
      setError("Failed to add availability");
    } finally {
      setLoading(false);
    }
  }

  async function deleteRule(ruleId: string) {
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/instructor/availability/rules/${ruleId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }

      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      setSuccess("Slot removed");
    } catch {
      setError("Failed to remove slot");
    }
  }

  async function addException() {
    if (!newBlockDate) return;
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/instructor/availability/exceptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId,
          date: newBlockDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess("Date blocked");
      setNewBlockDate("");
      setExceptions(data.exceptions);
    } catch {
      setError("Failed to block date");
    } finally {
      setLoading(false);
    }
  }

  async function deleteException(exceptionId: string) {
    setError("");

    try {
      const res = await fetch(
        `/api/instructor/availability/exceptions/${exceptionId}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }

      setExceptions((prev) => prev.filter((e) => e.id !== exceptionId));
      setSuccess("Block removed");
    } catch {
      setError("Failed to remove block");
    }
  }

  // Group rules by day
  const rulesByDay = DAYS.map((day) => ({
    day,
    label: DAY_LABELS[day],
    slots: rules
      .filter((r) => r.dayOfWeek === day)
      .sort((a, b) => a.startHour - b.startHour),
  }));

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl p-4">
          {success}
        </div>
      )}

      {/* ── Weekly Schedule ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-5">
          Weekly Schedule
        </h2>

        {/* Add new slot */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3">
            Add availability slot
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={newDay}
              onChange={(e) => setNewDay(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {DAY_LABELS[d]}
                </option>
              ))}
            </select>

            <select
              value={newStartHour}
              onChange={(e) => setNewStartHour(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
            >
              {Array.from({ length: 15 }, (_, i) => i + 6).map((h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>

            <span className="self-center text-sm text-slate-400">to</span>

            <select
              value={newEndHour}
              onChange={(e) => setNewEndHour(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
            >
              {Array.from({ length: 15 }, (_, i) => i + 7).map((h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>

            <button
              onClick={addRule}
              disabled={loading}
              className="flex items-center gap-2 bg-[var(--navy)] text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-[var(--navy-light)] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add
            </button>
          </div>
        </div>

        {/* Current schedule */}
        <div className="space-y-4">
          {rulesByDay.map(({ day, label, slots }) => (
            <div
              key={day}
              className="border-b border-slate-100 pb-4 last:border-0"
            >
              <p className="text-sm font-semibold text-slate-700 mb-2">
                {label}
              </p>
              {slots.length === 0 ? (
                <p className="text-sm text-slate-400">No availability set</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-lg"
                    >
                      {formatHour(slot.startHour)} – {formatHour(slot.endHour)}
                      <button
                        onClick={() => deleteRule(slot.id)}
                        className="text-blue-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Blocked Dates ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-5">Blocked Dates</h2>

        {/* Add block */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3">
            Block a date
          </p>
          <div className="flex gap-3">
            <input
              type="date"
              value={newBlockDate}
              onChange={(e) => setNewBlockDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
            />
            <button
              onClick={addException}
              disabled={loading || !newBlockDate}
              className="flex items-center gap-2 bg-red-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <CalendarOff className="w-4 h-4" />
              Block Date
            </button>
          </div>
        </div>

        {/* Current blocks */}
        {exceptions.length === 0 ? (
          <p className="text-sm text-slate-400">No dates blocked</p>
        ) : (
          <div className="space-y-2">
            {exceptions.map((ex) => (
              <div
                key={ex.id}
                className="flex items-center justify-between bg-red-50 rounded-lg px-4 py-3"
              >
                <span className="text-sm font-medium text-red-700">
                  {new Date(ex.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <button
                  onClick={() => deleteException(ex.id)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
