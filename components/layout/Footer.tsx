import Link from "next/link";
import { Suspense } from "react";
import { IconBrandFacebook, IconBrandInstagram } from "@tabler/icons-react";
import {
  ArrowUp,
  CitiesCovered,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "@/components/ui/icons";
import { getCities } from "@/lib/services/property";
import { slugifyCity } from "@/lib/seo";

const PHONE_DISPLAY = "+254 743 634 581";
const PHONE_HREF = "tel:+254743634581";
const EMAIL = "info@allpropertylink.com";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61593598572272";
const INSTAGRAM_URL = "https://www.instagram.com/allproperty.link/";

const browseLinks = [
  { href: "/properties", label: "Properties" },
  { href: "/airbnbs", label: "Airbnbs" },
  { href: "/land", label: "Plots & Land" },
  { href: "/services?type=FUNDI", label: "Fundis" },
  { href: "/services?type=SERVICE_PROVIDER", label: "Services" },
  { href: "/favorites", label: "Saved listings" },
];

const partnerLinks = [
  { href: "/auth/register?role=PROPERTY_OWNER", label: "List a property" },
  { href: "/auth/register?role=AGENT", label: "List property as an agent" },
  {
    href: "/auth/register?role=SERVICE_PROVIDER",
    label: "Offer a service (fundi, cleaning, security)",
  },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/aplreps", label: "APL Reps" },
  { href: "/faq", label: "FAQ" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms" },
];

const cityAllowList = new Set(
  [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Kiambu", "Thika",
    "Ruiru", "Kikuyu", "Limuru", "Juja", "Gatundu", "Nyeri", "Karatina",
    "Othaya", "Muranga", "Kenol", "Kerugoya", "Kutus", "Mwea", "Kitengela",
    "Ngong", "Kajiado", "Loitokitok", "Narok", "Naivasha", "Gilgil", "Molo",
    "Njoro", "Turbo", "Soy", "Kapsabet", "Kitale", "Kiminili", "Kabarnet",
    "Lodwar", "Kapenguria", "Maralal", "Malindi", "Kilifi", "Mtwapa",
    "Watamu", "Ukunda", "Diani", "Kwale", "Voi", "Taveta", "Lamu",
    "Machakos", "Athi River", "Mavoko", "Kangundo", "Matuu", "Wote",
    "Kibwezi", "Meru", "Nanyuki", "Nyahururu", "Rumuruti", "Embu", "Chuka",
    "Kitui", "Mwingi", "Garissa", "Isiolo", "Marsabit", "Moyale", "Kisii",
    "Ogembo", "Nyamira", "Keroka", "Homa Bay", "Oyugis", "Mbita", "Siaya",
    "Bondo", "Kakamega", "Mumias", "Butere", "Webuye", "Bungoma", "Busia",
    "Mbale", "Awendo", "Migori", "Rongo", "Kehancha",
  ].map((c) => c.toLowerCase()),
);

function Column({
  title,
  links,
  section,
}: {
  title: string;
  links: { href: string; label: string }[];
  section: string;
}) {
  return (
    <div data-footer-section={section}>
      <h2 className="mb-4 font-heading text-base font-semibold text-text-primary">
        {title}
      </h2>
      <ul className="space-y-3 text-base text-text-secondary">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="touch-target inline-block py-1.5 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="touch-target inline-flex items-center gap-2 text-base text-text-secondary transition-colors hover:text-primary"
    >
      {children}
      <span>{label}</span>
    </a>
  );
}

function TrustBlock() {
  return (
    <div className="space-y-3 text-base text-text-secondary" data-footer-section="trust">
      <address className="flex items-start gap-2.5 not-italic">
        <MapPin size={16} className="mt-1 shrink-0 text-primary-400" />
        <span>Embassy House, 4th Floor, Harambee Avenue, Nairobi, Kenya</span>
      </address>
      <a
        href={PHONE_HREF}
        className="flex items-start gap-2.5 transition-colors hover:text-primary"
      >
        <Phone size={16} className="mt-1 shrink-0 text-primary-400" />
        <span>{PHONE_DISPLAY}</span>
      </a>
      <a
        href={`mailto:${EMAIL}`}
        className="flex items-start gap-2.5 transition-colors hover:text-primary"
      >
        <Mail size={16} className="mt-1 shrink-0 text-primary-400" />
        <span>{EMAIL}</span>
      </a>
      <p className="flex items-start gap-2.5">
        <Clock size={16} className="mt-1 shrink-0 text-primary-400" />
        <span>Mon&ndash;Sat, 8am&ndash;6pm EAT</span>
      </p>
      <Link
        href="/contact"
        className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary-600"
      >
        <MessageCircle size={16} className="shrink-0 text-accent-600" />
        Message us
      </Link>
    </div>
  );
}

async function CitiesBand() {
  const cities = await getCities();
  const allowed = cities
    .filter((c) => cityAllowList.has(c.city.toLowerCase()))
    .sort(
      (a, b) =>
        b._count.city - a._count.city || a.city.localeCompare(b.city),
    );

  if (allowed.length === 0) return null;

  const counted = allowed.slice(0, 8);
  const also = allowed.slice(8, 22);

  return (
    <nav
      aria-label="Popular cities"
      data-footer-section="cities"
      className="mt-10 border-t border-border pt-8"
    >
      <h2 className="mb-4 flex items-center gap-2 font-heading text-base font-semibold text-text-primary">
        <CitiesCovered size={18} className="text-accent-600" />
        Popular cities
      </h2>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-base text-text-secondary">
        {counted.map((c) => (
          <li key={c.city}>
            <Link
              href={`/properties/${slugifyCity(c.city)}`}
              className="touch-target inline-block py-1 transition-colors hover:text-primary"
            >
              {c.city}{" "}
              <span className="text-text-secondary/80">
                ({c._count.city.toLocaleString()})
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {also.length > 0 && (
        <p className="mt-4 text-base leading-relaxed text-text-secondary">
          <span className="font-semibold text-text-primary">
            Also covering:
          </span>{" "}
          {also.map((c, i) => (
            <span key={c.city}>
              <Link
                href={`/properties/${slugifyCity(c.city)}`}
                className="transition-colors hover:text-primary"
              >
                {c.city}
              </Link>
              {i < also.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
      )}
    </nav>
  );
}

function LegalFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-3 px-4 pt-8 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:flex-row md:pb-8">
        <p className="text-sm text-text-secondary">
          &copy; {new Date().getFullYear()} All Property Link. All rights
          reserved.
        </p>
        <ul className="flex items-center gap-5 text-sm text-text-secondary">
          {legalLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="touch-target inline-block py-1.5 transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

export function Footer({ variant = "full" }: { variant?: "full" | "legal" }) {
  if (variant === "legal") return <LegalFooter />;

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-content px-4 pt-10 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pt-12 md:pt-16 md:pb-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div data-footer-section="brand">
            <Link
              href="/"
              className="font-heading text-lg font-bold tracking-tight text-primary sm:text-xl"
            >
              All Property <span className="text-accent-600">Link</span>
            </Link>
            <p className="mt-2 max-w-md text-base text-text-secondary">
              Properties, stays, fundis, and service providers across Kenya.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
              <SocialLink href={FACEBOOK_URL} label="Facebook">
                <IconBrandFacebook size={18} aria-hidden />
              </SocialLink>
              <SocialLink href={INSTAGRAM_URL} label="Instagram">
                <IconBrandInstagram size={18} aria-hidden />
              </SocialLink>
            </div>
          </div>
          <TrustBlock />
        </div>

        <nav
          aria-label="Footer navigation"
          className="mt-10 grid gap-8 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8"
        >
          <Column title="Browse" links={browseLinks} section="browse" />
          <Column title="Partner with us" links={partnerLinks} section="partner" />
          <Column title="Company" links={companyLinks} section="company" />
          <Column title="Legal" links={legalLinks} section="legal" />
        </nav>

        <Suspense fallback={null}>
          <CitiesBand />
        </Suspense>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} All Property Link. Built for
            Kenya.
          </p>
          <a
            href="#top"
            className="touch-target inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
          >
            <ArrowUp size={16} aria-hidden />
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
