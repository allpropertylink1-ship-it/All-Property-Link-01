"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield, CheckCircle, XCircle, Clock, Upload, Loader2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import ImageCropper from "@/components/kyc/ImageCropper"
import PdfViewer from "@/components/kyc/PdfViewer"

interface KycDocument {
  id: string
  documentType: string
  documentNumber: string
  frontImage: string
  backImage: string
  bioData: { firstName?: string; middleName?: string; lastName?: string; phone?: string; email?: string } | null
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
}

const ASPECTS: Record<string, number> = {
  NATIONAL_ID: 85.6 / 54, DRIVERS_LICENSE: 85.6 / 54, PASSPORT: 125 / 88,
}

const CORE_TYPES = ["NATIONAL_ID", "DRIVERS_LICENSE", "PASSPORT"]

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

  const [docType, setDocType] = useState("NATIONAL_ID")
  const [docNumber, setDocNumber] = useState("")
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [frontUrl, setFrontUrl] = useState("")
  const [backUrl, setBackUrl] = useState("")
  const [cropping, setCropping] = useState<"front" | "back" | null>(null)
  const [bioFirstName, setBioFirstName] = useState("")
  const [bioMiddleName, setBioMiddleName] = useState("")
  const [bioLastName, setBioLastName] = useState("")
  const [bioPhone, setBioPhone] = useState("")
  const [bioEmail, setBioEmail] = useState("")
  const [agentCode, setAgentCode] = useState("")
  const [aplAgentId, setAplAgentId] = useState<string | null>(null)
  const [agentName, setAgentName] = useState<string | null>(null)
  const [agentPhone, setAgentPhone] = useState<string | null>(null)
  const [agentConfirmed, setAgentConfirmed] = useState(false)
  const [agentCodeState, setAgentCodeState] = useState<"idle" | "confirmed">("idle")
  const [agentLookupLoading, setAgentLookupLoading] = useState(false)
  const [agentLookupError, setAgentLookupError] = useState("")

  const resetAgentCode = useCallback(() => {
    setAgentCode("")
    setAplAgentId(null)
    setAgentName(null)
    setAgentPhone(null)
    setAgentConfirmed(false)
    setAgentCodeState("idle")
    setAgentLookupError("")
  }, [])

  const handleRevealAgent = async () => {
    if (!agentCode.trim()) return
    setAgentLookupLoading(true)
    setAgentLookupError("")
    setAplAgentId(null)
    setAgentName(null)
    setAgentPhone(null)
    setAgentConfirmed(false)
    setAgentCodeState("idle")
    try {
      const res = await fetch("/api/apl-agents/lookup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentCode: agentCode.trim().toUpperCase() }),
      })
      const result = await res.json()
      if (!res.ok || !result.agent) {
        setAgentLookupError(result.error || "Invalid code")
        return
      }
      setAplAgentId(result.agent.id)
      setAgentName(result.agent.fullName)
      setAgentPhone(result.agent.phone)
      setAgentConfirmed(true)
      setAgentCodeState("confirmed")
    } catch {
      setAgentLookupError("Failed to look up code. Try again.")
    } finally {
      setAgentLookupLoading(false)
    }
  }

  const uploadFiles = async (files: File[]): Promise<{ url: string }[]> => {
    const signRes = await fetch("/api/uploadthing/sign", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: "allpropertylink/kyc" }),
    })
    if (!signRes.ok) throw new Error("Failed to get upload signature")
    const { signature, timestamp, apiKey, cloudName } = await signRes.json()
    return Promise.all(files.map(async (file) => {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("api_key", apiKey)
      fd.append("timestamp", String(timestamp))
      fd.append("signature", signature)
      fd.append("folder", "allpropertylink/kyc")
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${file.type === "application/pdf" ? "raw" : "image"}/upload`, { method: "POST", body: fd })
      if (!uploadRes.ok) throw new Error("Cloudinary upload failed")
      const result = await uploadRes.json()
      return { url: result.secure_url, publicId: result.public_id }
    }))
  }

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
    setCropping(null)
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
      if (!bioFirstName.trim() || !bioLastName.trim()) {
        setMessage({ type: "error", text: "First name and last name are required" })
        setSubmitting(false); return
      }
      if (!bioPhone.trim()) {
        setMessage({ type: "error", text: "Phone number is required" })
        setSubmitting(false); return
      }

      const uploads: File[] = [frontFile]
      if (backFile) uploads.push(backFile)

      const results = await uploadFiles(uploads)
      if (!results || results.length === 0) throw new Error("Upload failed")
      if (results.some(r => !r.url)) throw new Error("One or more uploads failed")

      const frontUrl_ = results[0]!.url!
      const backUrl_ = backFile ? results[1]!.url! : ""

      const body: Record<string, unknown> = {
        documentType: docType,
        documentNumber: docNumber.trim(),
        frontImage: frontUrl_,
        bioData: {
          firstName: bioFirstName.trim(),
          middleName: bioMiddleName.trim() || null,
          lastName: bioLastName.trim(),
          phone: bioPhone.trim(),
          email: bioEmail.trim() || null,
        },
      }
      if (backUrl_) body.backImage = backUrl_
      if (aplAgentId && agentConfirmed) body.aplAgentId = aplAgentId

      const res = coreDoc?.status === "REJECTED"
        ? await fetch(`/api/user/kyc/${coreDoc.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/user/kyc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })

      if (!res.ok) throw new Error("Submission failed")

      setMessage({ type: "success", text: "Document submitted" })
      setDocNumber(""); setFrontFile(null); setBackFile(null); setFrontUrl(""); setBackUrl(""); setCropping(null)
      setBioFirstName(""); setBioMiddleName(""); setBioLastName(""); setBioPhone(""); setBioEmail("")
      resetAgentCode()
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
              {kycStatus !== "VERIFIED" && <span className="ml-3"><Badge status={kycStatus} /></span>}
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
              Personal Details <span className="text-sm font-normal text-muted">(as they appear on your ID)</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">First Name <span className="text-red-500">*</span></label>
                <input value={bioFirstName} onChange={e => setBioFirstName(e.target.value)} placeholder="e.g. John"
                  className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Middle Name <span className="text-xs text-muted">(optional)</span></label>
                <input value={bioMiddleName} onChange={e => setBioMiddleName(e.target.value)} placeholder="e.g. Michael"
                  className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Last Name <span className="text-red-500">*</span></label>
                <input value={bioLastName} onChange={e => setBioLastName(e.target.value)} placeholder="e.g. Doe"
                  className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Phone Number <span className="text-red-500">*</span></label>
                <input value={bioPhone} onChange={e => setBioPhone(e.target.value)} type="tel" placeholder="e.g. +254 712 345 678"
                  className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Email <span className="text-xs text-muted">(optional)</span></label>
                <input value={bioEmail} onChange={e => setBioEmail(e.target.value)} type="email" placeholder="e.g. john@example.com"
                  className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Agent Code <span className="text-sm font-normal text-muted">(Optional — fill if an APL Agent introduced you to the platform)</span>
            </h2>

            {agentCodeState === "confirmed" ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <p className="text-sm font-medium text-green-800">Agent Confirmed</p>
                </div>
                <p className="mt-2 text-sm text-green-700"><strong>Name:</strong> {agentName}</p>
                <p className="text-sm text-green-700"><strong>Phone:</strong> {agentPhone}</p>
                <p className="mt-1 text-xs text-green-500">This agent will be credited with your referral.</p>
                <button type="button" onClick={resetAgentCode}
                  className="mt-3 text-sm font-medium text-primary hover:underline">
                  Change Agent
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[200px]">
                  <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="agentCode">Agent Code</label>
                  <input id="agentCode" value={agentCode} onChange={e => setAgentCode(e.target.value.toUpperCase())} placeholder="e.g. APL-JOE-001-07/26"
                    className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <button type="button" onClick={handleRevealAgent} disabled={agentLookupLoading || !agentCode.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50">
                  {agentLookupLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {agentLookupLoading ? "Revealing..." : "Reveal Agent"}
                </button>
              </div>
            )}
            {agentLookupError && <p className="mt-2 text-sm text-red-500">{agentLookupError}</p>}
          </div>

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

          <button type="submit" disabled={submitting || !docNumber.trim() || !frontFile}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
            {submitting ? "Submitting..." : "Submit for Verification"}
          </button>
        </form>
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
