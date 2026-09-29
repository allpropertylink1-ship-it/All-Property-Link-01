"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircle, Pencil, Star, Trash2 } from "@/components/ui/icons";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { FormBanner } from "@/components/shared/FormFeedback";
import { ResponseBlock, DeletedOriginalNotice, Stars, formatThreadDate } from "@/components/reviews/review-thread";
import type { ThreadReview } from "@/components/reviews/review-thread";
import { formatReviewerName } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

type TabId = "received" | "written";

interface ReceivedPayload {
  reviews: ThreadReview[];
  total: number;
  page: number;
  totalPages: number;
  pendingCount: number;
}

interface WrittenReview extends ThreadReview {
  targetType?: string;
  targetId?: string;
  targetName?: string;
}

interface WrittenPayload {
  reviews: WrittenReview[];
  total: number;
  page: number;
  totalPages: number;
}

const RESPONSE_MAX = 1000;
const COMMENT_MAX = 1000;
const COMMENT_MIN = 10;

const AVATAR_TINTS = [
  "bg-primary-100 text-primary-700",
  "bg-accent-500/20 text-accent-600",
  "bg-primary-50 text-primary-600",
];
function tintFor(name: string): string {
  let h = 5381;
  for (let i = 0; i < name.length; i++) h = ((h << 5) + h + name.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[h % AVATAR_TINTS.length];
}

export default function ReviewsPage() {
  const { user, loading: authLoading } = useAuth();

  const isCustomer = useMemo(
    () =>
      !!user &&
      (user.primaryUserType === "CUSTOMER" ||
        (!user.primaryUserType && (!user.userTypes || user.userTypes.length === 0))),
    [user]
  );
  const [tab, setTab] = useState<TabId>("received");
  const [tabSettled, setTabSettled] = useState(false);

  const [received, setReceived] = useState<ThreadReview[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [written, setWritten] = useState<WrittenReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Response composer (received tab)
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responseError, setResponseError] = useState("");
  const [savingResponse, setSavingResponse] = useState(false);

  // Written-review editor
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  // Customers land on their written reviews; sellers land on received.
  useEffect(() => {
    if (!authLoading && !tabSettled) {
      if (isCustomer) setTab("written");
      setTabSettled(true);
    }
  }, [authLoading, isCustomer, tabSettled]);

  const fetchInbox = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const [rec, wrt] = await Promise.all([
        api.get<ReceivedPayload>("/api/reviews/inbox/received"),
        api.get<WrittenPayload>("/api/reviews/inbox/written"),
      ]);
      if (rec.error && wrt.error) {
        setFetchError(rec.error || "Could not load your reviews.");
        return;
      }
      setReceived(rec.data?.reviews || []);
      setPendingCount(rec.data?.pendingCount || 0);
      setWritten(wrt.data?.reviews || []);
    } catch {
      setFetchError("Could not load your reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) fetchInbox();
  }, [authLoading, fetchInbox]);

  function startRespond(review: ThreadReview, existing?: string) {
    setRespondingId(review.id);
    setEditingResponseId(existing ? review.id : null);
    setResponseText(existing || "");
    setResponseError("");
  }

  function cancelRespond() {
    setRespondingId(null);
    setEditingResponseId(null);
    setResponseText("");
    setResponseError("");
  }

  async function submitResponse(e: React.FormEvent, reviewId: string) {
    e.preventDefault();
    const trimmed = responseText.trim();
    if (trimmed.length < 2) {
      setResponseError("Response must be at least 2 characters.");
      return;
    }
    setSavingResponse(true);
    setResponseError("");
    const isEdit = editingResponseId === reviewId;
    const { data, error } = isEdit
      ? await api.patch<{ response: ThreadReview["response"] }>(`/api/reviews/${reviewId}/response`, { comment: trimmed })
      : await api.post<{ response: ThreadReview["response"] }>(`/api/reviews/${reviewId}/response`, { comment: trimmed });
    setSavingResponse(false);
    if (error || !data?.response) {
      setResponseError(error || "Could not save your response.");
      return;
    }
    const saved = data.response;
    setReceived((prev) => prev.map((r) => (r.id === reviewId ? { ...r, response: saved } : r)));
    setPendingCount((c) => (isEdit ? c : Math.max(0, c - 1)));
    cancelRespond();
  }

  async function deleteResponse(reviewId: string) {
    const key = `resp:${reviewId}`;
    if (confirmDelete !== key) {
      setConfirmDelete(key);
      return;
    }
    setDeleting(true);
    setActionError("");
    const { error } = await api.delete(`/api/reviews/${reviewId}/response`);
    setDeleting(false);
    setConfirmDelete(null);
    if (error) {
      setActionError(error);
      return;
    }
    // Deleted responses vanish: the thread renders as if none ever existed.
    // A ghost original whose response just vanished is cleaned server-side;
    // drop it locally too so the inbox never shows a response-less ghost.
    setReceived((prev) =>
      prev
        .map((r) => (r.id === reviewId ? { ...r, response: null } : r))
        .filter((r) => !(r.deleted && !r.response))
    );
    setPendingCount((c) => c + 1);
  }

  function startEditWritten(review: WrittenReview) {
    setEditingId(review.id);
    setEditRating(review.rating ?? 5);
    setEditComment(review.comment || "");
    setEditError("");
  }

  async function submitEdit(e: React.FormEvent, reviewId: string) {
    e.preventDefault();
    const trimmed = editComment.trim();
    if (trimmed.length > 0 && trimmed.length < COMMENT_MIN) {
      setEditError(`Review must be at least ${COMMENT_MIN} characters.`);
      return;
    }
    setSavingEdit(true);
    setEditError("");
    const { data, error } = await api.patch<{ review: WrittenReview }>(`/api/reviews/${reviewId}`, {
      rating: editRating,
      comment: trimmed || undefined,
    });
    setSavingEdit(false);
    if (error || !data?.review) {
      setEditError(error || "Could not update your review.");
      return;
    }
    const updated = data.review;
    setWritten((prev) => prev.map((r) => (r.id === reviewId ? { ...r, ...updated, targetName: r.targetName } : r)));
    setReceived((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, rating: updated.rating, comment: updated.comment } : r))
    );
    setEditingId(null);
  }

  async function deleteWritten(reviewId: string, softExpected: boolean) {
    const key = `review:${reviewId}`;
    if (confirmDelete !== key) {
      setConfirmDelete(key);
      return;
    }
    setDeleting(true);
    setActionError("");
    const { data, error } = await api.delete<{ softDeleted?: boolean }>(`/api/reviews/${reviewId}`);
    setDeleting(false);
    setConfirmDelete(null);
    if (error) {
      setActionError(error);
      return;
    }
    if (data?.softDeleted || softExpected) {
      // Original deleted but a response survives → ghost placeholder stays
      // visible in both inboxes until the response is removed.
      const ghost = (list: ThreadReview[]) =>
        list.map((r) =>
          r.id === reviewId ? { ...r, deleted: true, rating: null, comment: null } : r
        );
      setWritten((prev) => ghost(prev));
      setReceived((prev) => ghost(prev));
    } else {
      setWritten((prev) => prev.filter((r) => r.id !== reviewId));
      setReceived((prev) => prev.filter((r) => r.id !== reviewId));
    }
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <section aria-labelledby="reviews-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
            Activity
          </p>
          <h1 id="reviews-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
            Reviews
          </h1>
        </section>
        <LoadingSkeleton />
      </div>
    );
  }

  const list = tab === "received" ? received : written;

  return (
    <div className="space-y-6">
      <section aria-labelledby="reviews-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          Activity
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 id="reviews-heading" className="font-heading text-2xl font-bold tracking-tight text-text-primary">
              Reviews
            </h1>
            <p className="mt-1 text-sm text-text-secondary" role="status">
              {pendingCount > 0
                ? `${pendingCount} review${pendingCount !== 1 ? "s" : ""} awaiting your response`
                : "All caught up — every review has a response"}
            </p>
          </div>
        </div>

        <div role="tablist" aria-label="Review inbox" className="mt-4 flex gap-2">
          {(
            [
              { id: "received", label: `Received (${received.length})` },
              { id: "written", label: `My reviews (${written.length})` },
            ] as { id: TabId; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              id={`tab-${t.id}`}
              onClick={() => {
                setTab(t.id);
                setConfirmDelete(null);
                setActionError("");
                cancelRespond();
                setEditingId(null);
              }}
              className={cn(
                "touch-target rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                tab === t.id
                  ? "bg-primary-600 text-white"
                  : "border border-border bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {fetchError && <FormBanner variant="error">{fetchError}</FormBanner>}
      {actionError && <FormBanner variant="error">{actionError}</FormBanner>}

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="space-y-4"
      >
        {list.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-12">
            <EmptyState
              title={tab === "received" ? "No reviews received yet" : "You haven't written any reviews"}
              description={
                tab === "received"
                  ? "When customers review your business, their reviews will appear here for you to read and respond to."
                  : "Reviews you write about sellers will appear here, along with their public responses to you."
              }
            />
          </div>
        ) : (
          list.map((review) => {
            const isGhost = !!review.deleted;
            const reviewerName = formatReviewerName(review.user.firstName, review.user.lastName);
            const written = review as WrittenReview;
            const myResponse = review.response && user?.id === review.response.responderId;
            return (
              <article
                key={review.id}
                className="rounded-xl border border-border bg-surface p-5 transition-colors sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${tintFor(isGhost ? "deleted" : reviewerName)}`}
                      aria-hidden
                    >
                      {isGhost
                        ? "–"
                        : `${(review.user.firstName?.[0] || "?").toUpperCase()}${(review.user.lastName?.[0] || "").toUpperCase()}`}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {isGhost ? "Former customer" : reviewerName}
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {formatThreadDate(review.createdAt)}
                        {tab === "written" && written.targetName && (
                          <span> · for {written.targetName}</span>
                        )}
                        {review.updatedAt && !isGhost && new Date(review.updatedAt) > new Date(review.createdAt) && (
                          <span className="ml-1.5 italic">(edited)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {!isGhost && typeof review.rating === "number" && <Stars value={review.rating} />}
                </div>

                {isGhost ? (
                  <DeletedOriginalNotice />
                ) : (
                  review.comment && (
                    <p className="mt-4 whitespace-pre-line break-words text-sm leading-relaxed text-text-secondary [overflow-wrap:anywhere]">
                      {review.comment}
                    </p>
                  )
                )}

                {review.response && (
                  <ResponseBlock
                    response={review.response}
                    contextLabel={
                      tab === "written"
                        ? `Seller response`
                        : undefined
                    }
                  />
                )}

                {/* ── Received tab: seller actions ── */}
                {tab === "received" && (
                  <div className="mt-4 border-t border-border pt-4">
                    {respondingId === review.id ? (
                      <form onSubmit={(e) => submitResponse(e, review.id)} className="space-y-3">
                        <label
                          htmlFor={`response-${review.id}`}
                          className="block text-sm font-semibold text-text-primary"
                        >
                          {editingResponseId === review.id ? "Edit your response" : "Your public response"}
                        </label>
                        <textarea
                          id={`response-${review.id}`}
                          rows={3}
                          maxLength={RESPONSE_MAX}
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Thank them, address their concern, keep it professional…"
                          className="w-full resize-none rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm leading-relaxed text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <p className="text-right text-xs tabular-nums text-text-secondary">
                          {responseText.length}/{RESPONSE_MAX}
                        </p>
                        {responseError && <FormBanner variant="error">{responseError}</FormBanner>}
                        <div className="flex items-center gap-2.5">
                          <button
                            type="submit"
                            disabled={savingResponse}
                            aria-busy={savingResponse}
                            className="touch-target inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                          >
                            <MessageCircle size={14} />
                            {savingResponse ? "Saving…" : editingResponseId === review.id ? "Update response" : "Post response"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelRespond}
                            className="touch-target inline-flex items-center rounded-lg border border-border px-4 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2.5">
                        {!review.response && !isGhost && (
                          <button
                            type="button"
                            onClick={() => startRespond(review)}
                            className="touch-target inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
                          >
                            <MessageCircle size={14} />
                            Respond
                          </button>
                        )}
                        {myResponse && (
                          <>
                            <button
                              type="button"
                              onClick={() => startRespond(review, review.response!.comment)}
                              className="touch-target inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
                            >
                              <Pencil size={14} />
                              Edit response
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteResponse(review.id)}
                              disabled={deleting}
                              className={cn(
                                "touch-target inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
                                confirmDelete === `resp:${review.id}`
                                  ? "border-error-300 bg-error-50 text-error-700"
                                  : "border-border text-text-secondary hover:bg-surface-secondary"
                              )}
                            >
                              <Trash2 size={14} />
                              {confirmDelete === `resp:${review.id}` ? "Click again to confirm" : "Delete response"}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Written tab: author actions ── */}
                {tab === "written" && (
                  <div className="mt-4 border-t border-border pt-4">
                    {editingId === review.id ? (
                      <form onSubmit={(e) => submitEdit(e, review.id)} className="space-y-3">
                        <div
                          role="radiogroup"
                          aria-label="Your rating"
                          className="flex items-center gap-1.5"
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              role="radio"
                              aria-checked={editRating === star}
                              aria-label={`Rate ${star} out of 5 stars`}
                              onClick={() => setEditRating(star)}
                              className="touch-target flex items-center justify-center p-1"
                            >
                              <Star
                                className={`h-6 w-6 ${star <= editRating ? "fill-accent-500 text-accent-500" : "fill-none text-text-secondary/40"}`}
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          aria-label="Your review"
                          rows={3}
                          maxLength={COMMENT_MAX}
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          className="w-full resize-none rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm leading-relaxed text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        {editError && <FormBanner variant="error">{editError}</FormBanner>}
                        <div className="flex items-center gap-2.5">
                          <button
                            type="submit"
                            disabled={savingEdit}
                            aria-busy={savingEdit}
                            className="touch-target inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                          >
                            {savingEdit ? "Saving…" : "Update review"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="touch-target inline-flex items-center rounded-lg border border-border px-4 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2.5">
                        {!isGhost && (
                          <button
                            type="button"
                            onClick={() => startEditWritten(written)}
                            className="touch-target inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteWritten(review.id, !!review.response)}
                          disabled={deleting}
                          className={cn(
                            "touch-target inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
                            confirmDelete === `review:${review.id}`
                              ? "border-error-300 bg-error-50 text-error-700"
                              : "border-border text-text-secondary hover:bg-surface-secondary"
                          )}
                        >
                          <Trash2 size={14} />
                          {confirmDelete === `review:${review.id}` ? "Click again to confirm" : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
