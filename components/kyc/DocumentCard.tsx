"use client"

import { Trash2, Loader2, FileText, ImageIcon, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { resolvePdfUrl } from "@/lib/pdf-utils"

interface DocumentCardProps {
  doc: {
    id: string
    documentType: string
    documentNumber: string | null
    status: string
    frontImage: string | null
    backImage: string | null
    rejectionReason: string | null
    createdAt: string
  }
  docTypeLabels: Record<string, string>

  deleting: string | null
  deleteConfirm: string | null
  onDeleteConfirm: (id: string) => void
  onDeleteCancel: () => void
  onDelete: (id: string) => void
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  NONE: { label: "Not Verified", icon: () => <ImageIcon size={12} className="text-muted" />, color: "text-muted", bg: "bg-gray-50", border: "border-muted/30" },
  PENDING: { label: "Pending", icon: () => <Loader2 size={12} className="animate-spin text-amber-600" />, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  VERIFIED: { label: "Verified", icon: () => <CheckCircle size={12} className="text-green-600" />, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  REJECTED: { label: "Rejected", icon: () => <XCircle size={12} className="text-red-600" />, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status]
  if (!cfg) return null
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", cfg.bg, cfg.color)}>
      <cfg.icon />
      {cfg.label}
    </span>
  )
}

function DocThumbnail({ src, label }: { src: string; label: string }) {
  const isPdf = src.match(/\.pdf/i)
  const url = isPdf ? resolvePdfUrl(src) : src
  
  if (isPdf) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-border bg-gray-50 p-2 text-sm text-muted hover:bg-gray-100">
        <FileText size={20} className="shrink-0 text-red-400" />
        <span>View PDF</span>
      </a>
    )
  }
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-border hover:ring-2 hover:ring-primary/50">
      <img src={src} alt={label} className="h-16 w-20 object-cover" />
    </a>
  )
}

export default function DocumentCard({
  doc,
  docTypeLabels,
  deleting,
  deleteConfirm,
  onDeleteConfirm,
  onDeleteCancel,
  onDelete,
}: DocumentCardProps) {
  const isRejected = doc.status === "REJECTED"
  const showDelete = isRejected && deleteConfirm !== doc.id
  const showConfirm = deleteConfirm === doc.id

  return (
    <div className="divide-y divide-border">
      <div className="px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {docTypeLabels[doc.documentType] || doc.documentType}
              </span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">Required</span>
              <StatusBadge status={doc.status} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              {doc.documentNumber && <span>#{doc.documentNumber}</span>}
              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
              {doc.rejectionReason && <span className="text-red-500">Reason: {doc.rejectionReason}</span>}
            </div>
            {(doc.frontImage || doc.backImage) && (
              <div className="mt-3 flex gap-3">
                {doc.frontImage && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted">Front</p>
                    <DocThumbnail src={doc.frontImage} label={doc.documentType} />
                  </div>
                )}
                {doc.backImage && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted">Back</p>
                    <DocThumbnail src={doc.backImage} label="Back" />
                  </div>
                )}
              </div>
            )}
          </div>
          {showDelete && (
            <button
              onClick={() => onDeleteConfirm(doc.id)}
              className="shrink-0 rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Delete permanently"
            >
              <Trash2 size={14} />
            </button>
          )}
          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onDeleteCancel}>
              <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                  <XCircle size={24} className="text-red-500" />
                  <h3 className="text-lg font-semibold">Delete submission?</h3>
                </div>
                <p className="mt-2 text-sm text-muted">This permanently deletes the rejected document. You can submit a new one later.</p>
                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={onDeleteCancel} className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    onClick={() => onDelete(doc.id)}
                    disabled={deleting === doc.id}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}