"use client";

export default function ErrorPage({ error: _error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-warning-50">
        <svg className="h-6 w-6 text-warning-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="mt-4 font-heading text-xl font-bold text-text-primary">Something went wrong</h2>
      <p className="mt-2 text-sm text-text-secondary">An unexpected error occurred. Please try again.</p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
      >
        Try again
      </button>
    </div>
  );
}
