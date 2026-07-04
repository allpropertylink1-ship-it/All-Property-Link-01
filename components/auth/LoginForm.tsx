"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { checkAccountLocked } from "@/lib/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const lockStatus = await checkAccountLocked(email);
    if (lockStatus.locked) {
      setError(`Account locked. Try again in ${lockStatus.minutesRemaining} minute${lockStatus.minutesRemaining !== 1 ? "s" : ""}.`);
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
          className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-primary placeholder-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          style={{ fontSize: "16px" }}
          placeholder="you@example.com"
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
          autoComplete="current-password"
          required
          className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-primary placeholder-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          style={{ fontSize: "16px" }}
          placeholder="Enter your password"
        />
      </div>
      <div className="flex items-center justify-end">
        <a
          href="/auth/forgot-password"
          className="text-sm font-medium text-accent hover:text-accent-600"
        >
          Forgot password?
        </a>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="touch-target w-full rounded-sm bg-accent px-4 py-3 font-medium text-white transition-colors hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center text-sm text-secondary">
        Don&apos;t have an account?{" "}
        <a href="/auth/register" className="font-medium text-accent hover:text-accent-600">
          Register
        </a>
      </p>
    </form>
  );
}
