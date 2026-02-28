"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin,
  Car,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  ArrowLeft,
} from "lucide-react";

interface BookingDetails {
  instructorId: string;
  instructorName: string;
  instructorImage: string | null;
  location: string;
  carType: string;
  date: string;
  hour: number;
  hourFormatted: string;
  hourlyRate: number;
}

interface StudentInfo {
  name: string;
  email: string;
  phone: string;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face";

export default function BookingForm({
  booking,
  student,
}: {
  booking: BookingDetails;
  student: StudentInfo;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: student.name,
    email: student.email,
    phone: student.phone,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const dateObj = new Date(booking.date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    if (!formData.phone.trim()) errs.phone = "Phone number is required";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId: booking.instructorId,
          date: booking.date,
          startHour: booking.hour,
          notes: formData.notes,
          phone: formData.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Something went wrong");
        return;
      }

      router.push(`/booking/confirmation?id=${data.bookingId}`);
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Back link */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-[var(--navy)] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to instructor
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--navy)] mb-8">
          Confirm Your Booking
        </h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── Left: Form ── */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-[var(--navy)] mb-5">
                  Your Details
                </h2>

                {serverError && (
                  <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4">
                    {serverError}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--navy)] mb-1.5">
                      <User className="w-4 h-4 text-slate-400" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] bg-slate-50"
                      readOnly
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--navy)] mb-1.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] bg-slate-50"
                      readOnly
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--navy)] mb-1.5">
                      <Phone className="w-4 h-4 text-slate-400" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(416) 555-0100"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)]"
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--navy)] mb-1.5">
                      <FileText className="w-4 h-4 text-slate-400" />
                      Notes for Instructor
                      <span className="text-slate-400 font-normal">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any special requests or things you'd like to focus on..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-[var(--gold)] hover:bg-[var(--gold-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-full transition-colors shadow-lg shadow-amber-200/30 text-sm"
                >
                  {loading
                    ? "Processing..."
                    : `Confirm Booking — $${booking.hourlyRate}`}
                </button>
              </div>
            </form>
          </div>

          {/* ── Right: Booking Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-[var(--navy)] mb-5">
                Booking Summary
              </h2>

              {/* Instructor */}
              <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 shrink-0">
                  <Image
                    src={booking.instructorImage || PLACEHOLDER_IMAGE}
                    alt={booking.instructorName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-[var(--navy)]">
                    {booking.instructorName}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3 h-3" />
                    {booking.location}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="py-5 space-y-3 border-b border-slate-100">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600">
                    {booking.hourFormatted} (1 hour)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Car className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600">{booking.carType}</span>
                </div>
              </div>

              {/* Price */}
              <div className="pt-5">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Lesson (1 hour)</span>
                  <span>${booking.hourlyRate.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="font-bold text-[var(--navy)]">Total</span>
                  <span className="text-xl font-bold text-[var(--navy)]">
                    ${booking.hourlyRate.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
