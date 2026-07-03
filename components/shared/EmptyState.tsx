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
      <div className="mb-4 h-16 w-16 rounded-full bg-surface-secondary" />
      <h3 className="mb-2 font-heading text-xl font-semibold text-text-primary">
        {title}
      </h3>
      <p className="mb-6 max-w-text text-sm text-text-secondary">
        {description}
      </p>
      {action && (
        <a
          href={action.href}
          className="touch-target inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
