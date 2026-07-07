"use client"

import { Upload, Loader2, X, FileText, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  preview: string | null
  fileUrl: string
  uploading: boolean
  isPdf: boolean
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
  accept: string
  label: string
  sizeHint?: string
  showRemove?: boolean
}

export default function UploadZone({
  preview,
  fileUrl,
  uploading,
  isPdf,
  onSelect,
  onRemove,
  accept,
  label,
  sizeHint,
  showRemove = true,
}: UploadZoneProps) {
  if (preview) {
    return (
      <div className="space-y-2">
        <div className="relative h-44 rounded-lg border border-dashed border-muted/50 bg-background">
          {isPdf ? (
            <div className="flex h-full w-full items-center justify-center gap-2 rounded-lg bg-gray-50">
              <FileText size={32} className="text-red-400" />
              <div className="flex flex-col">
                <p className="text-sm font-medium text-foreground truncate">{label}</p>
                <p className="text-xs text-muted">PDF ready</p>
              </div>
            </div>
          ) : (
            <img src={preview} alt={label} className="h-full w-full rounded-lg object-cover" />
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>
        {showRemove && fileUrl && !uploading && (
          <button type="button" onClick={onRemove} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
            <X size={12} /> Remove
          </button>
        )}
      </div>
    )
  }

  return (
    <label className={cn(
      "flex h-44 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted/50 bg-background transition-colors",
      "hover:border-primary/50 hover:bg-primary/5"
    )}>
      <Upload className="mb-2 h-6 w-6 text-muted" />
      <span className="text-sm text-muted">Click to upload {label.toLowerCase()}</span>
      {sizeHint && <span className="mt-1 text-xs text-muted">{sizeHint}</span>}
      <input type="file" accept={accept} onChange={onSelect} className="hidden" />
    </label>
  )
}