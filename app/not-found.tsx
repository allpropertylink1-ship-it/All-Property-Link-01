import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-heading text-lg font-bold tracking-tight text-primary">
        All Property <span className="text-accent-300">Link</span>
      </p>
      <h2 className="mt-6 mb-2 font-heading text-3xl font-bold text-text-primary">Page not found</h2>
      <p className="mb-8 text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-8 py-4 font-medium text-text-onPrimary hover:bg-primary-700"
      >
        Go home
      </Link>
    </div>
  );
}