"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  bookingId: string;
  instructorName: string;
}

export default function LeaveReview({ bookingId, instructorName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (!rating) { setError("Please select a rating."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, rating, comment }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to submit");
      }
      setDone(true);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-green-700 font-medium mt-2">
        <Star className="w-4 h-4 fill-green-600 text-green-600" />
        Review submitted — thank you!
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 text-sm font-medium text-[var(--gold)] hover:underline"
      >
        Leave a review
      </button>
    );
  }

  return (
    <div className="mt-3 bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <p className="text-sm font-medium text-slate-900">Rate your lesson with {instructorName}</p>

      {/* Stars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(s)}
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                s <= (hover || rating)
                  ? "fill-[var(--gold)] text-[var(--gold)]"
                  : "text-slate-300"
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-sm text-slate-500 ml-2 self-center">
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </span>
        )}
      </div>

      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={600}
        placeholder="Share your experience (optional)..."
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-300"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-1.5 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit Review
        </button>
        <button
          onClick={() => { setOpen(false); setRating(0); setComment(""); setError(""); }}
          className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
