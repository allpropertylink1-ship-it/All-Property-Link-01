import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Sign in to your account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
