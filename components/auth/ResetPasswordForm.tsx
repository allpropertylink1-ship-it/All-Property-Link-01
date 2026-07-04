"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!token) {
      setError("Invalid reset link");
      setLoading(false);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to reset password");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="rounded-lg bg-accent/10 px-4 py-8 text-center">
        <p className="mb-4 text-sm text-accent-700">
          Password reset successful! You can now sign in with your new password.
        </p>
        <a
          href="/auth/login"
          className="touch-target inline-block rounded-sm bg-accent px-6 py-3 text-sm font-medium text-white"
        >
          Sign in
        </a>
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
        <label htmlFor="password" className="block text-sm font-medium text-primary">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-primary placeholder-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          style={{ fontSize: "16px" }}
          placeholder="Enter new password"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-primary">
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-primary placeholder-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          style={{ fontSize: "16px" }}
          placeholder="Confirm new password"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="touch-target w-full rounded-sm bg-accent px-4 py-3 font-medium text-white transition-colors hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Resetting..." : "Reset password"}
      </button>
      <p className="text-center text-sm text-secondary">
        <a href="/auth/login" className="font-medium text-accent hover:text-accent-600">
          Back to sign in
        </a>
      </p>
    </form>
  );
}
