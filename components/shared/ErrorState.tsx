"use client";

interface ErrorStateProps {
  title?: string;
  message?: string;
  retry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  retry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 h-16 w-16 rounded-full bg-error-500/10" />
      <h3 className="mb-2 font-heading text-xl font-semibold text-text-primary">
        {title}
      </h3>
      <p className="mb-6 max-w-text text-sm text-text-secondary">{message}</p>
      {retry && (
        <button
          type="button"
          onClick={retry}
          className="touch-target inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          Try again
        </button>
      )}
    </div>
  );
}
