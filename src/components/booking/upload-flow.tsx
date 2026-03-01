"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
  status: string;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face";

export default function UploadFlow({ booking }: { booking: BookingData }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "success" | "error"
  >(booking.hasDocument ? "success" : "idle");
  const [uploadedFileName, setUploadedFileName] = useState(
    booking.documentName || "",
  );
  const [uploadError, setUploadError] = useState("");

  const isAlreadySubmitted = booking.status === "PENDING_VERIFICATION";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

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

  async function handleSubmit() {
    if (uploadState !== "success") return;

    try {
      const res = await fetch(`/api/bookings/${booking.id}/submit`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        setUploadError(data.error || "Failed to submit booking");
        return;
      }

      router.push(`/booking/confirmation?id=${booking.id}`);
    } catch {
      setUploadError("Something went wrong. Please try again.");
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
          Upload Road Test Proof
        </h1>
        <p className="text-slate-500 mb-8">
          Upload your scheduled road test booking so the instructor can verify
          it
        </p>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── Left: Upload ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-[var(--navy)] mb-4">
                Road Test Proof
              </h2>

              <p className="text-sm text-slate-500 mb-5">
                Upload a copy of your scheduled road test booking confirmation.
                Accepted formats: PDF, JPG, PNG (max 5MB).
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
                    {!isAlreadySubmitted && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-green-600 hover:text-green-700 font-medium underline"
                      >
                        Replace
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                    uploadState === "error"
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 hover:border-[var(--gold)] hover:bg-[var(--gold-light)]/30"
                  }`}
                >
                  {uploadState === "uploading" ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-10 h-10 text-[var(--gold)] animate-spin mb-3" />
                      <p className="text-sm font-medium text-[var(--navy)]">
                        Uploading your file...
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-10 h-10 text-slate-300 mb-3" />
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

              {/* Submit button */}
              {!isAlreadySubmitted && (
                <button
                  onClick={handleSubmit}
                  disabled={uploadState !== "success"}
                  className="w-full mt-6 bg-[var(--gold)] hover:bg-[var(--gold-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-full transition-colors shadow-lg shadow-amber-200/30 text-sm"
                >
                  Submit for Verification
                </button>
              )}

              {isAlreadySubmitted && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-700">
                      Booking submitted for verification
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Your instructor will review your road test proof.
                      You&apos;ll be notified once it&apos;s approved and you
                      can proceed to payment.
                    </p>
                  </div>
                </div>
              )}
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

              <div className="pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Lesson (1 hour)
                  </span>
                  <span className="text-sm text-slate-600">
                    ${booking.hourlyRate.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="font-bold text-[var(--navy)]">Total</span>
                  <span className="text-lg font-bold text-[var(--navy)]">
                    ${booking.hourlyRate.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Flow status */}
              <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Booking Progress
                </p>
                {[
                  {
                    label: "Upload road test proof",
                    done: uploadState === "success",
                  },
                  {
                    label: "Instructor verification",
                    done: isAlreadySubmitted,
                  },
                  { label: "Payment", done: false },
                  { label: "Confirmed", done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        step.done ? "bg-green-100" : "bg-slate-100"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          step.done ? "text-green-600" : "text-slate-300"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm ${
                        step.done
                          ? "text-green-600 font-medium"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
