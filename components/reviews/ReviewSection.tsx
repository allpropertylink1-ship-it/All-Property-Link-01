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

/** Deterministic avatar tint per reviewer so repeat reviewers feel consistent. */
const AVATAR_TINTS = [
  "bg-primary-100 text-primary-700",
  "bg-accent-300/20 text-accent-600",
  "bg-primary-50 text-primary-600",
];
function tintFor(name: string): string {
  let h = 5381;
  for (let i = 0; i < name.length; i++) h = ((h << 5) + h + name.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[h % AVATAR_TINTS.length];
}

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= value ? "fill-accent-300 text-accent-300" : "fill-none text-text-secondary/40"
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
    // Scroll form into view for long lists
    requestAnimationFrame(() => document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth", block: "center" }));
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
      const updated = data.review;
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id !== editingId) return r;
          return { ...updated };
        })
      );
      setMeta((m) => ({ ...m, sum: m.sum - (reviews.find((r) => r.id === editingId)?.rating ?? 0) + updated.rating }));
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
    <div className="space-y-7">
      {/* ── Rating summary ── */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:gap-10">
          <div className="flex flex-row items-center gap-5 sm:flex-col sm:items-center sm:gap-2">
            <p className="font-heading text-6xl font-bold leading-none tracking-tight text-text-primary tabular-nums">
              {displayAvg !== null ? displayAvg.toFixed(1) : "--"}
            </p>
            <div className="flex flex-col items-start gap-1.5 sm:items-center">
              <Stars value={Math.round(displayAvg ?? 0)} size="h-4.5 w-4.5" />
              <span className="text-sm text-text-secondary">
                {meta.total} {meta.total === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-2 sm:border-l sm:border-border sm:pl-10">
            {[5, 4, 3, 2, 1].map((level) => {
              const count = distribution[level - 1];
              const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={level} className="flex items-center gap-3">
                  <span className="w-3 text-right text-xs font-medium tabular-nums text-text-secondary">{level}</span>
                  <Star className="h-3 w-3 shrink-0 fill-accent-300 text-accent-300" />
                  <div
                    className="h-2.5 flex-1 overflow-hidden rounded-full bg-primary-50"
                    role="meter"
                    aria-label={`${level} star ratings`}
                    aria-valuenow={count}
                    aria-valuemin={0}
                    aria-valuemax={meta.total}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-300 to-accent-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs tabular-nums text-text-secondary">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Viewer-state action area ── */}
      {!authLoading && (
        <>
          {isCustomer && !myExistingReview && !showForm && (
            <button
              onClick={startCreate}
              className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              <Star className="h-4 w-4 fill-accent-200 text-accent-200" />
              Write a Review
            </button>
          )}
          {isCustomer && myExistingReview && !showForm && (
            <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-sm text-text-secondary">
              You reviewed this seller already — you can edit or delete it below.
            </p>
          )}
          {!user && (
            <Link
              href={signupUrl}
              className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md"
            >
              <Star className="h-4 w-4 fill-accent-200 text-accent-200" />
              Leave a Review
            </Link>
          )}
          {isSeller && (
            <p className="text-sm text-text-secondary">Reviews are left by customers.</p>
          )}
        </>
      )}

      {/* ── Create / Edit form ── */}
      {showForm && isCustomer && (
        <form
          id="review-form"
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_3px_rgba(21,47,41,0.06)]"
        >
          <div>
            <p className="mb-2.5 text-sm font-semibold text-text-primary">Your rating</p>
            <div
              role="radiogroup"
              aria-label="Your rating"
              className="flex items-center gap-1.5"
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
                    className="touch-target -m-1 flex items-center justify-center p-1 transition-transform hover:scale-110"
                    onMouseEnter={() => setHoverRating(star)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        active ? "fill-accent-300 text-accent-300" : "fill-none text-text-secondary/40"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label htmlFor="review-comment" className="mb-1.5 block text-sm font-semibold text-text-primary">
              Your review <span className="font-normal text-text-secondary">(optional)</span>
            </label>
            <textarea
              id="review-comment"
              rows={4}
              maxLength={COMMENT_MAX}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`What was your experience like? Minimum ${COMMENT_MIN} characters.`}
              className="w-full resize-none rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm leading-relaxed text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-1 focus:ring-accent-300"
            />
            <p
              className={`mt-1 text-right text-xs tabular-nums ${
                comment.length >= COMMENT_MAX ? "text-error-600" : "text-text-secondary"
              }`}
            >
              {comment.length}/{COMMENT_MAX}
            </p>
          </div>
          {formError && <FormBanner variant="error">{formError}</FormBanner>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="touch-target inline-flex items-center rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* ── Review list ── */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
              <User className="h-7 w-7 text-primary-500" />
            </div>
            <p className="font-heading text-lg font-semibold text-text-primary">No reviews yet</p>
            <p className="mt-1 max-w-xs text-sm text-text-secondary">
              {emptyMessage || "Customer reviews will appear here after the first one is posted."}
            </p>
          </div>
        ) : (
          reviews.map((review) => {
            const isOwn = user?.id === review.userId;
            const edited =
              review.updatedAt && new Date(review.updatedAt) > new Date(review.createdAt);
            const reviewerName = formatReviewerName(review.user.firstName, review.user.lastName);
            return (
              <article
                key={review.id}
                className={`group rounded-xl border bg-surface p-5 transition-colors sm:p-6 ${
                  isOwn ? "border-accent-300/60" : "border-border hover:shadow-[0_2px_8px_rgba(21,47,41,0.07)]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${tintFor(reviewerName)}`}
                      aria-hidden
                    >
                      {(review.user.firstName?.[0] || "?").toUpperCase()}
                      {(review.user.lastName?.[0] || "").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                        <span className="truncate text-sm font-semibold text-text-primary">{reviewerName}</span>
                        {isOwn && (
                          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-700">
                            You
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {formatDate(review.createdAt)}
                        {edited && <span className="ml-1.5 italic">(edited)</span>}
                      </p>
                    </div>
                  </div>
                  <Stars value={review.rating} />
                </div>

                {review.comment && (
                  <p className="mt-4 whitespace-pre-line break-words text-sm leading-relaxed text-text-secondary [overflow-wrap:anywhere]">
                    {review.comment}
                  </p>
                )}

                {isOwn && (
                  <div className="mt-4 flex items-center gap-2.5 border-t border-border pt-4">
                    <button
                      onClick={() => startEdit(review)}
                      className="inline-flex items-center rounded-lg border border-border px-3.5 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={deleting}
                      aria-busy={deleting && confirmDeleteId === review.id}
                      className={`inline-flex items-center rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        confirmDeleteId === review.id
                          ? "border-error-300 bg-error-50 text-error-700"
                          : "border-border text-text-secondary hover:bg-surface-secondary"
                      } disabled:opacity-50`}
                    >
                      {confirmDeleteId === review.id ? "Click again to confirm" : "Delete"}
                    </button>
                  </div>
                )}
              </article>
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
            className="touch-target inline-flex items-center rounded-lg border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-secondary disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load more reviews"}
          </button>
        </div>
      )}
    </div>
  );
}
