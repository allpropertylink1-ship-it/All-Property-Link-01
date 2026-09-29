import { Star } from "@/components/ui/icons";
import { formatReviewerName } from "@/lib/utils";

/** A seller response nested under its original review (public everywhere). */
export interface ThreadResponse {
  id: string;
  comment: string;
  createdAt: string | Date;
  updatedAt?: string | Date | null;
  responderId: string;
  responder: { firstName: string; lastName: string };
}

/**
 * A review shaped for thread rendering.
 * - Live review → rating + comment as written.
 * - Soft-deleted review WITH a response → ghost: rating/comment nulled,
 *   `deleted` true, `response` preserved so the thread keeps its context.
 */
export interface ThreadReview {
  id: string;
  userId: string;
  targetType?: string;
  targetId?: string;
  rating: number | null;
  comment: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date | null;
  deleted?: boolean;
  placeholder?: string;
  user: { firstName: string; lastName: string };
  response?: ThreadResponse | null;
}

export function formatThreadDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
}

export function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`Rated ${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden
          className={`${size} ${
            star <= value ? "fill-accent-500 text-accent-500" : "fill-none text-text-secondary/40"
          }`}
        />
      ))}
    </div>
  );
}

/** Ghost placeholder for a deleted original that still has a response. */
export function DeletedOriginalNotice() {
  return (
    <p className="mt-4 rounded-lg border border-dashed border-border bg-surface-secondary px-4 py-3 text-sm italic text-text-secondary">
      Original review no longer available
    </p>
  );
}

/**
 * Public seller response block — teal left-rail conversation nesting.
 * Rendered under the original review on public pages AND in both inboxes.
 */
export function ResponseBlock({ response, contextLabel }: { response: ThreadResponse; contextLabel?: string }) {
  const name = formatReviewerName(response.responder.firstName, response.responder.lastName);
  const edited =
    response.updatedAt && new Date(response.updatedAt) > new Date(response.createdAt);
  return (
    <div
      className="mt-4 rounded-lg border border-border border-l-4 border-l-primary-500 bg-surface-secondary p-4"
      aria-label={`Response from ${name}`}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="text-xs font-bold uppercase tracking-wide text-primary-700">
          {contextLabel ?? `Response from ${name}`}
        </span>
        <span className="text-xs text-text-secondary">
          {formatThreadDate(response.createdAt)}
          {edited && <span className="ml-1.5 italic">(edited)</span>}
        </span>
      </div>
      <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed text-text-primary [overflow-wrap:anywhere]">
        {response.comment}
      </p>
    </div>
  );
}
