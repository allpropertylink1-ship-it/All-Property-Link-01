"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email") as string,
      password: form.get("password") as string,
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
        <label htmlFor="email" className="block text-sm font-medium text-text-primary">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 block w-full rounded-lg border border-border px-4 py-3 text-text-primary placeholder-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-text-primary">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 block w-full rounded-lg border border-border px-4 py-3 text-text-primary placeholder-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="Enter your password"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="touch-target w-full rounded-lg bg-primary-600 px-4 py-3 font-medium text-text-on-primary transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <a href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
          Sign up
        </a>
      </p>
    </form>
  );
}
