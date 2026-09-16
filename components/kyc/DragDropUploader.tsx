/* eslint-disable @next/next/no-img-element */
"use client"

import { useRef, useState } from "react"
import { Upload, Camera } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { HEIC_HINT, isHeicFile } from "@/lib/image-client"

interface DragDropUploaderProps {
  label: string
  hint?: string
  accept?: string
  onFile: (file: File) => void
  onError?: (msg: string) => void
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
const MAX_BYTES = 10 * 1024 * 1024

export default function DragDropUploader({
  label,
  hint = "JPG, PNG or WebP, max 10MB",
  accept = "image/jpeg,image/png,image/webp,image/jpg",
  onFile,
  onError,
}: DragDropUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const validateAndEmit = (file: File | undefined | null) => {
    if (!file) return
    if (isHeicFile(file)) { onError?.(HEIC_HINT); return }
    if (!ALLOWED.includes(file.type)) {
      onError?.("Only JPEG, PNG and WebP are allowed")
      return
    }
    if (file.size > MAX_BYTES) {
      onError?.("File must be under 10MB")
      return
    }
    onFile(file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        validateAndEmit(e.dataTransfer.files?.[0])
      }}
      className={cn(
        "touch-target flex min-h-[44px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-surface-secondary p-6 transition-colors",
        dragging ? "border-primary-600 bg-primary-50" : "border-border hover:border-primary-500 hover:bg-primary-50/50"
      )}
      onClick={() => fileRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click() }}
      aria-label={`Upload ${label} — drag and drop or click to browse`}
    >
      <Upload className="mb-2 h-6 w-6 text-text-secondary" />
      <span className="text-sm font-medium text-text-primary">
        {dragging ? "Drop image here" : `Drag & drop or click to upload ${label.toLowerCase()}`}
      </span>
      <span className="mt-1 text-xs text-text-secondary">{hint}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); cameraRef.current?.click() }}
        className="touch-target mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-secondary"
      >
        <Camera size={14} /> Use camera
      </button>
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { validateAndEmit(e.target.files?.[0]); e.target.value = "" }}
        onClick={(e) => e.stopPropagation()}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        {...{ capture: "environment" }}
        className="hidden"
        onChange={(e) => { validateAndEmit(e.target.files?.[0]); e.target.value = "" }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
