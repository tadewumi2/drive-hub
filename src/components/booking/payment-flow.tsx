"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin,
  Car,
  Calendar,
  Clock,
  Upload,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  CreditCard,
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
  hasDocument: boolean;
  documentName: string | null;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face";

export default function PaymentFlow({ booking }: { booking: BookingData }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "success" | "error"
  >(booking.hasDocument ? "success" : "idle");
  const [uploadedFileName, setUploadedFileName] = useState(
    booking.documentName || "",
  );
  const [uploadError, setUploadError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadState("error");
      setUploadError("Invalid file type. Please upload a PDF, JPG, or PNG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadState("error");
      setUploadError("File is too large. Maximum size is 5MB.");
      return;
    }

    setUploadState("uploading");
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bookingId", booking.id);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadState("error");
        setUploadError(data.error);
        return;
      }

      setUploadState("success");
      setUploadedFileName(data.document.fileName);
    } catch {
      setUploadState("error");
      setUploadError("Upload failed. Please try again.");
    }
  }

  async function handlePayment() {
    if (uploadState !== "success") return;

    setPaymentLoading(true);
    setPaymentError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPaymentError(data.error);
        return;
      }

      // Redirect to Stripe
      window.location.href = data.url;
    } catch {
      setPaymentError("Something went wrong. Please try again.");
    } finally {
      setPaymentLoading(false);
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
          Upload your road test proof and pay to confirm your lesson
        </p>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── Left: Steps ── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Step 1: Upload */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    uploadState === "success"
                      ? "bg-green-100 text-green-600"
                      : "bg-[var(--gold-light)] text-[var(--gold)]"
                  }`}
                >
                  {uploadState === "success" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    "1"
                  )}
                </div>
                <h2 className="text-lg font-bold text-[var(--navy)]">
                  Upload Road Test Proof
                </h2>
              </div>

              <p className="text-sm text-slate-500 mb-4">
                Upload a copy of your scheduled road test booking. Accepted
                formats: PDF, JPG, PNG (max 5MB).
              </p>

              {/* Upload area */}
              {uploadState === "success" ? (
                <div className="border-2 border-green-200 bg-green-50 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-700">
                          File uploaded successfully
                        </p>
                        <p className="text-xs text-green-600 mt-0.5">
                          {uploadedFileName}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-green-600 hover:text-green-700 font-medium underline"
                    >
                      Replace
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    uploadState === "error"
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 hover:border-[var(--gold)] hover:bg-[var(--gold-light)]/30"
                  }`}
                >
                  {uploadState === "uploading" ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin mb-3" />
                      <p className="text-sm font-medium text-[var(--navy)]">
                        Uploading...
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-slate-400 mb-3" />
                      <p className="text-sm font-medium text-[var(--navy)]">
                        Click to upload your road test proof
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        PDF, JPG, or PNG — max 5MB
                      </p>
                    </div>
                  )}
                </div>
              )}

              {uploadState === "error" && (
                <div className="flex items-center gap-2 mt-3 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {uploadError}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Step 2: Payment */}
            <div
              className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 ${
                uploadState !== "success"
                  ? "opacity-50 pointer-events-none"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-[var(--gold-light)] text-[var(--gold)] flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h2 className="text-lg font-bold text-[var(--navy)]">
                  Secure Payment
                </h2>
              </div>

              <p className="text-sm text-slate-500 mb-5">
                You&apos;ll be redirected to Stripe for secure payment
                processing. Your card details are never stored on our servers.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Driving Lesson (1 hour)
                  </span>
                  <span className="font-medium text-[var(--navy)]">
                    ${booking.hourlyRate.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-slate-200">
                  <span className="font-bold text-[var(--navy)]">
                    Total (CAD)
                  </span>
                  <span className="text-lg font-bold text-[var(--navy)]">
                    ${booking.hourlyRate.toFixed(2)}
                  </span>
                </div>
              </div>

              {paymentError && (
                <div className="flex items-center gap-2 mb-4 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {paymentError}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={paymentLoading}
                className="w-full bg-[var(--gold)] hover:bg-[var(--gold-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-full transition-colors shadow-lg shadow-amber-200/30 flex items-center justify-center gap-2"
              >
                {paymentLoading ? (
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
              <h2 className="text-lg font-bold text-[var(--navy)] mb-5">
                Booking Summary
              </h2>

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

              <div className="py-5 space-y-3 border-b border-slate-100">
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

              {/* Steps progress */}
              <div className="pt-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      uploadState === "success"
                        ? "bg-green-100"
                        : "bg-slate-100"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        uploadState === "success"
                          ? "text-green-600"
                          : "text-slate-300"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm ${
                      uploadState === "success"
                        ? "text-green-600 font-medium"
                        : "text-slate-400"
                    }`}
                  >
                    Upload road test proof
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                  <span className="text-sm text-slate-400">
                    Complete payment
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
