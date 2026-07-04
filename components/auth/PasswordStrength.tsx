"use client";

import zxcvbn from "zxcvbn";

const labels = ["Weak", "Fair", "Good", "Strong"];
const colors = ["bg-error-500", "bg-accent", "bg-primary-light", "bg-primary"];
const textColors = ["text-error-500", "text-accent", "text-primary", "text-primary"];

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const result = zxcvbn(password);
  const score = result.score;
  const label = labels[score] ?? "Weak";

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= score ? colors[score] || "bg-error-500" : "bg-line"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${textColors[score] || "text-error-500"}`}>
        {label}
      </p>
    </div>
  );
}
