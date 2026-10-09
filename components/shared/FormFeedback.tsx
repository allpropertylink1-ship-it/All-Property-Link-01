"use client";

import { AlertCircle, CheckCircle, Clock } from "@/components/ui/icons";

interface FormBannerProps {
  variant: "error" | "success" | "pending";
  children: React.ReactNode;
  className?: string;
}

export function FormBanner({ variant, children, className = "" }: FormBannerProps) {
  const isError = variant === "error";
  const isPending = variant === "pending";
  const Icon = isError ? AlertCircle : isPending ? Clock : CheckCircle;
  return (
    <div
      role={isError ? "alert" : "status"}
      aria-busy={isPending}
      className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${
        isError
          ? "border-error-500/20 bg-error-50 text-error-700"
          : isPending
            ? "border-amber-500/20 bg-amber-50 text-amber-700"
            : "border-success-500/20 bg-success-50 text-success-700"
      } ${className}`}
    >
      <Icon size={16} className={`mt-0.5 shrink-0 ${isError ? "text-error-500" : isPending ? "text-amber-500" : "text-success-600"}`} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}