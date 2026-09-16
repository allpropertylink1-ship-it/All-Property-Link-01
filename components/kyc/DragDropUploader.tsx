/* eslint-disable @next/next/no-img-element */
"use client"

import { useRef, useState } from "react"
import { Upload, Camera } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

interface DragDropUploaderProps {
  label: string
  hint?: string
  accept?: string
  onFile: (file: File) => void
  onError?: (msg: string) => void
}

const ALLOWED = ["image/jpeg", "image/png", "image/jpg"]
const MAX_BYTES = 10 * 1024 * 1024

export default function DragDropUploader({
  label,
  hint = "JPG or PNG, max 10MB",
  accept = "image/jpeg,image/png,image/jpg",
  onFile,
  onError,
}: DragDropUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const validateAndEmit = (file: File | undefined | null) => {
    if (!file) return
    if (!ALLOWED.includes(file.type)) {
      onError?.("Only JPG and PNG files are allowed")
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
        "flex h-44 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-background transition-colors",
        dragging ? "border-primary bg-primary/10" : "border-muted/50 hover:border-primary/50 hover:bg-primary/5"
      )}
      onClick={() => fileRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click() }}
      aria-label={`Upload ${label} — drag and drop or click to browse`}
    >
      <Upload className="mb-2 h-6 w-6 text-muted" />
      <span className="text-sm text-muted">
        {dragging ? "Drop image here" : `Drag & drop or click to upload ${label.toLowerCase()}`}
      </span>
      <span className="mt-1 text-xs text-muted">{hint}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); cameraRef.current?.click() }}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-gray-50"
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
