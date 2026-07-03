import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
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
  );
}
