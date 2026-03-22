"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin,
  Car,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CreditCard,
  Navigation,
  Building2,
} from "lucide-react";

interface BookingData {
  id: string;
  instructorName: string;
  instructorImage: string | null;
  location: string;
  carType: string;
  date: string;
  time: string;
  hourlyRate: number;
  pickupAddress: string | null;
  roadTestCenter: string | null;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face";

export default function PaymentFlow({ booking }: { booking: BookingData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <a
        href="/dashboard/bookings"
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-[var(--navy)] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to bookings
      </a>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--navy)] mb-2">
          Complete Your Booking
        </h1>
        <p className="text-slate-500 mb-8">
          Review your details and pay to send your booking request to the instructor.
        </p>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── Left: Payment ── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Booking details recap */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-[var(--navy)] mb-4">Lesson Details</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Navigation className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600">
                    <span className="font-medium text-slate-700">Pickup: </span>
                    {booking.pickupAddress || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600">
                    <span className="font-medium text-slate-700">Test Centre: </span>
                    {booking.roadTestCenter || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-[var(--gold-light)] text-[var(--gold)] flex items-center justify-center text-sm font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-[var(--navy)]">Secure Payment</h2>
              </div>

              <p className="text-sm text-slate-500 mb-5">
                You&apos;ll be redirected to Stripe for secure payment. Once paid, your
                instructor has <strong>30 minutes</strong> to approve the booking.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Driving Lesson (1 hour)</span>
                  <span className="font-medium text-[var(--navy)]">
                    ${booking.hourlyRate.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-slate-200">
                  <span className="font-bold text-[var(--navy)]">Total (CAD)</span>
                  <span className="text-lg font-bold text-[var(--navy)]">
                    ${booking.hourlyRate.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-700">
                <strong>Refund policy:</strong> Full refund if cancelled more than 24 hrs before
                your lesson. Within 24 hrs, 20% cancellation fee applies.
              </div>

              {error && (
                <div className="flex items-center gap-2 mb-4 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-[var(--gold)] hover:bg-[var(--gold-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-full transition-colors shadow-lg shadow-amber-200/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting to payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay ${booking.hourlyRate.toFixed(2)} CAD
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Right: Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-[var(--navy)] mb-5">Booking Summary</h2>

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
                  <p className="font-semibold text-[var(--navy)]">{booking.instructorName}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3 h-3" />
                    {booking.location}
                  </div>
                </div>
              </div>

              <div className="py-5 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600">{booking.date}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600">{booking.time}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Car className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600">{booking.carType}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
