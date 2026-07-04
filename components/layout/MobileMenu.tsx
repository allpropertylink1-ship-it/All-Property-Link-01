"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileMenu({ user }: { user: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="touch-target inline-flex items-center justify-center rounded-lg p-2 text-text-secondary hover:text-text-primary sm:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-16 z-50 border-b border-border bg-surface px-4 pb-4 pt-2 shadow-lg sm:hidden">
            <div className="flex flex-col gap-3">
              <Link
                href="/properties"
                onClick={() => setOpen(false)}
                className="touch-target rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              >
                Browse
              </Link>
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="touch-target inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-text-on-primary hover:bg-primary-700"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="touch-target inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-text-on-primary hover:bg-primary-700"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
