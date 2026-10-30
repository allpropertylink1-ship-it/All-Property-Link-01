"use client"

import { useState } from "react"
import { api } from "@/lib/api-client"
import { AlertCircle } from "@/components/ui/icons"

interface BlogComment {
  id: string
  authorName: string
  authorEmail: string | null
  content: string
  status: string
  parentId: string | null
  createdAt: Date
  updatedAt: Date
}

interface BlogCommentsSectionProps {
  slug: string
  comments: BlogComment[]
}

export function BlogCommentsSection({ slug, comments }: BlogCommentsSectionProps) {
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [formMessage, setFormMessage] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [authorEmail, setAuthorEmail] = useState("")
  const [content, setContent] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError("")
    setFormMessage("")

    try {
      const { error } = await api.post<{ comment: BlogComment }>(
        `/api/blog/posts/${encodeURIComponent(slug)}/comments`,
        { authorName, authorEmail, content },
      )
      if (error) {
        setFormError(error)
      } else {
        setFormMessage("Thanks! Your comment is awaiting moderation.")
        setAuthorName("")
        setAuthorEmail("")
        setContent("")
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Comment submission failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-24">
      <h2 className="text-2xl font-bold font-heading text-foreground mb-6">Comments</h2>

      {formMessage && (
        <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-100">
          {formMessage}
        </div>
      )}
      {formError && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
          <AlertCircle size={16} className="shrink-0 mr-2" />
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="comment-author">Name</label>
            <input
              id="comment-author"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="comment-email">Email (optional)</label>
            <input
              id="comment-email"
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
              disabled={submitting}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="comment-content">Comment</label>
          <textarea
            id="comment-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Share your thoughts…"
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
            required
            disabled={submitting}
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !authorName.trim() || !content.trim()}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Post Comment"}
        </button>
      </form>

      {comments.length === 0 ? (
        <p className="text-sm text-muted">No comments yet. Be the first to share your thoughts.</p>
      ) : (
        <div className="space-y-6">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-4 pt-4 border-t border-border">
              <div className="shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                {c.authorName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{c.authorName}</span>
                  <span className="text-xs text-muted">{new Date(c.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
                <p className="text-sm text-muted whitespace-pre-wrap">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
