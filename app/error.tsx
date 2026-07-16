"use client";
import Link from "next/link";

export default function RootError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-heading text-lg font-bold tracking-tight text-primary">
        All Property <span className="text-accent-300">Link</span>
      </p>
      <h2 className="mt-6 mb-2 font-heading text-2xl font-bold text-text-primary">Something went wrong</h2>
      <p className="mb-6 text-text-secondary">An unexpected error occurred. Please try again.</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="touch-target rounded-lg bg-primary-600 px-6 py-3 font-medium text-text-onPrimary hover:bg-primary-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="touch-target rounded-lg border border-border px-6 py-3 font-medium text-text-secondary hover:bg-surface-secondary"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
