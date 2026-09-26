"use client";

import { useMemo } from "react";
import zxcvbn from "zxcvbn";

interface PasswordStrengthProps {
  password: string;
}

const requirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Contains a number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Contains special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
const strengthColors = [
  { bar: "bg-red-500", text: "text-red-500", bg: "bg-red-500/10", border: "border-red-500" },
  { bar: "bg-orange-500", text: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500" },
  { bar: "bg-yellow-500", text: "text-yellow-600", bg: "bg-yellow-500/10", border: "border-yellow-500" },
  { bar: "bg-lime-500", text: "text-lime-600", bg: "bg-lime-500/10", border: "border-lime-500" },
  { bar: "bg-green-500", text: "text-green-600", bg: "bg-green-500/10", border: "border-green-500" },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const result = useMemo(() => {
    if (!password) return null;
    return zxcvbn(password);
  }, [password]);

  if (!password || !result) return null;

  const score = result.score;
  const color = strengthColors[score];
  const label = strengthLabels[score];
  const warning = result.feedback.warning;
  const suggestions = result.feedback.suggestions;

  return (
    <div className="mt-1.5 space-y-1.5 rounded-lg bg-surface-secondary p-2.5">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= score ? color.bar : "bg-border"
              }`}
              style={{
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          ))}
        </div>
        <span className={`ml-2 text-[11px] font-semibold ${color.text}`}>{label}</span>
      </div>

      {(warning || suggestions.length > 0) && (
        <div className={`rounded-md border ${color.border} ${color.bg} px-2 py-1.5`}>
          {warning && (
            <p className="text-[11px] font-medium text-orange-600">{warning}</p>
          )}
          {suggestions.length > 0 && (
            <ul className={`space-y-0.5 ${warning ? "mt-0.5" : ""}`}>
              {suggestions.slice(0, 2).map((s, i) => (
                <li key={i} className="flex items-start gap-1 text-[11px] leading-snug text-text-secondary">
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
        {requirements.map((req) => {
          const met = req.test(password);
          return (
            <div key={req.label} className="flex items-center gap-1">
              {met ? (
                <svg className="h-3 w-3 shrink-0 text-success-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg className="h-3 w-3 shrink-0 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              )}
              <span className={`text-[11px] leading-tight ${met ? "font-medium text-success-600" : "text-text-secondary"}`}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
