"use client"

import { useState, useCallback, useEffect, useRef } from "react"

const CROSSFADE_MS = 500

export function useCoverBackdrop() {
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [prevImage, setPrevImage] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onImageEnter = useCallback((src: string | null) => {
    if (!src || src === activeImage) return
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setPrevImage(activeImage)
    setActiveImage(src)
  }, [activeImage])

  const onImageLeave = useCallback(() => {
    setPrevImage(activeImage)
    setActiveImage(null)
    timerRef.current = setTimeout(() => setPrevImage(null), CROSSFADE_MS)
  }, [activeImage])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { activeImage, prevImage, onImageEnter, onImageLeave }
}
