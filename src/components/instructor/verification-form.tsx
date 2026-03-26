"use client";

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  Upload,
  FileText,
  AlertCircle,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";

interface DocumentState {
  uploaded: boolean;
  fileName?: string;
  uploading: boolean;
  error?: string;
}

type DocType = "DRIVING_LICENSE" | "INSTRUCTOR_CERTIFICATE" | "VEHICLE_INSURANCE" | "PROFILE_PHOTO";

interface DocConfig {
  type: DocType;
  label: string;
  description: string;
  accept: string;
}

const DOCS: DocConfig[] = [
  {
    type: "DRIVING_LICENSE",
    label: "Driver's Licence",
    description: "Front and back — JPG, PNG, or PDF, max 5 MB",
    accept: "image/jpeg,image/png,image/webp,application/pdf",
  },
  {
    type: "INSTRUCTOR_CERTIFICATE",
    label: "Instructor Certificate",
    description: "Province-issued certificate — JPG, PNG, or PDF, max 5 MB",
    accept: "image/jpeg,image/png,image/webp,application/pdf",
  },
  {
    type: "VEHICLE_INSURANCE",
    label: "Vehicle Insurance",
    description: "Must cover commercial/instructional use — JPG, PNG, or PDF, max 5 MB",
    accept: "image/jpeg,image/png,image/webp,application/pdf",
  },
  {
    type: "PROFILE_PHOTO",
    label: "Profile Photo",
    description: "Clear headshot — JPG, PNG, or WebP, max 5 MB",
    accept: "image/jpeg,image/png,image/webp",
  },
];

interface Props {
  initialStatus: string;
  initialDocs: { type: string; fileName: string }[];
  rejectionReason?: string | null;
}

export default function VerificationForm({ initialStatus, initialDocs, rejectionReason }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [docs, setDocs] = useState<Record<DocType, DocumentState>>(() => {
    const init = {} as Record<DocType, DocumentState>;
    for (const d of DOCS) {
      const existing = initialDocs.find((x) => x.type === d.type);
      init[d.type] = {
        uploaded: !!existing,
        fileName: existing?.fileName,
        uploading: false,
      };
    }
    return init;
  });

  const fileRefs = useRef<Record<DocType, HTMLInputElement | null>>({} as Record<DocType, HTMLInputElement | null>);

  const allUploaded = DOCS.every((d) => docs[d.type].uploaded);

  async function handleFileChange(type: DocType, file: File) {
    setDocs((prev) => ({ ...prev, [type]: { ...prev[type], uploading: true, error: undefined } }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", type.toLowerCase());

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || "Upload failed");
      }
      const { key, fileName } = await uploadRes.json();

      const saveRes = await fetch("/api/instructor/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, fileKey: key, fileName }),
      });
      if (!saveRes.ok) {
        const err = await saveRes.json();
        throw new Error(err.error || "Failed to save document");
      }

      const { allUploaded: nowAll } = await saveRes.json();
      setDocs((prev) => ({ ...prev, [type]: { uploaded: true, fileName, uploading: false } }));
      if (nowAll) setStatus("PENDING_REVIEW");
    } catch (err) {
      setDocs((prev) => ({
        ...prev,
        [type]: { ...prev[type], uploading: false, error: (err as Error).message },
      }));
    }
  }

  const statusBanner = () => {
    if (status === "APPROVED") {
      return (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Account Approved</p>
            <p className="text-sm text-green-700">Your account is verified and you are live on the platform.</p>
          </div>
        </div>
      );
    }
    if (status === "PENDING_REVIEW") {
      return (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">Under Review</p>
            <p className="text-sm text-amber-700">Your documents have been submitted and are being reviewed. We'll email you once a decision is made.</p>
          </div>
        </div>
      );
    }
    if (status === "REJECTED") {
      return (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Application Not Approved</p>
            {rejectionReason && (
              <p className="text-sm text-red-700 mt-1"><strong>Reason:</strong> {rejectionReason}</p>
            )}
            <p className="text-sm text-red-700 mt-1">Please re-upload the relevant documents and they will be reviewed again.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
        <div>
          <p className="font-semibold text-blue-800">Verification Required</p>
          <p className="text-sm text-blue-700">Upload all four documents below to submit your account for review. Your profile will go live once approved.</p>
        </div>
      </div>
    );
  };

  const isLocked = status === "PENDING_REVIEW" || status === "APPROVED";

  return (
    <div>
      {statusBanner()}

      <div className="grid gap-4">
        {DOCS.map((doc) => {
          const state = docs[doc.type];
          return (
            <div
              key={doc.type}
              className={`border rounded-xl p-4 transition-colors ${
                state.uploaded
                  ? "border-green-200 bg-green-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${state.uploaded ? "bg-green-100" : "bg-slate-100"}`}>
                    {state.uploaded ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <FileText className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{doc.label}</p>
                    <p className="text-xs text-slate-500">{doc.description}</p>
                    {state.fileName && (
                      <p className="text-xs text-green-700 mt-0.5">✓ {state.fileName}</p>
                    )}
                    {state.error && (
                      <p className="text-xs text-red-600 mt-0.5">{state.error}</p>
                    )}
                  </div>
                </div>

                {!isLocked && (
                  <div>
                    <input
                      type="file"
                      accept={doc.accept}
                      className="hidden"
                      ref={(el) => { fileRefs.current[doc.type] = el; }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileChange(doc.type, file);
                        e.target.value = "";
                      }}
                    />
                    <button
                      onClick={() => fileRefs.current[doc.type]?.click()}
                      disabled={state.uploading}
                      className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {state.uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {state.uploaded ? "Replace" : "Upload"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!isLocked && allUploaded && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <p className="text-sm text-amber-800 font-medium">All documents uploaded — submitted for review automatically.</p>
        </div>
      )}
    </div>
  );
}
