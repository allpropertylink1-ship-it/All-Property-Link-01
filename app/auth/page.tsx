import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthAssurance } from "@/components/auth/stitch-auth";
import { getSession } from "@/lib/auth-utils";
import { resolvePostAuthTarget } from "@/lib/persona";

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ ref?: string; return?: string }> }) {
  const { ref, return: returnParam } = await searchParams
  // Signed-in users never see login/signup: bounce to persona home (or a
  // safe ?return= deep link). Token flows (activate/reset/magic-link/consent)
  // live under their own /auth/* routes and are intentionally NOT guarded.
  const session = await getSession()
  if (session?.user) {
    redirect(resolvePostAuthTarget(session.user, returnParam))
  }
  const isDev = process.env.VERCEL_ENV !== 'production'

  return (
    <div className={`flex min-h-[100dvh] items-center justify-center bg-surface-secondary px-4 py-6 ${isDev ? 'pt-14' : ''}`}>
      {isDev && (
        <div className="fixed left-0 top-0 z-50 w-full bg-primary px-4 py-1.5 text-center text-xs font-medium text-white">
          Test accounts available &mdash; use password <strong>Test@123</strong>
        </div>
      )}
      <div className="w-full max-w-3xl">
        <div className="mb-3 text-center">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="All Property Link home">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-heading text-xs font-bold text-white">
              APL
            </span>
            <span className="font-heading text-lg font-bold text-text-primary">
              All Property <span className="text-accent-600">Link</span>
            </span>
          </Link>
        </div>
        <AuthCard referralCode={ref} />
        <div className="mx-auto mt-3 max-w-xl">
          <AuthAssurance>
            256-bit SSL · Kenya Data Protection Act 2019
          </AuthAssurance>
        </div>
      </div>
    </div>
  );
}
