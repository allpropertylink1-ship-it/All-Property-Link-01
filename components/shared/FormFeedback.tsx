"use client";

import { AlertCircle, CheckCircle } from "@/components/ui/icons";

interface FormBannerProps {
  variant: "error" | "success";
  children: React.ReactNode;
  className?: string;
}

export function FormBanner({ variant, children, className = "" }: FormBannerProps) {
  const isError = variant === "error";
  const Icon = isError ? AlertCircle : CheckCircle;
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${
        isError
          ? "border-error-500/20 bg-error-50 text-error-700"
          : "border-success-500/20 bg-success-50 text-success-700"
      } ${className}`}
    >
      <Icon size={16} className={`mt-0.5 shrink-0 ${isError ? "text-error-500" : "text-success-600"}`} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}