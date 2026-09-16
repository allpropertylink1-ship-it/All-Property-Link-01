/* eslint-disable @next/next/no-img-element */
"use client"

import { Upload, Loader2, X, FileText } from "@/components/ui/icons"
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
        <div className="relative h-44 rounded-xl border border-dashed border-border bg-surface-secondary">
          {isPdf ? (
            <div className="flex h-full w-full items-center justify-center gap-2 rounded-xl bg-surface-secondary">
              <FileText size={32} className="text-error-500" />
              <div className="flex flex-col">
                <p className="text-sm font-medium text-text-primary truncate">{label}</p>
                <p className="text-xs text-text-secondary">PDF ready</p>
              </div>
            </div>
          ) : (
            <img src={preview} alt={label} className="h-full w-full rounded-xl object-cover" />
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-text-primary/50" role="status" aria-label="Uploading">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>
        {showRemove && fileUrl && !uploading && (
          <button type="button" onClick={onRemove} className="touch-target inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-error-600 hover:bg-error-50">
            <X size={12} /> Remove
          </button>
        )}
      </div>
    )
  }

  return (
    <label className={cn(
      "touch-target flex min-h-[44px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-secondary p-6 transition-colors",
      "hover:border-primary-500 hover:bg-primary-50/50"
    )}>
      <Upload className="mb-2 h-6 w-6 text-text-secondary" />
      <span className="text-sm font-medium text-text-primary">Click to upload {label.toLowerCase()}</span>
      {sizeHint && <span className="mt-1 text-xs text-text-secondary">{sizeHint}</span>}
      <input type="file" accept={accept} onChange={onSelect} className="hidden" aria-label={`Upload ${label}`} />
    </label>
  )
}