import Link from "next/link";
import { MobileMenu } from "./MobileMenu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "#", label: "Airbnbs" },
  { href: "#", label: "Fundis" },
  { href: "/properties?type=LAND", label: "Plots & Land" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4">
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-tight text-primary"
        >
          All Property{" "}
          <span className="text-accent-300">Link</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-secondary transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/auth/login"
            className="touch-target inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-primary"
          >
            Log in
          </Link>
          <Link
            href="/auth/register"
            className="touch-target inline-flex items-center justify-center rounded-lg bg-accent-300 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-400"
          >
            Register
          </Link>
        </div>

        <MobileMenu />
      </div>
    </nav>
  );
}
