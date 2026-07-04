"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function VerifyMagicLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "signing-in" | "error" | "done">("verifying");
  const [error, setError] = useState("");

  const handleVerification = useCallback(async () => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Missing verification token");
      setStatus("error");
      return;
    }

    setStatus("verifying");
    const res = await fetch(`/api/auth/verify-magic-link?token=${token}`);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Invalid or expired magic link");
      setStatus("error");
      return;
    }

    const data = await res.json();
    setStatus("signing-in");

    const result = await signIn("credentials", {
      email: data.email,
      password: "__MAGIC_LINK__",
      redirect: false,
    });

    if (result?.error) {
      setError("Failed to sign in. Please try again.");
      setStatus("error");
      return;
    }

    setStatus("done");
    router.push("/dashboard");
    router.refresh();
  }, [searchParams, router]);

  useEffect(() => {
    handleVerification();
  }, [handleVerification]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm text-center">
        {status === "verifying" && (
          <div className="space-y-4">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-accent-300 border-t-transparent" />
            <p className="font-heading text-lg font-semibold text-text-primary">Verifying your link...</p>
          </div>
        )}
        {status === "signing-in" && (
          <div className="space-y-4">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-accent-300 border-t-transparent" />
            <p className="font-heading text-lg font-semibold text-text-primary">Signing you in...</p>
          </div>
        )}
        {status === "done" && (
          <div className="space-y-4">
            <p className="font-heading text-lg font-semibold text-text-primary">Signed in!</p>
            <p className="text-sm text-text-secondary">Redirecting to dashboard...</p>
          </div>
        )}
        {status === "error" && (
          <div className="space-y-4">
            <p className="font-heading text-lg font-semibold text-error-500">Link expired or invalid</p>
            <p className="text-sm text-text-secondary">{error}</p>
            <a
              href="/auth/login"
              className="inline-block rounded-sm bg-accent-300 px-6 py-2 text-sm font-medium text-white hover:bg-accent-400"
            >
              Back to login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
