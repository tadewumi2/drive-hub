"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  User,
  MapPin,
  Car,
  FileText,
} from "lucide-react";

type DocType = "DRIVING_LICENSE" | "INSTRUCTOR_CERTIFICATE" | "VEHICLE_INSURANCE" | "PROFILE_PHOTO";

const DOC_LABELS: Record<DocType, string> = {
  DRIVING_LICENSE: "Driver's Licence",
  INSTRUCTOR_CERTIFICATE: "Instructor Certificate",
  VEHICLE_INSURANCE: "Vehicle Insurance",
  PROFILE_PHOTO: "Profile Photo",
};

interface DocumentInfo {
  type: string;
  fileName: string;
  uploadedAt: string;
  url?: string;
}

interface Props {
  profileId: string;
  instructor: {
    name: string;
    email: string;
    phone: string;
    location: string;
    carType: string;
    hourlyRate: number;
    joinedAt: string;
    verificationStatus: string;
    rejectionReason?: string | null;
  };
  documents: { type: string; fileName: string; uploadedAt: string }[];
}

export default function VerifyInstructorClient({ profileId, instructor, documents }: Props) {
  const router = useRouter();
  const [docs, setDocs] = useState<DocumentInfo[]>(documents);
  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);
  const [status, setStatus] = useState(instructor.verificationStatus);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function viewDocument(type: string) {
    setLoadingDoc(type);
    try {
      const res = await fetch(`/api/admin/instructors/${profileId}/documents`);
      if (!res.ok) throw new Error("Failed to load documents");
      const data: DocumentInfo[] = await res.json();
      setDocs(data);
      const doc = data.find((d) => d.type === type);
      if (doc?.url) window.open(doc.url, "_blank");
    } catch {
      setError("Could not load document. Try again.");
    } finally {
      setLoadingDoc(null);
    }
  }

  async function handleApprove() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/instructors/${profileId}/approve`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to approve");
      setStatus("APPROVED");
      router.refresh();
    } catch {
      setError("Failed to approve. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/instructors/${profileId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      setStatus("REJECTED");
      setRejecting(false);
      router.refresh();
    } catch {
      setError("Failed to reject. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const statusBadge = () => {
    const map: Record<string, { label: string; className: string }> = {
      UNVERIFIED: { label: "Unverified", className: "bg-slate-100 text-slate-600" },
      PENDING_REVIEW: { label: "Pending Review", className: "bg-amber-100 text-amber-700" },
      APPROVED: { label: "Approved", className: "bg-green-100 text-green-700" },
      REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700" },
    };
    const s = map[status] ?? map.UNVERIFIED;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${s.className}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Instructor Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{instructor.name}</p>
              <p className="text-sm text-slate-500">{instructor.email}</p>
            </div>
          </div>
          {statusBadge()}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400" />
            {instructor.location}
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Car className="w-4 h-4 text-slate-400" />
            {instructor.carType}
          </div>
          <div className="text-slate-600">
            <span className="text-slate-400">Rate:</span> ${instructor.hourlyRate}/hr
          </div>
          <div className="text-slate-600">
            <span className="text-slate-400">Joined:</span>{" "}
            {new Date(instructor.joinedAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Submitted Documents</h2>

        {documents.length === 0 ? (
          <p className="text-slate-500 text-sm">No documents submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const docWithUrl = docs.find((d) => d.type === doc.type);
              return (
                <div
                  key={doc.type}
                  className="flex items-center justify-between p-3 border border-slate-100 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {DOC_LABELS[doc.type as DocType] ?? doc.type}
                      </p>
                      <p className="text-xs text-slate-500">{doc.fileName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => viewDocument(doc.type)}
                    disabled={loadingDoc === doc.type}
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                  >
                    {loadingDoc === doc.type ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                    View
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      {status === "PENDING_REVIEW" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Decision</h2>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
          )}

          {rejecting ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Rejection reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain what needs to be corrected..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Rejection
                </button>
                <button
                  onClick={() => { setRejecting(false); setRejectReason(""); setError(""); }}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Approve
              </button>
              <button
                onClick={() => setRejecting(true)}
                className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-100"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}
        </div>
      )}

      {status === "APPROVED" && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">This instructor has been approved and is live on the platform.</p>
        </div>
      )}

      {status === "REJECTED" && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Application rejected</p>
            {instructor.rejectionReason && (
              <p className="text-sm text-red-700 mt-1">{instructor.rejectionReason}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
