import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4" style={{ backgroundColor: "#F6F4EF" }}>
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h2 className="font-heading text-xl font-bold text-primary" style={{ fontFamily: "Sora, sans-serif" }}>
            All Property <span className="text-accent">Link</span>
          </h2>
        </div>
        <div className="rounded-lg border border-border bg-white p-8" style={{ borderRadius: "16px" }}>
          <div className="mb-6 text-center">
            <h1 className="font-heading text-3xl font-bold text-primary" style={{ fontFamily: "Sora, sans-serif" }}>
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-secondary">
              Sign in to your account
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
