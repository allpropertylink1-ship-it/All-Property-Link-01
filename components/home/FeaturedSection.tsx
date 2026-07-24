import { Loader2, AlertCircle } from "@/components/ui/icons"

interface FeaturedSectionProps { title: string; viewAllHref?: string; loading?: boolean; error?: string; emptyMessage?: string; children: React.ReactNode }

export function FeaturedSection({ title, viewAllHref, loading, error, emptyMessage, children }: FeaturedSectionProps) {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
          {viewAllHref && <a href={viewAllHref} className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">View all &rarr;</a>}
        </div>
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-muted" /></div>
        : error ? <div className="flex items-center justify-center gap-2 rounded-xl bg-error-50 py-8 text-sm text-red-600"><AlertCircle size={16} /> {error}</div>
        : emptyMessage ? <p className="py-8 text-center text-sm text-muted">{emptyMessage}</p>
        : children}
      </div>
    </section>
  )
}
