import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { CenteredAuthShell } from "@/components/auth/stitch-auth";
import { Key } from "@/components/ui/icons";

export default function ForgotPasswordPage() {
  return (
    <CenteredAuthShell
      icon={Key}
      eyebrow="Identity Assurance Console"
      title="Forgot Password?"
      subtitle="Enter your registered email address. We will send a secure password reset link to your inbox."
      assurance="Safe and verified by All Property Link Security Systems"
      backHref="/auth/login"
      backLabel="Back to Login"
    >
      <ForgotPasswordForm />
    </CenteredAuthShell>
  );
}
