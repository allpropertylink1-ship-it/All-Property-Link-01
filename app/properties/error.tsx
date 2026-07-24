"use client";

export default function PropertiesError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h2 className="mb-2 font-heading text-2xl font-bold text-text-primary">Something went wrong</h2>
      <p className="mb-2 text-sm text-red-600 font-mono">{error.message}</p>
      <p className="mb-6 text-text-secondary">We couldn&apos;t load the properties. Please try again.</p>
      <button
        onClick={reset}
        className="touch-target rounded-lg bg-primary-600 px-6 py-3 font-medium text-text-on-primary hover:bg-primary-700"
      >
        Try again
      </button>
    </div>
  );
}
