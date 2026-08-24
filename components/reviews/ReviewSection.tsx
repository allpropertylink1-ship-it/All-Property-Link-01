"use client";

import { useMemo, useState } from "react";
import { Star, User } from "@/components/ui/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { FormBanner } from "@/components/shared/FormFeedback";
import { formatReviewerName } from "@/lib/utils";

export interface ReviewItem {
  id: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date | null;
  user: { firstName: string; lastName: string };
}

interface ReviewSectionProps {
  targetId: string;
  initialSummary: { avgRating: number | null; total: number; distribution: number[] };
  initialReviews: ReviewItem[];
  initialTotalPages?: number;
  emptyMessage?: string;
}

const COMMENT_MAX = 1000;
const COMMENT_MIN = 10;

function Stars({ value, className = "h-4 w-4" }: { value: number; className?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${className} ${
            star <= value ? "fill-accent-300 text-accent-300" : "fill-none text-text-secondary"
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
}

export function ReviewSection({
  targetId,
  initialSummary,
  initialReviews,
  initialTotalPages = 1,
  emptyMessage,
}: ReviewSectionProps) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();

  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loadingMore, setLoadingMore] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Running aggregate kept accurate through local mutations without refetching.
  const [meta, setMeta] = useState(() => ({
    total: initialSummary.total,
    sum: initialSummary.avgRating != null ? Math.round(initialSummary.avgRating * initialSummary.total) : 0,
  }));
  const distribution = initialSummary.distribution;

  const isCustomer =
    !!user &&
    (user.primaryUserType === "CUSTOMER" || (user.userTypes ?? []).includes("CUSTOMER"));
  const isSeller = !!user && !isCustomer;
  const signupUrl = `/auth?type=customer&return=${encodeURIComponent(pathname)}`;

  function startCreate() {
    setEditingId(null);
    setRating(5);
    setComment("");
    setFormError("");
    setShowForm(true);
  }

  function startEdit(review: ReviewItem) {
    setEditingId(review.id);
    setRating(review.rating);
    setComment(review.comment || "");
    setFormError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = comment.trim();
    if (trimmed.length > 0 && trimmed.length < COMMENT_MIN) {
      setFormError(`Review must be at least ${COMMENT_MIN} characters.`);
      return;
    }
    setSubmitting(true);
    setFormError("");

    if (editingId) {
      const { data, error } = await api.patch<{ review: ReviewItem }>(`/api/reviews/${editingId}`, {
        rating,
        comment: trimmed || undefined,
      });
      if (error || !data?.review) {
        setFormError(error || "Could not update your review.");
        setSubmitting(false);
        return;
      }
      setReviews((prev) => prev.map((r) => (r.id === editingId ? data.review : r)));
      setMeta((m) => ({ ...m }));
    } else {
      const { data, error } = await api.post<{ review: ReviewItem }>("/api/reviews", {
        targetType: "USER",
        targetId,
        rating,
        comment: trimmed || undefined,
      });
      if (error || !data?.review) {
        setFormError(error || "Could not submit your review.");
        setSubmitting(false);
        return;
      }
      setReviews((prev) => [data.review, ...prev]);
      setMeta((m) => ({ total: m.total + 1, sum: m.sum + rating }));
    }

    setShowForm(false);
    setEditingId(null);
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setDeleting(true);
    const target = reviews.find((r) => r.id === id);
    const { error } = await api.delete(`/api/reviews/${id}`);
    setDeleting(false);
    setConfirmDeleteId(null);
    if (error) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));
    if (target) setMeta((m) => ({ total: m.total - 1, sum: m.sum - target.rating }));
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/reviews/user/${encodeURIComponent(targetId)}?page=${page + 1}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) => [...prev, ...(data.reviews || [])]);
        setPage((p) => p + 1);
        setTotalPages(data.totalPages ?? totalPages);
      }
    } finally {
      setLoadingMore(false);
    }
  }

  const displayAvg = meta.total > 0 ? meta.sum / meta.total : null;
  const maxCount = Math.max(...distribution, 1);
  const myExistingReview = useMemo(
    () => (user ? reviews.find((r) => r.userId === user.id) : undefined),
    [reviews, user]
  );

  return (
    <div className="space-y-6">
      {/* Rating summary */}
      <div className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Star className="h-8 w-8 fill-accent-300 text-accent-300" />
            <span className="font-heading text-3xl font-bold text-text-primary">
              {displayAvg !== null ? displayAvg.toFixed(1) : "--"}
            </span>
          </div>
          <span className="text-sm text-text-secondary">
            {meta.total} {meta.total === 1 ? "review" : "reviews"}
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
                  <div className="h-full rounded-full bg-accent-300 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-right text-xs text-text-secondary">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Viewer-state action area */}
      {!authLoading && (
        <>
          {isCustomer && !myExistingReview && !showForm && (
            <button
              onClick={startCreate}
              className="touch-target inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
            >
              <Star className="h-4 w-4" />
              Write a Review
            </button>
          )}
          {isCustomer && myExistingReview && !showForm && (
            <p className="text-sm text-text-secondary">
              You reviewed this seller already — you can edit or delete it below.
            </p>
          )}
          {!user && (
            <Link
              href={signupUrl}
              className="touch-target inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
            >
              <Star className="h-4 w-4" />
              Leave a Review
            </Link>
          )}
          {isSeller && (
            <p className="text-sm text-text-secondary">Reviews are left by customers.</p>
          )}
        </>
      )}

      {/* Create / Edit form */}
      {showForm && isCustomer && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-surface p-5">
          <div>
            <p className="mb-2 text-sm font-medium text-text-primary">Your rating</p>
            <div
              role="radiogroup"
              aria-label="Your rating"
              className="flex items-center gap-1"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const active = hoverRating ? star <= hoverRating : star <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={rating === star}
                    aria-label={`Rate ${star} out of 5 stars`}
                    className="touch-target flex items-center justify-center"
                    onMouseEnter={() => setHoverRating(star)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        active ? "fill-accent-300 text-accent-300" : "fill-none text-text-secondary"
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
              maxLength={COMMENT_MAX}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Share your experience (optional, min ${COMMENT_MIN} characters)`}
              aria-label="Your review"
              className="w-full resize-none rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-1 focus:ring-accent-300"
            />
            <p className={`mt-1 text-right text-xs ${comment.length >= COMMENT_MAX ? "text-error-600" : "text-text-secondary"}`}>
              {comment.length}/{COMMENT_MAX}
            </p>
          </div>
          {formError && <FormBanner variant="error">{formError}</FormBanner>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="touch-target inline-flex items-center rounded-lg bg-accent-300 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Saving..." : editingId ? "Update Review" : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="touch-target inline-flex items-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Review list */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-12 text-center">
            <User className="mb-3 h-10 w-10 text-text-secondary" />
            <p className="font-heading text-lg font-semibold text-text-primary">No reviews yet</p>
            <p className="mt-1 text-sm text-text-secondary">
              {emptyMessage || "Be the first to share your experience."}
            </p>
          </div>
        ) : (
          reviews.map((review) => {
            const isOwn = user?.id === review.userId;
            const edited =
              review.updatedAt && new Date(review.updatedAt) > new Date(review.createdAt);
            return (
              <div key={review.id} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600">
                    {(review.user.firstName?.[0] || "?").toUpperCase()}
                    {(review.user.lastName?.[0] || "").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-sm font-semibold text-text-primary">
                        {formatReviewerName(review.user.firstName, review.user.lastName)}
                      </span>
                      <span className="text-xs text-text-secondary">{formatDate(review.createdAt)}</span>
                      {edited && <span className="text-xs italic text-text-secondary">(edited)</span>}
                      {isOwn && (
                        <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700">
                          Your review
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <Stars value={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                        {review.comment}
                      </p>
                    )}
                    {isOwn && (
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          onClick={() => startEdit(review)}
                          className="text-xs font-medium text-primary-600 underline-offset-2 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          disabled={deleting}
                          aria-busy={deleting && confirmDeleteId === review.id}
                          className="text-xs font-medium text-error-600 underline-offset-2 hover:underline disabled:opacity-50"
                        >
                          {confirmDeleteId === review.id ? "Click again to confirm delete" : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load more */}
      {reviews.length > 0 && page < totalPages && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            aria-busy={loadingMore}
            className="touch-target inline-flex items-center rounded-lg border border-border bg-surface px-6 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load more reviews"}
          </button>
        </div>
      )}
    </div>
  );
}
