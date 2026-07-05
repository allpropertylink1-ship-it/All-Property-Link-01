"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const menuItems = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "#", label: "Airbnbs" },
  { href: "#", label: "Fundis" },
  { href: "#", label: "Services" },
  { href: "/properties?type=LAND", label: "Plots & Land" },
  { href: "/about", label: "About" },
];

export function MobileMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="touch-target relative inline-flex items-center justify-center rounded-lg text-secondary md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <div className="flex w-6 flex-col items-center gap-[5px]">
          <span
            className={`block h-[2px] w-5 rounded-full bg-current transition-all duration-300 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-5 rounded-full bg-current transition-all duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-5 rounded-full bg-current transition-all duration-300 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </div>
      </button>

      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-secondary transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex flex-col items-center gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-lg font-medium text-secondary transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-12 flex flex-col items-center gap-4">
          {user ? (
            <>
              <div className="mb-2 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent-300 text-lg font-bold text-white">
                  {(user.firstName || user.email).charAt(0).toUpperCase()}
                </div>
                <p className="text-sm font-medium text-text-primary">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-text-secondary">{user.email}</p>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-accent-300 transition-colors hover:text-accent-400"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-accent-300 transition-colors hover:text-accent-400"
              >
                My Profile
              </Link>
              <button
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await logout();
                  router.refresh();
                }}
                className="text-sm font-medium text-error-500 transition-colors hover:text-error-400"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-secondary transition-colors hover:text-primary"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-lg bg-accent-300 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-400"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
