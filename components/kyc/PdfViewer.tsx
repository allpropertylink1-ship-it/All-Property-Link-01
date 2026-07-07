"use client"

import { useState } from "react"
import { FileText, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PdfViewerProps {
  url: string
  label?: string
  compact?: boolean
}

export default function PdfViewer({ url, label = "Document", compact }: PdfViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const proxyUrl = `/api/upload/proxy?url=${encodeURIComponent(url)}`

  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-gray-50 text-muted",
        compact ? "h-20 w-28" : "py-10"
      )}>
        <FileText size={compact ? 16 : 32} className="text-red-400" />
        <span className="text-xs">Failed to load</span>
        <a href={url} target="_blank" rel="noopener noreferrer" download
          className="text-xs text-primary hover:underline"
        >
          <Download size={12} className="inline mr-1" />Download
        </a>
      </div>
    )
  }

  if (compact) {
    return (
      <a href={proxyUrl} target="_blank" rel="noopener noreferrer"
        className={cn("flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-gray-50 text-xs text-muted hover:bg-gray-100 hover:text-primary transition-colors",
          "h-20 w-28"
        )}
      >
        <FileText size={20} className="text-red-400" />
        View PDF
      </a>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-red-400" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <div className="relative overflow-hidden rounded-lg border border-border bg-gray-50" style={{ height: "400px" }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-muted" />
          </div>
        )}
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted">
            <FileText size={48} className="text-red-400" />
            <p className="text-sm font-medium">Failed to load PDF</p>
          </div>
        ) : (
          <iframe
            src={proxyUrl}
            className="h-full w-full border-0"
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true) }}
            title={label}
          />
        )}
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" download
        className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
      >
        <Download size={12} /> Download PDF
      </a>
    </div>
  )
}