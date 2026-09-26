import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthAssurance } from "@/components/auth/stitch-auth";
import { getSession } from "@/lib/auth-utils";
import { resolvePostAuthTarget } from "@/lib/persona";

const GOOGLE_ERRORS: Record<string, string> = {
  consent: "Please agree to the Terms of Service and Privacy Policy and confirm you are 18+ years old to continue with Google.",
  link: "This Gmail is already registered with another sign-in method. Sign in with your password or verification code first.",
  unverified: "Your Google account email is not verified. Verify it with Google and try again, or register with email or phone instead.",
  locked: "Your account is temporarily locked after too many attempts. Please try again later.",
  reset: "This account needs a password reset first. Use “Forgot password”, set a new password, then continue.",
  csrf: "Google sign-in didn't complete securely. Please try again.",
  failed: "Google sign-in didn't complete. Please try again.",
}

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ ref?: string; return?: string; google_error?: string }> }) {
  const { ref, return: returnParam, google_error: googleError } = await searchParams
  // Signed-in users never see login/signup: bounce to persona home (or a
  // safe ?return= deep link). Token flows (activate/reset/magic-link/consent)
  // live under their own /auth/* routes and are intentionally NOT guarded.
  const session = await getSession()
  if (session?.user) {
    redirect(resolvePostAuthTarget(session.user, returnParam))
  }
  const isDev = process.env.VERCEL_ENV !== 'production'

  return (
    <div className={`flex min-h-[100dvh] items-center justify-center bg-surface-secondary px-4 py-10 ${isDev ? 'pt-14' : ''}`}>
      {isDev && (
        <div className="fixed left-0 top-0 z-50 w-full bg-primary px-4 py-1.5 text-center text-xs font-medium text-white">
          Test accounts available &mdash; use password <strong>Test@123</strong>
        </div>
      )}
      <div className="w-full max-w-5xl">
        <div className="mb-4 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="All Property Link home">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-heading text-sm font-bold text-white">
              APL
            </span>
            <span className="font-heading text-xl font-bold text-text-primary">
              All Property <span className="text-accent-600">Link</span>
            </span>
          </Link>
        </div>
        <AuthCard referralCode={ref} notice={googleError ? GOOGLE_ERRORS[googleError] || GOOGLE_ERRORS.failed : undefined} />
        <div className="mx-auto mt-4 max-w-2xl">
          <AuthAssurance>
            256-Bit SSL Encrypted and Kenya Data Protection Act 2019 Compliant
          </AuthAssurance>
        </div>
      </div>
    </div>
  );
}
