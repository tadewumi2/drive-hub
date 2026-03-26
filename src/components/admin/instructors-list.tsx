"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Trash2,
  Plus,
  X,
  Loader2,
  MapPin,
  Car,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

interface Instructor {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  carType: string;
  location: string;
  hourlyRate: number;
  isActive: boolean;
  totalBookings: number;
  verificationStatus: string;
}

const verificationBadge: Record<string, { label: string; className: string }> = {
  UNVERIFIED: { label: "Unverified", className: "bg-slate-100 text-slate-500" },
  PENDING_REVIEW: { label: "Pending Review", className: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700" },
};

export default function AdminInstructorsList({
  instructors,
}: {
  instructors: Instructor[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    carType: "",
    location: "",
    hourlyRate: "",
    password: "",
  });

  function resetForm() {
    setForm({
      name: "",
      email: "",
      phone: "",
      bio: "",
      carType: "",
      location: "",
      hourlyRate: "",
      password: "",
    });
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startEdit(inst: Instructor) {
    setForm({
      name: inst.name,
      email: inst.email,
      phone: inst.phone,
      bio: inst.bio,
      carType: inst.carType,
      location: inst.location,
      hourlyRate: inst.hourlyRate.toString(),
      password: "",
    });
    setEditingId(inst.id);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = editingId
      ? `/api/admin/instructors/${editingId}`
      : "/api/admin/instructors";

    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          hourlyRate: parseFloat(form.hourlyRate),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      resetForm();
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(instructorId: string) {
    if (!confirm("Are you sure you want to remove this instructor?")) return;

    try {
      const res = await fetch(`/api/admin/instructors/${instructorId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete");
        return;
      }

      router.refresh();
    } catch {
      alert("Something went wrong");
    }
  }

  async function toggleActive(instructorId: string, isActive: boolean) {
    try {
      await fetch(`/api/admin/instructors/${instructorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggleActive: !isActive }),
      });
      router.refresh();
    } catch {
      alert("Failed to update status");
    }
  }

  return (
    <div>
      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="mb-6 flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Instructor
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              {editingId ? "Edit Instructor" : "Add New Instructor"}
            </h2>
            <button
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  required
                  disabled={!!editingId}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Phone
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>
              {!editingId && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    required={!editingId}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Car Type *
                </label>
                <input
                  type="text"
                  value={form.carType}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, carType: e.target.value }))
                  }
                  required
                  placeholder="e.g. Toyota Corolla 2023"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Location *
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                  required
                  placeholder="e.g. Downtown Toronto"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Hourly Rate ($) *
                </label>
                <input
                  type="number"
                  value={form.hourlyRate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, hourlyRate: e.target.value }))
                  }
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bio: e.target.value }))
                }
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? "Save Changes" : "Add Instructor"}
            </button>
          </form>
        </div>
      )}

      {/* Instructor List */}
      <div className="space-y-4">
        {instructors.map((inst) => (
          <div
            key={inst.id}
            className={`bg-white rounded-xl border border-slate-200 p-5 ${
              !inst.isActive ? "opacity-60" : ""
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-semibold text-slate-900">{inst.name}</h3>
                  {!inst.isActive && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}
                  {(() => {
                    const badge = verificationBadge[inst.verificationStatus] ?? verificationBadge.UNVERIFIED;
                    return (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-sm text-slate-500">{inst.email}</p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {inst.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Car className="w-3.5 h-3.5" /> {inst.carType}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> ${inst.hourlyRate}/hr
                  </span>
                  <span>{inst.totalBookings} bookings</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {inst.verificationStatus === "PENDING_REVIEW" && (
                  <Link
                    href={`/admin/instructors/${inst.id}/verify`}
                    className="flex items-center gap-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Review
                  </Link>
                )}
                <button
                  onClick={() => toggleActive(inst.id, inst.isActive)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    inst.isActive
                      ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  {inst.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => startEdit(inst)}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(inst.id)}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
