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
        className={cn("flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-gray-50 text-xs text-muted hover:bg-gray-100 hover:text-primary transition-colors",
          "h-20 w-28"
        )}
      >
        <FileText size={20} className="text-red-400" />
        <span className="flex items-center gap-1">
          View PDF <ExternalLink size={10} />
        </span>
      </a>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-red-400" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <a href={directUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-lg border border-border bg-gray-50 py-10 text-sm text-muted transition-colors hover:bg-gray-100 hover:text-primary"
      >
        <FileText size={24} className="text-red-400" />
        Open PDF <ExternalLink size={14} />
      </a>
      <a href={directUrl} target="_blank" rel="noopener noreferrer" download
        className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
      >
        <Download size={12} /> Download PDF
      </a>
    </div>
  )
}
