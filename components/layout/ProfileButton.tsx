"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function ProfileButton() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!user) {
    return (
      <div className="hidden items-center gap-2 md:flex">
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
    )
  }

  const isAgent = user.authMethod === "agent"
  const displayName = isAgent ? (user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email) : ([user.firstName, user.lastName].filter(Boolean).join(" ") || user.email)
  const initial = (isAgent ? (user.fullName || user.email) : (user.firstName || user.email)).charAt(0).toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="touch-target flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-surface-secondary hover:text-primary"
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-300 text-xs font-bold text-white">
          {initial}
        </span>
        <span className="hidden sm:block truncate max-w-[160px]">{displayName}</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-full z-50 mt-1 w-56 md:w-48 rounded-xl border border-border bg-surface py-1 shadow-lg">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-medium text-text-primary truncate">{displayName}</p>
              <p className="text-xs text-text-secondary truncate">{user.email}</p>
            </div>

            {isAgent ? (
              <>
                <Link
                  href="/dashboard/agent"
                  onClick={() => setOpen(false)}
                  className="touch-target flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary transition-colors hover:bg-surface-secondary"
                >
                  <svg className="h-4 w-4 text-accent-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.22-3.22a.75.75 0 111.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0L1.22 6.28a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                    <path d="M3.5 11.5l1.25 1.25a.75.75 0 001.06 0l5.69-5.69a.75.75 0 010 1.06l-5.69 5.69a.75.75 0 01-1.06 0L3.5 12.56V15a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V8a.75.75 0 011.5 0v7a2 2 0 01-2 2H4a2 2 0 01-2-2v-2.5z" />
                  </svg>
                  Agent Dashboard
                </Link>
                <Link
                  href="/dashboard/agent/settings"
                  onClick={() => setOpen(false)}
                  className="touch-target flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary transition-colors hover:bg-surface-secondary"
                >
                  <svg className="h-4 w-4 text-accent-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-.38-.9-.38-1.28 0l-1.47 1.47a.75.75 0 000 1.06l5.25 5.25a.75.75 0 001.06 0l1.47-1.47a.75.75 0 000-1.06l-5.25-5.25zM10 2a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0v-10.5A.75.75 0 0110 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="touch-target flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary transition-colors hover:bg-surface-secondary"
                >
                  <svg className="h-4 w-4 text-accent-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.22-3.22a.75.75 0 111.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0L1.22 6.28a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                    <path d="M3.5 11.5l1.25 1.25a.75.75 0 001.06 0l5.69-5.69a.75.75 0 010 1.06l-5.69 5.69a.75.75 0 01-1.06 0L3.5 12.56V15a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V8a.75.75 0 011.5 0v7a2 2 0 01-2 2H4a2 2 0 01-2-2v-2.5z" />
                  </svg>
                  Business Profile
                </Link>

                <Link
                  href="/dashboard/profile"
                  onClick={() => setOpen(false)}
                  className="touch-target flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary transition-colors hover:bg-surface-secondary"
                >
                  <svg className="h-4 w-4 text-accent-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                  </svg>
                  Personal Profile
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => { setOpen(false); logout(); router.refresh(); }}
              className="touch-target flex w-full items-center gap-3 px-4 py-2.5 text-sm text-error-500 transition-colors hover:bg-surface-secondary"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M17 4.25A2.25 2.25 0 0014.75 2h-5.5A2.25 2.25 0 007 4.25v2a.75.75 0 001.5 0v-2a.75.75 0 01.75-.75h5.5a.75.75 0 01.75.75v11.5a.75.75 0 01-.75.75h-5.5a.75.75 0 01-.75-.75v-2a.75.75 0 00-1.5 0v2A2.25 2.25 0 009.25 18h5.5A2.25 2.25 0 0017 15.75V4.25z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M1 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H1.75A.75.75 0 011 10z"
                  clipRule="evenodd"
                />
              </svg>
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  )
}