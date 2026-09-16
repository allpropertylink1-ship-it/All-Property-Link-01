/* eslint-disable @next/next/no-img-element */
"use client"

import { Trash2, Loader2, FileText, ImageIcon, CheckCircle, XCircle } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { resolvePdfUrl } from "@/lib/pdf-utils"
import { resolveImageUrl } from "@/lib/images";

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
  NONE: { label: "Not Verified", icon: () => <ImageIcon size={12} className="text-text-secondary" />, color: "text-text-secondary", bg: "bg-surface-secondary", border: "border-border" },
  PENDING: { label: "Pending", icon: () => <Loader2 size={12} className="animate-spin text-warning-600" />, color: "text-warning-600", bg: "bg-warning-50", border: "border-warning-200" },
  VERIFIED: { label: "Verified", icon: () => <CheckCircle size={12} className="text-success-600" />, color: "text-success-600", bg: "bg-success-50", border: "border-success-500/30" },
  REJECTED: { label: "Rejected", icon: () => <XCircle size={12} className="text-error-600" />, color: "text-error-600", bg: "bg-error-50", border: "border-error-200" },
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

function DocThumbnail({ src, label }: { src: string | null; label: string }) {
  if (!src) return null;
  const isPdf = src.match(/\.pdf/i)
  const abs = resolveImageUrl(src) ?? src
  const url = isPdf ? resolvePdfUrl(abs) : abs
  
  if (isPdf) {
    return (
      <a href={url ?? "#"} target="_blank" rel="noopener noreferrer" className="touch-target flex items-center gap-2 rounded-lg border border-border bg-surface-secondary p-2 text-sm text-text-secondary hover:bg-surface">
        <FileText size={20} className="shrink-0 text-error-500" />
        <span>View PDF</span>
      </a>
    )
  }
  return (
    <a href={url ?? "#"} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-border hover:ring-2 hover:ring-primary-600/30">
      <img src={url ?? undefined} alt={label} className="h-16 w-20 object-cover" />
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
              <span className="text-sm font-medium text-text-primary">
                {docTypeLabels[doc.documentType] || doc.documentType}
              </span>
              <span className="rounded bg-primary-600/10 px-1.5 py-0.5 text-[10px] font-medium text-primary-700">Required</span>
              <StatusBadge status={doc.status} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
              {doc.documentNumber && <span>#{doc.documentNumber}</span>}
              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
              {doc.rejectionReason && <span className="text-error-600">Reason: {doc.rejectionReason}</span>}
            </div>
            {(doc.frontImage || doc.backImage) && (
              <div className="mt-3 flex gap-3">
                {doc.frontImage && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-text-secondary">Front</p>
                    <DocThumbnail src={doc.frontImage} label={doc.documentType} />
                  </div>
                )}
                {doc.backImage && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-text-secondary">Back</p>
                    <DocThumbnail src={doc.backImage} label="Back" />
                  </div>
                )}
              </div>
            )}
          </div>
          {showDelete && (
            <button
              onClick={() => onDeleteConfirm(doc.id)}
              aria-label="Delete rejected document"
              className="touch-target shrink-0 rounded-lg p-2.5 text-error-500 hover:bg-error-50 hover:text-error-600 transition-colors"
              title="Delete permanently"
            >
              <Trash2 size={14} />
            </button>
          )}
          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/50 p-4" onClick={onDeleteCancel} role="dialog" aria-modal="true" aria-labelledby="doc-delete-title">
              <div className="mx-4 w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-lg max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                  <XCircle size={24} className="text-error-500" />
                  <h3 id="doc-delete-title" className="font-heading text-lg font-semibold text-text-primary">Delete submission?</h3>
                </div>
                <p className="mt-2 text-sm text-text-secondary">This permanently deletes the rejected document. You can submit a new one later.</p>
                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={onDeleteCancel} className="touch-target rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary">
                    Cancel
                  </button>
                  <button
                    onClick={() => onDelete(doc.id)}
                    disabled={deleting === doc.id}
                    className="touch-target flex items-center gap-2 rounded-lg bg-error-600 px-4 py-2 text-sm font-medium text-white hover:bg-error-700 disabled:opacity-50"
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