"use client"

import { useState } from "react"
import { api } from "@/lib/api-client"
import { FormBanner } from "@/components/shared/FormFeedback"

export function NewsletterSignup() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const email = (form.elements.namedItem("email") as HTMLInputElement).value

    setStatus("submitting")
    setMessage("")

    try {
      const { data, error } = await api.post<{ message: string }>("/api/newsletter/subscribe", { email })
      if (error) {
        setStatus("error")
        setMessage(error)
      } else {
        setStatus("success")
        setMessage(data?.message || "Thanks for subscribing!")
        form.reset()
      }
    } catch (err: unknown) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Subscription failed")
    } finally {
      setTimeout(() => setStatus("idle"), 6000)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      {status === "success" ? (
        <FormBanner variant="success">{message}</FormBanner>
      ) : status === "error" ? (
        <FormBanner variant="error">{message}</FormBanner>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="flex-1 rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
            disabled={status === "submitting"}
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-60"
          >
            {status === "submitting" ? "Subscribing…" : "Subscribe"}
          </button>
        </div>
        <p className="text-xs text-muted">
          Get new blog posts and property market updates straight to your inbox.
        </p>
      </form>
    </div>
  )
}
