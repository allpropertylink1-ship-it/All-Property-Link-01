import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
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
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
