import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { Link as LinkIcon } from "@/components/ui/icons";

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams
  const isDev = process.env.VERCEL_ENV !== 'production'

  return (
    <div className={`flex min-h-screen items-center justify-center bg-surface px-4 ${isDev ? 'py-10' : ''}`}>
      {isDev && (
        <div className="fixed left-0 top-0 z-50 w-full bg-accent-300 px-4 py-1.5 text-center text-xs font-medium text-white">
          Test accounts available &mdash; use password <strong>Test@123</strong>
        </div>
      )}
      <div className="w-full max-w-5xl">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <LinkIcon size={18} />
            </span>
            <span className="font-heading text-xl font-bold text-text-primary">
              All Property <span className="text-accent-300">Link</span>
            </span>
          </Link>
        </div>
        <AuthCard referralCode={ref} />
      </div>
    </div>
  );
}