import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { CenteredAuthShell } from "@/components/auth/stitch-auth";
import { Lock } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <CenteredAuthShell
      icon={Lock}
      eyebrow="Set New Password"
      title="Create New Password"
      subtitle="Your identity has been verified. Set a strong, distinct password for your All Property Link account."
      assurance="256-Bit SSL Protected session"
      backHref="/auth/login"
      backLabel="Back to Login"
    >
      <Suspense fallback={<div className="text-center text-sm text-text-secondary">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </CenteredAuthShell>
  );
}
