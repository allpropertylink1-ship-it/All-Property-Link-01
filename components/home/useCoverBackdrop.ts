"use client"

import { useState, useCallback } from "react"

export function useCoverBackdrop() {
  const [activeImage, setActiveImage] = useState<string | null>(null)

  const onImageEnter = useCallback((src: string | null) => {
    if (!src) return
    setActiveImage(src)
  }, [])

  const onImageLeave = useCallback(() => {
    setActiveImage(null)
  }, [])

  return { activeImage, onImageEnter, onImageLeave }
}
