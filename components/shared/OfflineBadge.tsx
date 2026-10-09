"use client"

import { useEffect, useState } from "react"
import { isOnline, subscribeOnlineStatus } from "@/lib/api-client"

// Lane D (offline-honest, v1): purely presentational badge.
// Shows only when browser reports offline. No queue / retry UI here.
export default function OfflineBadge() {
  const [online, setOnline] = useState<boolean>(true)

  useEffect(() => {
    setOnline(isOnline())
    return subscribeOnlineStatus(setOnline)
  }, [])

  if (online) return null

  return (
    <div
      aria-live="polite"
      role="status"
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-2"
    >
      <p className="rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white shadow-lg">
        You&apos;re offline — browsing saved content
      </p>
    </div>
  )
}
