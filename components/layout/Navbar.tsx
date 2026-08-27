"use client"

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { Briefcase } from "@/components/ui/icons";
import dynamic from "next/dynamic";

const ClientProfileButton = dynamic(() => import("./ProfileButton").then(mod => mod.ProfileButton), { ssr: false });

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/properties", label: "Properties" },
  { href: "/services", label: "Services" },
  { href: "/properties?type=LAND", label: "Plots & Land" },
  { href: "/aplreps", label: "Reps" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const { user } = useAuth()
  const isAgent = user?.authMethod === "agent"

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logos/logo.png"
            alt="All Property Link"
            width={756}
            height={319}
            className="h-9 w-auto"
            priority
          />
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
          {isAgent && (
            <Link
              href="/dashboard/agent"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              <Briefcase size={16} />
              Agent Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1">
          <ClientProfileButton />
        </div>

      </div>
    </nav>
  );
}
