import Link from "next/link";
import { Wrench } from "@/components/ui/icons";

interface AdvisoryBannerProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function AdvisoryBanner({
  title = "Acquiring or Developing Land in Kenya?",
  description = "Deploy certified land surveyors, registered architects, and accredited masonry fundis vetted through our escrow network.",
  ctaLabel = "Browse Verified Fundis",
  ctaHref = "/browse?tab=services",
}: AdvisoryBannerProps) {
  return (
    <section
      aria-label="Verified fundi advisory"
      className="flex flex-col gap-4 rounded-xl bg-primary p-6 text-white shadow-sm md:flex-row md:items-center md:justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-500 text-white">
          <Wrench size={24} />
        </div>
        <div className="flex flex-col">
          <h2 className="font-heading text-lg font-bold">{title}</h2>
          <p className="mt-1 text-sm text-white/80">{description}</p>
        </div>
      </div>
      <Link
        href={ctaHref}
        className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-bold text-text-primary transition-colors hover:bg-surface-secondary"
      >
        {ctaLabel}
      </Link>
    </section>
  );
}
