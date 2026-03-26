"use client";

import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  studentName: string;
  createdAt: string;
}

interface Props {
  instructorId: string;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= rating ? "fill-[var(--gold)] text-[var(--gold)]" : "text-slate-200"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsList({ instructorId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/instructors/${instructorId}/reviews`)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews);
        setAvg(d.averageRating);
        setTotal(d.totalReviews);
      })
      .finally(() => setLoading(false));
  }, [instructorId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading reviews...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4">
        {avg !== null ? (
          <>
            <div className="text-4xl font-bold text-slate-900">{avg.toFixed(1)}</div>
            <div>
              <StarRow rating={Math.round(avg)} />
              <p className="text-sm text-slate-500 mt-1">{total} review{total !== 1 ? "s" : ""}</p>
            </div>
          </>
        ) : (
          <p className="text-slate-500 text-sm">No reviews yet — be the first!</p>
        )}
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-3 mt-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                    {r.studentName.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-slate-900">{r.studentName}</p>
                </div>
                <StarRow rating={r.rating} />
              </div>
              {r.comment && (
                <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
              )}
              <p className="text-xs text-slate-400 mt-2">
                {new Date(r.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
