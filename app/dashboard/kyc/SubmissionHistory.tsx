/* eslint-disable @next/next/no-img-element */
"use client"

import { Shield, XCircle, Trash2 } from "@/components/ui/icons"
import PdfViewer from "@/components/kyc/PdfViewer"
import { cn } from "@/lib/utils"
import { resolveImageUrl } from "@/lib/images";

interface KycDocument {
  id: string
  documentType: string
  documentNumber: string
  frontImage: string
  backImage: string | null
  businessPermit: string | null
  bioData: { firstName?: string; middleName?: string; lastName?: string; phone?: string; email?: string } | null
  status: string
  rejectionReason: string | null
  createdAt: string
}

interface Props {
  documents: KycDocument[]
  onDelete: (docId: string) => void
  deleteConfirm: string | null
  setDeleteConfirm: (id: string | null) => void
}

const LABELS: Record<string, string> = {
  NATIONAL_ID: "National ID Card", DRIVERS_LICENSE: "Driver's License", PASSPORT: "Passport",
}

const STATUS: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  NONE: { label: "Not Verified", icon: Shield, color: "text-text-secondary", bg: "bg-surface-secondary" },
  PENDING: { label: "Pending Review", icon: Shield, color: "text-warning-600", bg: "bg-warning-50" },
  VERIFIED: { label: "Verified", icon: Shield, color: "text-success-600", bg: "bg-success-50" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "text-error-600", bg: "bg-error-50" },
}

function Badge({ status }: { status: string }) {
  const s = STATUS[status] || STATUS.NONE
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", s.color, s.bg)}>
      <s.icon size={12} /> {s.label}
    </span>
  )
}

function isPdf(url: string) { return /\.pdf$/i.test(url) }

export function SubmissionHistory({ documents, onDelete, deleteConfirm, setDeleteConfirm }: Props) {
  return (
    <>
      <section aria-labelledby="kyc-history-heading" className="rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-6 py-4">
          <h2 id="kyc-history-heading" className="font-heading text-base font-semibold text-text-primary">Submission History</h2>
        </div>
        {documents.length > 0 ? (
          <ul className="divide-y divide-border">
            {documents.map(doc => (
              <li key={doc.id} className="flex items-start justify-between gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{LABELS[doc.documentType] || doc.documentType}</span>
                    <span className="rounded bg-primary-600/10 px-1.5 py-0.5 text-[10px] font-medium text-primary-700">Required</span>
                    <Badge status={doc.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
                    {doc.documentNumber && <span>#{doc.documentNumber}</span>}
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    {doc.rejectionReason && <span className="text-error-600">Reason: {doc.rejectionReason}</span>}
                  </div>
                  {doc.bioData && (
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-text-secondary">
                      <span>{doc.bioData.firstName} {doc.bioData.middleName} {doc.bioData.lastName}</span>
                      {doc.bioData.phone && <span>&middot; {doc.bioData.phone}</span>}
                      {doc.bioData.email && <span>&middot; {doc.bioData.email}</span>}
                    </div>
                  )}
                  {(doc.frontImage || doc.backImage || doc.businessPermit) && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {doc.frontImage && (isPdf(doc.frontImage) ? <PdfViewer url={resolveImageUrl(doc.frontImage) ?? doc.frontImage} compact /> : <img src={resolveImageUrl(doc.frontImage) ?? doc.frontImage} alt="" className="h-14 w-20 rounded object-cover" />)}
                      {doc.backImage && (isPdf(doc.backImage) ? <PdfViewer url={resolveImageUrl(doc.backImage) ?? doc.backImage} compact /> : <img src={resolveImageUrl(doc.backImage) ?? doc.backImage} alt="" className="h-14 w-20 rounded object-cover" />)}
                      {doc.businessPermit && <PdfViewer url={doc.businessPermit} compact />}
                    </div>
                  )}
                </div>
                {doc.status === "REJECTED" && (
                  <button type="button" onClick={() => setDeleteConfirm(doc.id)} aria-label="Delete rejected submission" className="touch-target shrink-0 rounded-lg p-2.5 text-error-500 hover:bg-error-50 hover:text-error-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-10 text-center">
            <Shield size={32} className="mx-auto text-text-secondary" />
            <p className="mt-2 text-sm text-text-secondary">No submissions yet</p>
          </div>
        )}
      </section>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/50 p-4" onClick={() => setDeleteConfirm(null)} role="dialog" aria-modal="true" aria-labelledby="kyc-delete-title">
          <div className="mx-4 w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-lg max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 id="kyc-delete-title" className="flex items-center gap-2 font-heading text-lg font-semibold text-text-primary"><XCircle size={20} className="text-error-500" /> Delete submission?</h3>
            <p className="mt-2 text-sm text-text-secondary">Permanently deletes this rejected document. You can submit a new one later.</p>
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteConfirm(null)} className="touch-target rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary">Cancel</button>
              <button type="button" onClick={() => onDelete(deleteConfirm)} className="touch-target flex items-center gap-2 rounded-lg bg-error-600 px-4 py-2 text-sm font-medium text-white hover:bg-error-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
