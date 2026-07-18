"use client";

import { useState } from "react";
import { Star, User } from "@/components/ui/icons";
import Link from "next/link";
import { api } from "@/lib/api-client";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

interface ReviewSectionProps {
  targetType: "PROPERTY" | "SERVICE_LISTING";
  targetId: string;
  initialReviews: Review[];
  avgRating: number | null;
  reviewCount: number;
  isAuthenticated: boolean;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${cls} ${
            star <= rating ? "fill-accent-300 text-accent-300" : "fill-none text-text-secondary"
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ReviewSection({
  targetType,
  targetId,
  initialReviews,
  avgRating: _avgRating,
  reviewCount: _reviewCount,
  isAuthenticated,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const computedAvg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  const distribution = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    distribution[r.rating - 1]++;
  });
  const maxCount = Math.max(...distribution, 1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: err } = await api.post<{ review: Review }>("/api/reviews", {
      targetType,
      targetId,
      rating,
      comment: comment || undefined,
    });

    if (err) {
      setError(err);
      setLoading(false);
      return;
    }

    if (data?.review) {
      setReviews((prev) => [data.review, ...prev]);
      setShowForm(false);
      setComment("");
      setRating(5);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Rating summary */}
      <div className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Star className="h-8 w-8 fill-accent-300 text-accent-300" />
            <span className="font-heading text-3xl font-bold text-text-primary">
              {computedAvg !== null ? computedAvg.toFixed(1) : "--"}
            </span>
          </div>
          <span className="text-sm text-text-secondary">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          {[5, 4, 3, 2, 1].map((level) => {
            const count = distribution[level - 1];
            const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <div key={level} className="flex items-center gap-2">
                <span className="w-3 text-right text-xs text-text-secondary">{level}</span>
                <Star className="h-3.5 w-3.5 fill-accent-300 text-accent-300" />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-secondary">
                  <div
                    className="h-full rounded-full bg-accent-300 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs text-text-secondary">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write review button */}
      {isAuthenticated ? (
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="touch-target inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
        >
          <Star className="h-4 w-4" />
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      ) : (
        <Link
          href="/auth/login"
          className="touch-target inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
        >
          <Star className="h-4 w-4" />
          Write a Review
        </Link>
      )}

      {/* Review form */}
      {showForm && isAuthenticated && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-surface p-5">
          <div>
            <p className="mb-2 text-sm font-medium text-text-primary">Your rating</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = hoverRating ? star <= hoverRating : star <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    className="touch-target flex items-center justify-center"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        active
                          ? "fill-accent-300 text-accent-300"
                          : "fill-none text-text-secondary"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience (optional)"
              className="w-full resize-none rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-1 focus:ring-accent-300"
            />
          </div>
          {error && (
            <p className="text-sm text-error-500">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="touch-target inline-flex items-center rounded-lg bg-accent-300 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {/* Review list */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-12 text-center">
            <User className="mb-3 h-10 w-10 text-text-secondary" />
            <p className="font-heading text-lg font-semibold text-text-primary">No reviews yet</p>
            <p className="mt-1 text-sm text-text-secondary">
              Be the first to share your experience.
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600">
                  {review.user.firstName[0]}
                  {review.user.lastName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-sm font-semibold text-text-primary">
                      {review.user.firstName} {review.user.lastName}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <StarRating rating={review.rating} />
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
