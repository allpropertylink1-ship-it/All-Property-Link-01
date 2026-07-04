"use client";

import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      setError("Failed to send reset email");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="rounded-lg bg-accent/10 px-4 py-8 text-center">
        <p className="text-sm text-accent-700">
          If an account exists with that email, we&apos;ve sent a reset link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-primary">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-primary placeholder-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          style={{ fontSize: "16px" }}
          placeholder="you@example.com"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="touch-target w-full rounded-sm bg-accent px-4 py-3 font-medium text-white transition-colors hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send reset link"}
      </button>
      <p className="text-center text-sm text-secondary">
        <a href="/auth/login" className="font-medium text-accent hover:text-accent-600">
          Back to sign in
        </a>
      </p>
    </form>
  );
}
