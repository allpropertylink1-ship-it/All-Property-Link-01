"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { CenteredAuthShell } from "@/components/auth/stitch-auth";
import { Key } from "@/components/ui/icons";

export default function VerifyMagicLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "error" | "done">("verifying");
  const [error, setError] = useState("");

  const handleVerification = useCallback(async () => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Missing verification token");
      setStatus("error");
      return;
    }

    const { data, error } = await api.get<{ user: { firstName: string } }>(`/api/auth/verify-magic-link?token=${token}`);
    if (error || !data) {
      setError(error || "Invalid or expired magic link");
      setStatus("error");
      return;
    }

    setStatus("done");
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1000);
  }, [searchParams, router]);

  useEffect(() => {
    handleVerification();
  }, [handleVerification]);

  return (
    <CenteredAuthShell
      icon={Key}
      eyebrow="Passwordless Sign In"
      title={status === "error" ? "Link expired or invalid" : status === "done" ? "Signed in!" : "Verifying your link..."}
      subtitle={
        status === "verifying"
          ? "Checking your secure sign-in token."
          : status === "done"
            ? "Redirecting to dashboard..."
            : error
      }
      assurance="256-Bit SSL Encrypted session"
      backHref={status === "error" ? "/auth/login" : undefined}
      backLabel={status === "error" ? "Back to login" : undefined}
    >
      {status === "verifying" && (
        <div className="flex justify-center" role="status" aria-label="Verifying your link">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </CenteredAuthShell>
  );
}
