"use client"

import { useState, useEffect, useRef, useCallback } from "react"

const CROSSFADE_MS = 700

export function useCoverBackdrop() {
  const [activeCover, setActiveCover] = useState<string | null>(null)
  const [prevCover, setPrevCover] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reducedMotionRef = useRef<boolean | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    }
  }, [])

  const onCoverEnter = useCallback(
    (src: string | null) => {
      if (!src) return
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (reducedMotionRef.current) {
        setPrevCover(null)
        setActiveCover(src)
        return
      }
      setPrevCover(activeCover)
      setActiveCover(src)
    },
    [activeCover]
  )

  const onCoverLeave = useCallback(() => {
    if (reducedMotionRef.current) {
      setActiveCover(null)
      return
    }
    setPrevCover(activeCover)
    setActiveCover(null)
    timerRef.current = setTimeout(() => setPrevCover(null), CROSSFADE_MS)
  }, [activeCover])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { activeCover, prevCover, onCoverEnter, onCoverLeave }
}
