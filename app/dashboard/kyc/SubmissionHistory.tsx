"use client"

import { Shield, XCircle, Trash2 } from "@/components/ui/icons"
import PdfViewer from "@/components/kyc/PdfViewer"
import { cn } from "@/lib/utils"

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
  NONE: { label: "Not Verified", icon: Shield, color: "text-gray-500", bg: "bg-gray-50" },
  PENDING: { label: "Pending Review", icon: Shield, color: "text-amber-600", bg: "bg-amber-50" },
  VERIFIED: { label: "Verified", icon: Shield, color: "text-green-600", bg: "bg-green-50" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
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
      <div className="mt-8 rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Submission History</h2>
        </div>
        {documents.length > 0 ? (
          <div className="divide-y divide-border">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-start justify-between gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{LABELS[doc.documentType] || doc.documentType}</span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">Required</span>
                    <Badge status={doc.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                    {doc.documentNumber && <span>#{doc.documentNumber}</span>}
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    {doc.rejectionReason && <span className="text-red-500">Reason: {doc.rejectionReason}</span>}
                  </div>
                  {doc.bioData && (
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-muted">
                      <span>{doc.bioData.firstName} {doc.bioData.middleName} {doc.bioData.lastName}</span>
                      {doc.bioData.phone && <span>· {doc.bioData.phone}</span>}
                      {doc.bioData.email && <span>· {doc.bioData.email}</span>}
                    </div>
                  )}
                  {(doc.frontImage || doc.backImage || doc.businessPermit) && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {doc.frontImage && (isPdf(doc.frontImage) ? <PdfViewer url={doc.frontImage} compact /> : <img src={doc.frontImage} alt="" className="h-14 w-20 rounded object-cover" />)}
                      {doc.backImage && (isPdf(doc.backImage) ? <PdfViewer url={doc.backImage} compact /> : <img src={doc.backImage} alt="" className="h-14 w-20 rounded object-cover" />)}
                      {doc.businessPermit && <PdfViewer url={doc.businessPermit} compact />}
                    </div>
                  )}
                </div>
                {doc.status === "REJECTED" && (
                  <button type="button" onClick={() => setDeleteConfirm(doc.id)} className="shrink-0 rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <Shield size={32} className="mx-auto text-muted" />
            <p className="mt-2 text-sm text-muted">No submissions yet</p>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteConfirm(null)}>
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="flex items-center gap-2 text-lg font-semibold"><XCircle size={20} className="text-red-500" /> Delete submission?</h3>
            <p className="mt-2 text-sm text-muted">Permanently deletes this rejected document. You can submit a new one later.</p>
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteConfirm(null)} className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={() => onDelete(deleteConfirm)} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
