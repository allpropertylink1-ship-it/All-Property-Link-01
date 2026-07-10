import Link from "next/link";
import { MobileMenu } from "./MobileMenu";
import { ProfileButton } from "./ProfileButton";
import { ThemeToggle } from "./ThemeToggle";

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

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <ProfileButton />
        </div>

        <MobileMenu />
      </div>
    </nav>
  );
}
