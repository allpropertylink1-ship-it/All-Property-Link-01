import { RegisterForm } from "@/components/auth/RegisterForm";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams
  const isDev = process.env.NODE_ENV !== 'production'

  return (
    <div className={`flex min-h-screen items-center justify-center bg-surface px-4 ${isDev ? 'pt-10' : ''}`}>
      {isDev && (
        <div className="fixed left-0 top-0 z-50 w-full bg-accent-300 px-4 py-1.5 text-center text-xs font-medium text-white">
          Test accounts available &mdash; use password <strong>Test@123</strong>
        </div>
      )}
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h2 className="font-heading text-xl font-bold text-text-primary">
            All Property <span className="text-accent-300">Link</span>
          </h2>
        </div>
        <div className="rounded-xl border border-border bg-surface p-8">
          <div className="mb-6 text-center">
            <h1 className="font-heading text-3xl font-bold text-text-primary">
              Create account
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Join All Property Link today
            </p>
          </div>
          <RegisterForm referralCode={ref} />
        </div>
      </div>
    </div>
  );
}
