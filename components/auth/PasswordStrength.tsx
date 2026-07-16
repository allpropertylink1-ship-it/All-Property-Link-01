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
  const crackTime = result.crack_times_display.offline_slow_hashing_1e4_per_second;
  const warning = result.feedback.warning;
  const suggestions = result.feedback.suggestions;
  const metCount = requirements.filter((r) => r.test(password)).length;

  return (
    <div className="mt-4 space-y-3">
      <div className="space-y-1.5">
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                i <= score ? color.bar : "bg-border"
              }`}
              style={{
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${color.text}`}>{label}</span>
          <span className="text-xs text-text-secondary">{crackTime}</span>
        </div>
      </div>

      {(warning || suggestions.length > 0) && (
        <div className={`rounded-lg border ${color.border} ${color.bg} px-3 py-2`}>
          {warning && (
            <p className="text-xs font-medium text-orange-600">{warning}</p>
          )}
          {suggestions.length > 0 && (
            <ul className={`space-y-0.5 ${warning ? "mt-1" : ""}`}>
              {suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-text-secondary">
                  <svg className="mt-0.5 h-3 w-3 shrink-0 text-accent-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-text-secondary">
          Requirements ({metCount}/{requirements.length})
        </p>
        {requirements.map((req) => {
          const met = req.test(password);
          return (
            <div key={req.label} className="flex items-center gap-2">
              {met ? (
                <svg className="h-3.5 w-3.5 shrink-0 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5 shrink-0 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              )}
              <span className={`text-xs ${met ? "text-green-600 font-medium" : "text-text-secondary"}`}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
