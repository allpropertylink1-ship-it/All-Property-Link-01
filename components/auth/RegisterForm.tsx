"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirmPassword = form.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        email: form.get("email"),
        password,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    router.push("/auth/login?registered=true");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-primary">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-primary placeholder-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            style={{ fontSize: "16px" }}
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-primary">
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-primary placeholder-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            style={{ fontSize: "16px" }}
          />
        </div>
      </div>
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
          className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-primary placeholder-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          style={{ fontSize: "16px" }}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-primary">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-primary placeholder-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          style={{ fontSize: "16px" }}
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-primary placeholder-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          style={{ fontSize: "16px" }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="touch-target w-full rounded-sm bg-accent px-4 py-3 font-medium text-white transition-colors hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center text-sm text-secondary">
        Already have an account?{" "}
        <a href="/auth/login" className="font-medium text-accent hover:text-accent-600">
          Sign in
        </a>
      </p>
    </form>
  );
}
