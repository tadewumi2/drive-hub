"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  defaultEmail?: string;
}

const SUBJECTS = [
  { value: "booking",    label: "Booking issue" },
  { value: "payment",    label: "Payment / refund" },
  { value: "instructor", label: "Instructor issue" },
  { value: "account",    label: "Account help" },
  { value: "other",      label: "General enquiry" },
];

export default function ContactForm({ defaultEmail = "" }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: defaultEmail,
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim() || form.name.length < 2) errs.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email address.";
    if (!form.subject) errs.subject = "Please choose a topic.";
    if (!form.message.trim() || form.message.length < 10)
      errs.message = "Message must be at least 10 characters.";
    if (form.message.length > 2000) errs.message = "Message is too long (max 2000 characters).";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setErrors({ _global: data.error ?? "Something went wrong. Please try again." });
        return;
      }
      setSent(true);
    } catch {
      setErrors({ _global: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center py-10 gap-4">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
        <h3 className="text-lg font-bold text-slate-900">Message sent!</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          We&apos;ve received your message and sent a confirmation to{" "}
          <span className="font-medium text-slate-700">{form.email}</span>.
          Expect a reply within 1 business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {errors._global && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {errors._global}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Full name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Jane Smith"
            className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] transition-colors ${
              errors.name ? "border-red-300 bg-red-50" : "border-slate-200"
            }`}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Email address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jane@example.com"
            className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] transition-colors ${
              errors.email ? "border-red-300 bg-red-50" : "border-slate-200"
            }`}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Topic <span className="text-red-400">*</span>
        </label>
        <select
          value={form.subject}
          onChange={(e) => set("subject", e.target.value)}
          className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] transition-colors ${
            errors.subject ? "border-red-300 bg-red-50" : "border-slate-200"
          }`}
        >
          <option value="">Select a topic…</option>
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          rows={5}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Describe your issue or question in detail…"
          className={`w-full px-4 py-2.5 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] transition-colors ${
            errors.message ? "border-red-300 bg-red-50" : "border-slate-200"
          }`}
        />
        <div className="flex items-start justify-between mt-1">
          {errors.message ? (
            <p className="text-xs text-red-500">{errors.message}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-slate-400 ml-auto">{form.message.length}/2000</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[var(--gold)] hover:bg-[var(--gold-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-full transition-colors shadow-md shadow-amber-200/30 text-sm flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Sending…" : "Send Message"}
      </button>

      <p className="text-xs text-slate-400 text-center">
        We respond within 1 business day · Mon–Fri, 9 AM–6 PM ET
      </p>
    </form>
  );
}
