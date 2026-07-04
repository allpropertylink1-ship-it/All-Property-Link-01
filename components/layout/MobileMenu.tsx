"use client";

import { useState } from "react";
import Link from "next/link";

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
        </div>
      </div>
    </>
  );
}
