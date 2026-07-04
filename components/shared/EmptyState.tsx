import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-secondary">
        <svg className="h-10 w-10 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="mb-2 font-heading text-xl font-semibold text-text-primary">
        {title}
      </h3>
      <p className="mb-6 max-w-text text-sm text-text-secondary">
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="touch-target inline-flex items-center rounded-lg bg-accent-300 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-300/30"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
