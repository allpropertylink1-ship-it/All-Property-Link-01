"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { PasswordStrength } from "./PasswordStrength";

type ContactMethod = "email" | "phone";

export function RegisterForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [contactMethod, setContactMethod] = useState<ContactMethod>("email");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const confirmPassword = form.get("confirmPassword") as string;
    const firstName = form.get("firstName") as string;
    const lastName = form.get("lastName") as string;
    const email = contactMethod === "email" ? (form.get("email") as string) : "";
    const phoneRaw = contactMethod === "phone" ? (form.get("phone") as string) : "";
    const phone = phoneRaw ? `+254${phoneRaw.replace(/\D/g, "")}` : "";

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (contactMethod === "phone" && phoneRaw.replace(/\D/g, "").length !== 9) {
      setError("Please enter a valid 9-digit Kenyan phone number");
      setLoading(false);
      return;
    }

    if (contactMethod === "email") {
      if (!email) {
        setError("Email is required");
        setLoading(false);
        return;
      }
    }

    const { error: signupError } = await signup({ firstName, lastName, password, email, phone });
    if (signupError) {
      setError(signupError);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <>
      <div className="mb-6">
        <button
          type="button"
          onClick={() => {}}
          className="touch-target flex w-full items-center justify-center gap-3 rounded-sm border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Sign up with Google
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface px-2 text-text-secondary">or continue with</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-text-primary">First name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
              style={{ fontSize: "16px" }}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-text-primary">Last name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
              style={{ fontSize: "16px" }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Contact method
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setContactMethod("email")}
              className={`flex-1 rounded-sm border px-4 py-2.5 text-sm font-medium transition-colors ${
                contactMethod === "email"
                  ? "border-accent-300 bg-accent-300/10 text-accent-300"
                  : "border-border text-text-secondary hover:border-accent-300"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setContactMethod("phone")}
              className={`flex-1 rounded-sm border px-4 py-2.5 text-sm font-medium transition-colors ${
                contactMethod === "phone"
                  ? "border-accent-300 bg-accent-300/10 text-accent-300"
                  : "border-border text-text-secondary hover:border-accent-300"
              }`}
            >
              Phone (+254)
            </button>
          </div>
        </div>

        {contactMethod === "email" ? (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary">Email</label>
            <div className="relative mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-sm border border-border px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
                style={{ fontSize: "16px" }}
                placeholder="you@example.com"
              />
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-primary">Phone number</label>
            <div className="mt-1 flex">
              <span className="inline-flex items-center rounded-sm rounded-r-none border border-r-0 border-border bg-surface-secondary px-3 text-sm text-text-secondary">
                +254
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                required
                maxLength={9}
                className="block w-full rounded-sm rounded-l-none border border-border px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
                style={{ fontSize: "16px" }}
                placeholder="712 345 678"
              />
            </div>
            <p className="mt-1 text-xs text-text-secondary">Enter the last 9 digits of your Kenyan phone number</p>
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
            style={{ fontSize: "16px" }}
          />
          <PasswordStrength password={password} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1 block w-full rounded-sm border border-border px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
            style={{ fontSize: "16px" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="touch-target w-full rounded-sm bg-accent-300 px-4 py-3 font-medium text-white transition-colors hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-300/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <a href="/auth/login" className="font-medium text-accent-300 hover:text-accent-400">Sign in</a>
        </p>
      </form>
    </>
  );
}
