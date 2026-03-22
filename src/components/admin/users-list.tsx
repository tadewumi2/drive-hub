"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Shield, GraduationCap, UserCheck } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  createdAt: string;
}

const roleConfig: Record<string, { label: string; className: string }> = {
  STUDENT: { label: "Student", className: "bg-blue-100 text-blue-700" },
  INSTRUCTOR: { label: "Instructor", className: "bg-green-100 text-green-700" },
  ADMIN: { label: "Admin", className: "bg-orange-100 text-orange-700" },
  SUPER_ADMIN: { label: "Super Admin", className: "bg-purple-100 text-purple-700" },
};

export default function AdminUsersClient({ users }: { users: User[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  async function handleImpersonate(userId: string) {
    setLoadingId(userId);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.redirect) {
        router.push(data.redirect);
        router.refresh();
      } else {
        alert(data.error ?? "Failed to impersonate");
      }
    } finally {
      setLoadingId(null);
    }
  }

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6" />
          All Users
        </h1>
        <p className="text-slate-500 text-sm mt-1">{users.length} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Roles</option>
          <option value="STUDENT">Students</option>
          <option value="INSTRUCTOR">Instructors</option>
          <option value="ADMIN">Admins</option>
          <option value="SUPER_ADMIN">Super Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Phone</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Joined</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No users found
                  </td>
                </tr>
              )}
              {filtered.map((user) => {
                const cfg = roleConfig[user.role] ?? { label: user.role, className: "bg-slate-100 text-slate-600" };
                const isSuperAdmin = user.role === "SUPER_ADMIN";
                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3 text-slate-600">{user.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                        {user.role === "SUPER_ADMIN" && <Shield className="w-3 h-3" />}
                        {user.role === "INSTRUCTOR" && <GraduationCap className="w-3 h-3" />}
                        {user.role === "ADMIN" && <UserCheck className="w-3 h-3" />}
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString("en-CA")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!isSuperAdmin && (
                        <button
                          onClick={() => handleImpersonate(user.id)}
                          disabled={loadingId === user.id}
                          className="text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {loadingId === user.id ? "Loading..." : "Impersonate"}
                        </button>
                      )}
                    </td>
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
