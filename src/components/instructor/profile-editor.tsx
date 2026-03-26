"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, User, MapPin, Car, DollarSign } from "lucide-react";
import Image from "next/image";

interface Props {
  initial: {
    name: string;
    email: string;
    bio: string;
    carType: string;
    location: string;
    hourlyRate: number;
    image: string | null;
  };
}

export default function InstructorProfileEditor({ initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial.name,
    bio: initial.bio,
    carType: initial.carType,
    location: initial.location,
    hourlyRate: initial.hourlyRate.toString(),
  });
  const [preview, setPreview] = useState<string | null>(initial.image);
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function set(field: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function handlePhotoChange(file: File) {
    setUploadingPhoto(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "profile_photo");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      const { key } = await res.json();
      setPhotoKey(key);
      setPreview(URL.createObjectURL(file));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!form.carType.trim() || !form.location.trim() || !form.hourlyRate) {
      setError("Car type, location and hourly rate are required.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/instructor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
          carType: form.carType,
          location: form.location,
          hourlyRate: Number(form.hourlyRate),
          photoKey: photoKey || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setSuccess("Profile updated successfully.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          {success}
        </div>
      )}

      {/* Profile Photo */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-100 shrink-0">
            {preview ? (
              <Image src={preview} alt="Profile" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-slate-400" />
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              ref={fileRef}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePhotoChange(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploadingPhoto ? "Uploading..." : "Change Photo"}
            </button>
            <p className="text-xs text-slate-400 mt-1.5">JPG, PNG or WebP — max 5 MB</p>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Personal Info</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
            <input
              type="email"
              value={initial.email}
              disabled
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">
            About You <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            maxLength={500}
            placeholder="Tell students about your experience and teaching style..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <p className="text-xs text-slate-400 text-right mt-0.5">{form.bio.length}/500</p>
        </div>
      </div>

      {/* Teaching Details */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Teaching Details</h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Location *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Car Type *</label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.carType}
                onChange={(e) => set("carType", e.target.value)}
                required
                placeholder="e.g. Toyota Corolla 2022"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Hourly Rate (CAD) *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                min="1"
                step="0.01"
                value={form.hourlyRate}
                onChange={(e) => set("hourlyRate", e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || uploadingPhoto}
          className="flex items-center gap-2 bg-slate-900 text-white font-semibold px-8 py-2.5 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
