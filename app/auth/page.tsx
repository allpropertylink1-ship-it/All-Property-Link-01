import { AuthCard } from "@/components/auth/AuthCard";

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
      <div className="w-full max-w-4xl">
        <AuthCard referralCode={ref} />
      </div>
    </div>
  );
}