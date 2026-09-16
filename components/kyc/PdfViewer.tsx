"use client"

import { FileText, ExternalLink, Download } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { resolvePdfUrl } from "@/lib/pdf-utils"

interface PdfViewerProps {
  url: string
  label?: string
  compact?: boolean
}

export default function PdfViewer({ url, label = "Document", compact }: PdfViewerProps) {
  const directUrl = resolvePdfUrl(url)

  if (compact) {
    return (
      <a href={directUrl} target="_blank" rel="noopener noreferrer"
        className={cn("touch-target flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-surface-secondary text-xs text-text-secondary hover:bg-surface hover:text-primary-600 transition-colors",
          "h-20 w-28"
        )}
      >
        <FileText size={20} className="text-error-500" />
        <span className="flex items-center gap-1">
          View PDF <ExternalLink size={10} />
        </span>
      </a>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-error-500" />
        <span className="text-sm font-medium text-text-primary">{label}</span>
      </div>
      <a href={directUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-secondary py-10 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-primary-600"
      >
        <FileText size={24} className="text-error-500" />
        Open PDF <ExternalLink size={14} />
      </a>
      <a href={directUrl} target="_blank" rel="noopener noreferrer" download
        className="touch-target inline-flex items-center gap-1 rounded-lg px-1 py-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
      >
        <Download size={12} /> Download PDF
      </a>
    </div>
  )
}
