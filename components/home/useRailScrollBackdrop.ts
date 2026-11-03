"use client"

import { useCallback, useEffect, useRef } from "react"

/**
 * Tracks a horizontal snap rail's scroll position and calls onImageEnter
 * with the image of the currently most-visible card. Used on mobile to
 * drive the backdrop automatically as the user swipes across listings.
 */
export function useRailScrollBackdrop(
  images: string[],
  onImageEnter: (src: string | null) => void,
  enabled = true
) {
  const containerRef = useRef<HTMLDivElement>(null)

  const onScroll = useCallback(() => {
    if (!enabled || images.length === 0) return
    const container = containerRef.current
    if (!container) return
    const { scrollLeft, clientWidth } = container
    const index = Math.round(scrollLeft / clientWidth)
    const clamped = Math.min(Math.max(index, 0), images.length - 1)
    const img = images[clamped]
    if (img) onImageEnter(img)
  }, [images, onImageEnter, enabled])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener("scroll", onScroll, { passive: true })
    return () => container.removeEventListener("scroll", onScroll)
  }, [onScroll])

  return containerRef
}
