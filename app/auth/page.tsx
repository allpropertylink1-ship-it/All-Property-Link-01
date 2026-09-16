import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthAssurance } from "@/components/auth/stitch-auth";

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams
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
        <AuthCard referralCode={ref} />
        <div className="mx-auto mt-4 max-w-2xl">
          <AuthAssurance>
            256-Bit SSL Encrypted and Kenya Data Protection Act 2019 Compliant
          </AuthAssurance>
        </div>
      </div>
    </div>
  );
}
