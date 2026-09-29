/**
 * SectionHeading — homepage section titles that echo the hero treatment.
 *
 * Hero language (HeroSection.tsx): Poppins, UPPERCASE, light weight,
 * eyebrow line + large title + gradient scrim accent. This component
 * translates that to light surfaces: accent eyebrow with hero-dot bar,
 * large light uppercase title in primary ink, optional subtitle.
 * Keeps the aria-labelledby contract: pass the same id the section
 * references and it lands on the h2.
 */
interface SectionHeadingProps {
  id: string
  eyebrow: string
  title: string
  subtitle?: string
}

export function SectionHeading({ id, eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <p className="flex items-center gap-2 font-poppins text-xs font-semibold uppercase leading-5 tracking-[0.25em] text-accent-600">
        <span
          aria-hidden="true"
          className="inline-block h-2 w-8 rounded-full bg-gradient-to-r from-accent-500 to-accent-400"
        />
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-2 font-poppins text-[28px] font-light uppercase leading-[1.2] tracking-tight text-primary-900 text-balance sm:text-[32px]"
      >
        {title}
      </h2>
      <span
        aria-hidden="true"
        className="mt-3 block h-[3px] w-16 rounded-full bg-gradient-to-r from-primary-900/70 via-primary-900/25 to-transparent"
      />
      {subtitle && (
        <p className="mt-2 font-poppins text-base font-light leading-6 text-text-secondary">
          {subtitle}
        </p>
      )}
    </div>
  )
}
