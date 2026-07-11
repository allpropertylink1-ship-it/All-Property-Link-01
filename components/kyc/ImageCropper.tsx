"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Loader2, Check, X, ZoomIn, ZoomOut } from "lucide-react"

interface ImageCropperProps {
  imageUrl: string
  onCropComplete: (croppedBlob: Blob) => Promise<void>
  onCancel: () => void
  sideLabel?: string
}

type Handle = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se" | "move"

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

interface DragSession {
  handle: Handle
  startX: number
  startY: number
  rect: Rect
}

const MIN_CROP = 40

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

export default function ImageCropper({
  imageUrl,
  onCropComplete,
  onCancel,
  sideLabel,
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [natural, setNatural] = useState({ width: 0, height: 0 })
  const [loaded, setLoaded] = useState(false)
  const [container, setContainer] = useState({ width: 0, height: 0 })
  const [zoom, setZoom] = useState(1)
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, width: 200, height: 200 })
  const [drag, setDrag] = useState<DragSession | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setNatural({ width: img.naturalWidth, height: img.naturalHeight })
      setLoaded(true)
    }
    img.src = imageUrl
  }, [imageUrl])

  useEffect(() => {
    const el = containerRef.current
    if (!el || !loaded) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setContainer({ width, height })
      setRect({
        x: width * 0.1,
        y: height * 0.1,
        width: width * 0.8,
        height: height * 0.8,
      })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [loaded])

  const display = useCallback(() => {
    if (!natural.width || !container.width) return { w: 0, h: 0, ox: 0, oy: 0 }
    const ca = container.width / container.height
    const ia = natural.width / natural.height
    let w: number, h: number
    if (ia > ca) { w = container.width; h = container.width / ia }
    else { h = container.height; w = container.height * ia }
    w *= zoom; h *= zoom
    return { w, h, ox: (container.width - w) / 2, oy: (container.height - h) / 2 }
  }, [natural, container, zoom])

  const onPointerDown = useCallback((e: React.PointerEvent, handle: Handle) => {
    e.preventDefault()
    e.stopPropagation()
    const el = containerRef.current
    if (!el) return
    el.setPointerCapture(e.pointerId)
    setDrag({ handle, startX: e.clientX, startY: e.clientY, rect: { ...rect } })
  }, [rect])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag || !container.width) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    const r = { ...drag.rect }
    const cw = container.width
    const ch = container.height

    switch (drag.handle) {
      case "move": {
        r.x = clamp(drag.rect.x + dx, 0, cw - r.width)
        r.y = clamp(drag.rect.y + dy, 0, ch - r.height)
        break
      }
      case "nw": {
        let x = drag.rect.x + dx, w = drag.rect.width - dx
        if (w < MIN_CROP) { w = MIN_CROP; x = drag.rect.x + drag.rect.width - MIN_CROP }
        let y = drag.rect.y + dy, h = drag.rect.height - dy
        if (h < MIN_CROP) { h = MIN_CROP; y = drag.rect.y + drag.rect.height - MIN_CROP }
        r.x = x; r.y = y; r.width = w; r.height = h
        break
      }
      case "n": {
        let y = drag.rect.y + dy, h = drag.rect.height - dy
        if (h < MIN_CROP) { h = MIN_CROP; y = drag.rect.y + drag.rect.height - MIN_CROP }
        r.y = y; r.height = h; break
      }
      case "ne": {
        let y = drag.rect.y + dy, h = drag.rect.height - dy
        if (h < MIN_CROP) { h = MIN_CROP; y = drag.rect.y + drag.rect.height - MIN_CROP }
        let w = drag.rect.width + dx
        if (w < MIN_CROP) w = MIN_CROP
        r.y = y; r.width = w; r.height = h; break
      }
      case "w": {
        let x = drag.rect.x + dx, w = drag.rect.width - dx
        if (w < MIN_CROP) { w = MIN_CROP; x = drag.rect.x + drag.rect.width - MIN_CROP }
        r.x = x; r.width = w; break
      }
      case "e": {
        let w = drag.rect.width + dx
        if (w < MIN_CROP) w = MIN_CROP
        r.width = w; break
      }
      case "sw": {
        let x = drag.rect.x + dx, w = drag.rect.width - dx
        if (w < MIN_CROP) { w = MIN_CROP; x = drag.rect.x + drag.rect.width - MIN_CROP }
        let h = drag.rect.height + dy
        if (h < MIN_CROP) h = MIN_CROP
        r.x = x; r.width = w; r.height = h; break
      }
      case "s": {
        let h = drag.rect.height + dy
        if (h < MIN_CROP) h = MIN_CROP
        r.height = h; break
      }
      case "se": {
        let w = drag.rect.width + dx, h = drag.rect.height + dy
        if (w < MIN_CROP) w = MIN_CROP
        if (h < MIN_CROP) h = MIN_CROP
        r.width = w; r.height = h; break
      }
    }

    r.x = clamp(r.x, 0, cw - r.width)
    r.y = clamp(r.y, 0, ch - r.height)
    r.width = clamp(r.width, MIN_CROP, cw - r.x)
    r.height = clamp(r.height, MIN_CROP, ch - r.y)
    setRect(r)
  }, [drag, container])

  const onPointerUp = useCallback(() => {
    setDrag(null)
  }, [])

  async function cropBlob(): Promise<Blob> {
    const img = new Image()
    img.src = imageUrl
    await new Promise((r) => { img.onload = r })

    const d = display()
    const sx = natural.width / d.w
    const sy = natural.height / d.h
    const srcX = (rect.x - d.ox) * sx
    const srcY = (rect.y - d.oy) * sy
    const srcW = rect.width * sx
    const srcH = rect.height * sy

    const canvas = document.createElement("canvas")
    canvas.width = srcW
    canvas.height = srcH
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH)

    return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92))
  }

  const handleSave = async () => {
    if (rect.width < MIN_CROP || rect.height < MIN_CROP) return
    setSaving(true)
    try {
      const blob = await cropBlob()
      await onCropComplete(blob)
    } catch {
      setSaving(false)
    }
  }

  const d = display()
  const hasRect = rect.width > 0 && rect.height > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="mx-4 w-full max-w-2xl rounded-xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Crop {sideLabel || "Image"}
            </h3>
            <p className="text-sm text-gray-500">
              Drag the corners or edges to crop freely. Drag inside to reposition.
            </p>
          </div>
          <button onClick={onCancel} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div
          ref={containerRef}
          className="relative h-96 w-full overflow-hidden bg-gray-900 touch-none"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ cursor: drag ? (drag.handle === "move" ? "grabbing" : undefined) : undefined }}
        >
          {loaded && d.w > 0 && (
            <>
              <img
                src={imageUrl}
                alt=""
                className="absolute pointer-events-none"
                style={{ width: d.w, height: d.h, left: d.ox, top: d.oy }}
                draggable={false}
              />

              <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
                <defs>
                  <mask id="cm">
                    <rect width="100%" height="100%" fill="white" />
                    {hasRect && (
                      <rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill="black" />
                    )}
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#cm)" />
              </svg>

              <div
                className="absolute border-2 border-white"
                style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
                onPointerDown={(e) => onPointerDown(e, "move")}
              >
                <Handle onPointerDown={(e) => onPointerDown(e, "nw")} className="-top-1.5 -left-1.5 cursor-nw-resize" />
                <Handle onPointerDown={(e) => onPointerDown(e, "ne")} className="-top-1.5 -right-1.5 cursor-ne-resize" />
                <Handle onPointerDown={(e) => onPointerDown(e, "sw")} className="-bottom-1.5 -left-1.5 cursor-sw-resize" />
                <Handle onPointerDown={(e) => onPointerDown(e, "se")} className="-bottom-1.5 -right-1.5 cursor-se-resize" />
                <Handle onPointerDown={(e) => onPointerDown(e, "n")} className="-top-1.5 left-1/2 -translate-x-1/2 cursor-n-resize" />
                <Handle onPointerDown={(e) => onPointerDown(e, "s")} className="-bottom-1.5 left-1/2 -translate-x-1/2 cursor-s-resize" />
                <Handle onPointerDown={(e) => onPointerDown(e, "w")} className="-left-1.5 top-1/2 -translate-y-1/2 cursor-w-resize" />
                <Handle onPointerDown={(e) => onPointerDown(e, "e")} className="-right-1.5 top-1/2 -translate-y-1/2 cursor-e-resize" />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 border-t px-6 py-4">
          <span className="text-xs font-medium text-gray-500 min-w-20">
            {Math.round(rect.width)} &times; {Math.round(rect.height)} px
          </span>

          <div className="flex items-center gap-2">
            <ZoomOut size={18} className="text-gray-500" />
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-2 w-32 cursor-pointer appearance-none rounded-full bg-gray-200 accent-teal-600"
            />
            <ZoomIn size={18} className="text-gray-500" />
          </div>

          <div className="ml-auto flex gap-3">
            <button
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasRect}
              className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? "Saving..." : "Apply Crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Handle({ onPointerDown, className }: { onPointerDown: (e: React.PointerEvent) => void; className: string }) {
  return (
    <div
      className={`absolute z-10 h-3 w-3 rounded-full border-2 border-white bg-teal-600 shadow-sm ${className}`}
      onPointerDown={onPointerDown}
    />
  )
}
