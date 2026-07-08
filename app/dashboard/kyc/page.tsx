"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield, CheckCircle, XCircle, Clock, Upload, Loader2, FileText, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUploadThing } from "@/lib/uploadthing"
import ImageCropper from "@/components/kyc/ImageCropper"
import PdfViewer from "@/components/kyc/PdfViewer"

interface KycDocument {
  id: string
  documentType: string
  documentNumber: string
  frontImage: string
  backImage: string
  status: string
  rejectionReason: string | null
  createdAt: string
}

interface KycData {
  kycStatus: string
  documents: KycDocument[]
}

const LABELS: Record<string, string> = {
  NATIONAL_ID: "National ID Card", DRIVERS_LICENSE: "Driver's License", PASSPORT: "Passport",
  BUSINESS_PERMIT: "Business Permit", BUSINESS_REGISTRATION: "Business Registration", KRA_PIN: "KRA PIN",
}

const ASPECTS: Record<string, number> = {
  NATIONAL_ID: 85.6 / 54, DRIVERS_LICENSE: 85.6 / 54, PASSPORT: 125 / 88, BUSINESS_PERMIT: 1.42, BUSINESS_REGISTRATION: 1.42, KRA_PIN: 1.42,
}

const CORE_TYPES = ["NATIONAL_ID", "DRIVERS_LICENSE", "PASSPORT"]
const ADDITIONAL_TYPES = [
  { type: "BUSINESS_PERMIT", label: "Business Permit" },
  { type: "BUSINESS_REGISTRATION", label: "Business Registration" },
  { type: "KRA_PIN", label: "KRA PIN" },
]

const STATUS: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  NONE: { label: "Not Verified", icon: Shield, color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
  PENDING: { label: "Pending Review", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  VERIFIED: { label: "Verified", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
}

function Badge({ status }: { status: string }) {
  const s = STATUS[status]
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", s.color, s.bg)}>
      <s.icon size={12} /> {s.label}
    </span>
  )
}

function FilePreview({ url, onRemove }: { url: string; onRemove?: () => void }) {
  const isPdf = /\.pdf$/i.test(url)
  return (
    <div className="relative">
      {isPdf ? (
        <PdfViewer url={url} compact />
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer" className="relative block overflow-hidden rounded-lg border border-border hover:ring-2 hover:ring-primary/50 transition-all">
          <img src={url} alt="" className="h-44 w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
        </a>
      )}
      {onRemove && (
        <button type="button" onClick={onRemove} className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-red-500 shadow hover:bg-red-50 transition-colors">
          <XCircle size={16} />
        </button>
      )}
    </div>
  )
}

export default function KycPage() {
  const [data, setData] = useState<KycData | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showAdditional, setShowAdditional] = useState(false)

  const [docType, setDocType] = useState("NATIONAL_ID")
  const [docNumber, setDocNumber] = useState("")
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [frontUrl, setFrontUrl] = useState("")
  const [backUrl, setBackUrl] = useState("")
  const [cropping, setCropping] = useState<"front" | "back" | null>(null)

  const [additional, setAdditional] = useState<Record<string, { number: string; file: File | null; url: string }>>({})
  const [addCropping, setAddCropping] = useState<string | null>(null)

  const { startUpload } = useUploadThing("kycDocument")

  const fetchKyc = useCallback(async () => {
    try {
      const res = await fetch("/api/user/kyc")
      if (res.ok) setData(await res.json())
    } catch { setData(null) }
  }, [])

  useEffect(() => { fetchKyc() }, [fetchKyc])

  const coreDoc = data?.documents?.find(d => CORE_TYPES.includes(d.documentType))
  const kycStatus = data?.kycStatus || "NONE"
  const coreRejection = coreDoc?.rejectionReason
  const statusConfig = STATUS[kycStatus] || STATUS.NONE

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setMessage({ type: "error", text: "Only JPG and PNG files are allowed" }); e.target.value = ""; return
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "File must be under 10MB" }); e.target.value = ""; return
    }
    setMessage(null)
    if (side === "front") setFrontFile(file)
    else setBackFile(file)
    setCropping(side)
  }

  const handleCropComplete = async (blob: Blob) => {
    const file = new File([blob], "document.jpg", { type: "image/jpeg" })
    if (cropping === "front") setFrontFile(file)
    else if (cropping === "back") setBackFile(file)
    else if (addCropping) {
      setAdditional(prev => ({ ...prev, [addCropping]: { ...prev[addCropping] || { number: "" }, file } }))
      setAddCropping(null)
    }
    setCropping(null)
  }

  const handleAddFileSelect = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!["image/jpeg", "image/png", "image/jpg", "application/pdf"].includes(file.type)) {
      setMessage({ type: "error", text: "Only PDF, JPG, and PNG files are allowed" }); e.target.value = ""; return
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "File must be under 10MB" }); e.target.value = ""; return
    }
    setMessage(null)
    setAdditional(prev => ({ ...prev, [type]: { ...prev[type] || { number: "" }, file } }))
    if (file.type.startsWith("image/")) setAddCropping(type)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      if (!docNumber.trim() || !frontFile) {
        setMessage({ type: "error", text: "Document number and front image are required" })
        setSubmitting(false); return
      }

      const uploads: File[] = [frontFile]
      if (backFile) uploads.push(backFile)
      const addUploads: { type: string; file: File }[] = []
      Object.entries(additional).forEach(([type, doc]) => {
        if (doc.file && doc.number.trim()) addUploads.push({ type, file: doc.file })
      })
      addUploads.forEach(({ file }) => uploads.push(file))

      const results = await startUpload(uploads)
      if (!results || results.length === 0) throw new Error("Upload failed")
      if (results.some(r => !r.url)) throw new Error("One or more uploads failed")

      let idx = 0
      const frontUrl_ = results[idx++].url!
      const backUrl_ = backFile ? results[idx++].url! : ""

      const body: Record<string, string> = {
        documentType: docType,
        documentNumber: docNumber.trim(),
        frontImage: frontUrl_,
      }
      if (backUrl_) body.backImage = backUrl_

      const ops: Promise<Response>[] = []

      if (coreDoc?.status === "REJECTED") {
        ops.push(fetch(`/api/user/kyc/${coreDoc.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }))
      } else {
        ops.push(fetch("/api/user/kyc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }))
      }

      addUploads.forEach(({ type }) => {
        const existing = data?.documents?.find(d => d.documentType === type && d.documentNumber === additional[type].number.trim())
        const addUrl = results[idx++].url!
        const addBody: Record<string, string> = { documentType: type, documentNumber: additional[type].number.trim(), frontImage: addUrl }
        if (existing) {
          ops.push(fetch(`/api/user/kyc/${existing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addBody) }))
        } else {
          ops.push(fetch("/api/user/kyc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addBody) }))
        }
      })

      const resps = await Promise.all(ops)
      const errors = resps.filter(r => !r.ok)
      if (errors.length > 0) throw new Error(`${errors.length} submission(s) failed`)

      setMessage({ type: "success", text: ops.length === 1 ? "Document submitted" : `${ops.length} documents submitted` })
      setDocNumber(""); setFrontFile(null); setBackFile(null); setFrontUrl(""); setBackUrl(""); setAdditional({}); setCropping(null); setAddCropping(null)
      fetchKyc()
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (docId: string) => {
    try {
      const res = await fetch(`/api/user/kyc/${docId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      setMessage({ type: "success", text: "Document deleted" })
      setDeleteConfirm(null)
      fetchKyc()
    } catch {
      setMessage({ type: "error", text: "Failed to delete" })
      setDeleteConfirm(null)
    }
  }

  const isPdf = (url: string) => /\.pdf$/i.test(url)
  const previewUrl = (f: File | null) => f ? URL.createObjectURL(f) : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className={cn("rounded-xl border p-5 transition-all", statusConfig.bg, statusConfig.border)}>
        <div className="flex items-start gap-4">
          <statusConfig.icon size={28} className={cn("mt-0.5 shrink-0", statusConfig.color)} />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-foreground">
              Identity Verification (KYC)
              <span className="ml-3"><Badge status={kycStatus} /></span>
            </h1>
            <p className={cn("mt-1 text-sm", statusConfig.color)}>
              {coreRejection ? <>Your documents were not approved. Reason: <strong>{coreRejection}</strong></> : STATUS[kycStatus]?.label === "Not Verified" ? "Verify your identity to unlock all features." : kycStatus === "PENDING" ? "Your documents are being reviewed." : "Your identity has been verified."}
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className={cn("mt-4 rounded-lg border px-4 py-3 text-sm", message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700")}>
          {message.text}
        </div>
      )}

      {(kycStatus === "NONE" || kycStatus === "REJECTED") && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Core Identity Document <span className="text-sm font-normal text-muted">(Required)</span>
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Document type</label>
                <select value={docType} onChange={e => setDocType(e.target.value)}
                  className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {CORE_TYPES.map(t => <option key={t} value={t}>{LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Document number</label>
                <input value={docNumber} onChange={e => setDocNumber(e.target.value)} placeholder="Enter ID number"
                  className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Front image</label>
                {frontFile ? (
                  <div className="space-y-2">
                    {cropping === "front" && frontFile ? (
                      <ImageCropper imageUrl={previewUrl(frontFile)!} aspectRatio={ASPECTS[docType]} onCropComplete={handleCropComplete} onCancel={() => setCropping(null)} sideLabel="Front" />
                    ) : (
                      <>
                        <FilePreview url={previewUrl(frontFile)!} onRemove={() => { setFrontFile(null); URL.revokeObjectURL(previewUrl(frontFile)!) }} />
                        <button type="button" onClick={() => setCropping("front")} className="text-xs text-primary hover:underline">Re-crop</button>
                      </>
                    )}
                  </div>
                ) : frontUrl ? (
                  <div className="space-y-2">
                    {isPdf(frontUrl) ? <PdfViewer url={frontUrl} compact /> : <img src={frontUrl} alt="" className="h-44 w-full rounded-lg object-cover" />}
                  </div>
                ) : (
                  <label className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted/50 bg-background hover:border-primary/50 hover:bg-primary/5 transition-colors">
                    <Upload className="mb-2 h-6 w-6 text-muted" />
                    <span className="text-sm text-muted">Upload front image</span>
                    <span className="mt-1 text-xs text-muted">JPG or PNG, max 10MB</span>
                    <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={e => handleFileSelect(e, "front")} className="hidden" />
                  </label>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Back image <span className="text-xs text-muted">(optional)</span></label>
                {backFile ? (
                  <div className="space-y-2">
                    {cropping === "back" && backFile ? (
                      <ImageCropper imageUrl={previewUrl(backFile)!} aspectRatio={ASPECTS[docType]} onCropComplete={handleCropComplete} onCancel={() => setCropping(null)} sideLabel="Back" />
                    ) : (
                      <>
                        <FilePreview url={previewUrl(backFile)!} onRemove={() => { setBackFile(null); URL.revokeObjectURL(previewUrl(backFile)!) }} />
                        <button type="button" onClick={() => setCropping("back")} className="text-xs text-primary hover:underline">Re-crop</button>
                      </>
                    )}
                  </div>
                ) : backUrl ? (
                  <div className="space-y-2">
                    {isPdf(backUrl) ? <PdfViewer url={backUrl} compact /> : <img src={backUrl} alt="" className="h-44 w-full rounded-lg object-cover" />}
                  </div>
                ) : (
                  <label className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted/50 bg-background hover:border-primary/50 hover:bg-primary/5 transition-colors">
                    <Upload className="mb-2 h-6 w-6 text-muted" />
                    <span className="text-sm text-muted">Upload back image</span>
                    <span className="mt-1 text-xs text-muted">JPG or PNG</span>
                    <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={e => handleFileSelect(e, "back")} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface">
            <button type="button" onClick={() => setShowAdditional(!showAdditional)}
              className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50">
              <h2 className="text-lg font-semibold text-foreground">
                Additional Documents <span className="text-sm font-normal text-muted">(Optional)</span>
              </h2>
              <span className="text-sm text-muted">{showAdditional ? "Collapse" : "Expand"}</span>
            </button>
            {showAdditional && (
              <div className="border-t border-border p-6">
                <p className="mb-4 text-sm text-muted">Uploading business documents can speed up verification.</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {ADDITIONAL_TYPES.map(({ type, label }) => {
                    const doc = additional[type] || { number: "", file: null, url: "" }
                    return (
                      <div key={type} className="rounded-lg border border-border p-4">
                        <h3 className="mb-2 text-sm font-semibold text-foreground">{label}</h3>
                        <input value={doc.number} onChange={e => setAdditional(prev => ({ ...prev, [type]: { ...prev[type] || { file: null, url: "" }, number: e.target.value } }))} placeholder="Document number"
                          className="mb-2 block w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        {doc.file ? (
                          <div className="space-y-1">
                            {addCropping === type && doc.file.type.startsWith("image/") ? (
                              <ImageCropper imageUrl={URL.createObjectURL(doc.file)} aspectRatio={1.42} onCropComplete={handleCropComplete} onCancel={() => setAddCropping(null)} sideLabel={label} />
                            ) : (
                              <div className="flex items-center gap-2">
                                {doc.file.type.startsWith("image/") ? <img src={URL.createObjectURL(doc.file)} alt="" className="h-16 w-full rounded object-cover" /> : <FileText size={20} className="text-red-400" />}
                                <button type="button" onClick={() => setAdditional(prev => ({ ...prev, [type]: { ...prev[type] || { number: "" }, file: null } }))} className="text-xs text-red-500 hover:text-red-600">Remove</button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <label className="flex cursor-pointer items-center justify-center gap-2 rounded border border-dashed border-muted/50 px-3 py-4 text-xs text-muted hover:border-primary/50 hover:text-primary transition-colors">
                            <Upload size={14} /> Upload file
                            <input type="file" accept=".pdf,image/jpeg,image/png" onChange={e => handleAddFileSelect(type, e)} className="hidden" />
                          </label>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting || !docNumber.trim() || !frontFile}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
            {submitting ? "Submitting..." : "Submit for Verification"}
          </button>
        </form>
      )}

      {kycStatus === "VERIFIED" && (
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <CheckCircle size={48} className="mx-auto text-green-500" />
          <h2 className="mt-3 text-xl font-bold text-green-800">Identity Verified</h2>
          <p className="mt-1 text-sm text-green-700">All platform features are now available.</p>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Submission History</h2>
        </div>
        {data?.documents != null && data.documents.length > 0 ? (
          <div className="divide-y divide-border">
            {data.documents.map(doc => (
              <div key={doc.id} className="flex items-start justify-between gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{LABELS[doc.documentType] || doc.documentType}</span>
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", CORE_TYPES.includes(doc.documentType) ? "bg-primary/10 text-primary" : "bg-gray-100 text-muted")}>
                      {CORE_TYPES.includes(doc.documentType) ? "Required" : "Optional"}
                    </span>
                    <Badge status={doc.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                    {doc.documentNumber && <span>#{doc.documentNumber}</span>}
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    {doc.rejectionReason && <span className="text-red-500">Reason: {doc.rejectionReason}</span>}
                  </div>
                  {(doc.frontImage || doc.backImage) && (
                    <div className="mt-3 flex gap-3">
                      {doc.frontImage && (isPdf(doc.frontImage) ? <PdfViewer url={doc.frontImage} compact /> : <img src={doc.frontImage} alt="" className="h-14 w-20 rounded object-cover" />)}
                      {doc.backImage && (isPdf(doc.backImage) ? <PdfViewer url={doc.backImage} compact /> : <img src={doc.backImage} alt="" className="h-14 w-20 rounded object-cover" />)}
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
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="flex items-center gap-2 text-lg font-semibold"><XCircle size={20} className="text-red-500" /> Delete submission?</h3>
            <p className="mt-2 text-sm text-muted">Permanently deletes this rejected document. You can submit a new one later.</p>
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteConfirm(null)} className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={() => handleDelete(deleteConfirm)} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
