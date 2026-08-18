import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  searchParams?: Record<string, string | undefined>;
  onChange?: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, basePath = "", searchParams = {}, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  function href(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const edgeClass =
    "touch-target inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary disabled:opacity-40";
  const pageClass = (active: boolean) =>
    `touch-target inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
      active ? "bg-primary-500 text-white" : "border border-border bg-surface text-text-primary hover:bg-surface-secondary"
    }`;

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      {currentPage > 1 &&
        (onChange ? (
          <button type="button" onClick={() => onChange(currentPage - 1)} className={edgeClass}>
            Previous
          </button>
        ) : (
          <Link href={href(currentPage - 1)} className={edgeClass}>
            Previous
          </Link>
        ))}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-text-secondary">...</span>
        ) : onChange ? (
          <button
            type="button"
            key={p}
            aria-current={p === currentPage ? "page" : undefined}
            onClick={() => onChange(p)}
            className={pageClass(p === currentPage)}
          >
            {p}
          </button>
        ) : (
          <Link key={p} href={href(p)} aria-current={p === currentPage ? "page" : undefined} className={pageClass(p === currentPage)}>
            {p}
          </Link>
        ),
      )}
      {currentPage < totalPages &&
        (onChange ? (
          <button type="button" onClick={() => onChange(currentPage + 1)} className={edgeClass}>
            Next
          </button>
        ) : (
          <Link href={href(currentPage + 1)} className={edgeClass}>
            Next
          </Link>
        ))}
    </nav>
  );
}
