"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield, CheckCircle, Clock, XCircle, Loader2 } from "@/components/ui/icons"
import { api } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { PersonalDetailsForm } from "./PersonalDetailsForm"
import { DocumentUpload } from "./DocumentUpload"
import { SubmissionHistory } from "./SubmissionHistory"

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

interface KycData {
  kycStatus: string
  documents: KycDocument[]
}

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

export default function KycPage() {
  const { user } = useAuth()
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
  const [businessPermitFile, setBusinessPermitFile] = useState<File | null>(null)
  const [businessPermitUrl, setBusinessPermitUrl] = useState("")
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
      const res = await api.post<{ agent: { id: string; fullName: string; phone: string } }>("/api/apl-agents/lookup", { agentCode: agentCode.trim().toUpperCase() })
      if (!res.data?.agent) {
        setAgentLookupError(res.error || "Invalid code")
        return
      }
      setAplAgentId(res.data.agent.id)
      setAgentName(res.data.agent.fullName)
      setAgentPhone(res.data.agent.phone)
      setAgentConfirmed(true)
      setAgentCodeState("confirmed")
    } catch {
      setAgentLookupError("Failed to look up code. Try again.")
    } finally {
      setAgentLookupLoading(false)
    }
  }

  const uploadFiles = async (files: File[]): Promise<{ url: string }[]> => {
    return Promise.all(files.map(async (file) => {
      if (file.type === "application/pdf") {
        const fd = new FormData()
        fd.append("file", file)
        const res = await fetch("/api/upload/pdf", { method: "POST", credentials: "include", body: fd })
        if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Upload failed") }
        const result = await res.json()
        return { url: result.url }
      }
      const signRes = await api.post<{ signature: string; timestamp: number; apiKey: string; cloudName: string }>("/api/uploadthing/sign", { folder: "allpropertylink/kyc" })
      if (!signRes.data) throw new Error(signRes.error || "Failed to get upload signature")
      const { signature, timestamp, apiKey, cloudName } = signRes.data
      const fd = new FormData()
      fd.append("file", file)
      fd.append("api_key", apiKey)
      fd.append("timestamp", String(timestamp))
      fd.append("signature", signature)
      fd.append("folder", "allpropertylink/kyc")
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd })
      if (!uploadRes.ok) throw new Error("Cloudinary upload failed")
      const result = await uploadRes.json()
      return { url: result.secure_url, publicId: result.public_id }
    }))
  }

  const fetchKyc = useCallback(async () => {
    try {
      const res = await api.get<KycData>("/api/user/kyc")
      if (res.data) setData(res.data)
    } catch { setData(null) }
  }, [])

  useEffect(() => { fetchKyc() }, [fetchKyc])

  const kycStatus = data?.kycStatus || "NONE"

  useEffect(() => {
    if ((kycStatus === "NONE" || kycStatus === "REJECTED") && (user?.phone) && !bioPhone) {
      setBioPhone(user.phone)
    }
  }, [kycStatus, user?.phone, bioPhone])

  const coreDoc = data?.documents?.find(d => ["NATIONAL_ID", "DRIVERS_LICENSE", "PASSPORT"].includes(d.documentType))
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

  const handleBusinessPermitSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== "application/pdf") {
      setMessage({ type: "error", text: "Only PDF files are allowed" }); e.target.value = ""; return
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "File must be under 10MB" }); e.target.value = ""; return
    }
    setMessage(null)
    setBusinessPermitFile(file)
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
      if (businessPermitFile) uploads.push(businessPermitFile)

      const results = await uploadFiles(uploads)
      if (!results || results.length === 0) throw new Error("Upload failed")
      if (results.some(r => !r.url)) throw new Error("One or more uploads failed")

      const frontUrl_ = results[0]!.url!
      let idx = 1
      const backUrl_ = backFile ? results[idx++]!.url! : ""
      const businessPermitUrl_ = businessPermitFile ? results[idx]!.url! : ""

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
      if (businessPermitUrl_) body.businessPermit = businessPermitUrl_
      if (aplAgentId && agentConfirmed) body.aplAgentId = aplAgentId

      const res = coreDoc?.status === "REJECTED"
        ? await api.patch(`/api/user/kyc/${coreDoc.id}`, body)
        : await api.post("/api/user/kyc", body)

      if (!res.data) throw new Error(res.error || "Submission failed")

      setMessage({ type: "success", text: "Document submitted" })
      setDocNumber(""); setFrontFile(null); setBackFile(null); setFrontUrl(""); setBackUrl(""); setCropping(null)
      setBusinessPermitFile(null); setBusinessPermitUrl("")
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
      const res = await api.delete(`/api/user/kyc/${docId}`)
      if (!res.data) throw new Error(res.error || "Delete failed")
      setMessage({ type: "success", text: "Document deleted" })
      setDeleteConfirm(null)
      fetchKyc()
    } catch {
      setMessage({ type: "error", text: "Failed to delete" })
      setDeleteConfirm(null)
    }
  }

  const handleBioChange = (field: string, value: string) => {
    const setters: Record<string, (v: string) => void> = {
      bioFirstName: setBioFirstName, bioMiddleName: setBioMiddleName, bioLastName: setBioLastName,
      bioPhone: setBioPhone, bioEmail: setBioEmail,
    }
    setters[field]?.(value)
  }

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
          <PersonalDetailsForm
            bioFirstName={bioFirstName} bioMiddleName={bioMiddleName} bioLastName={bioLastName}
            bioPhone={bioPhone} bioEmail={bioEmail} userPhone={user?.phone}
            onChange={handleBioChange}
          />

          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              APL Representative Code <span className="text-sm font-normal text-muted">(Optional — fill if an APL Representative introduced you to the platform)</span>
            </h2>

            {agentCodeState === "confirmed" ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <p className="text-sm font-medium text-green-800">APL Representative Confirmed</p>
                </div>
                <p className="mt-2 text-sm text-green-700"><strong>Name:</strong> {agentName}</p>
                <p className="text-sm text-green-700"><strong>Phone:</strong> {agentPhone}</p>
                <p className="mt-1 text-xs text-green-500">This APL Representative will be credited with your referral.</p>
                <button type="button" onClick={resetAgentCode}
                  className="mt-3 text-sm font-medium text-primary hover:underline">
                  Change APL Representative
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[200px]">
                  <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="agentCode">APL Representative Code</label>
                  <input id="agentCode" value={agentCode} onChange={e => setAgentCode(e.target.value.toUpperCase())} placeholder="e.g. APL-JOE-001-07/26"
                    className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <button type="button" onClick={handleRevealAgent} disabled={agentLookupLoading || !agentCode.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50">
                  {agentLookupLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {agentLookupLoading ? "Revealing..." : "Reveal APL Representative"}
                </button>
              </div>
            )}
            {agentLookupError && <p className="mt-2 text-sm text-red-500">{agentLookupError}</p>}
          </div>

          <DocumentUpload
            docType={docType} docNumber={docNumber}
            frontFile={frontFile} backFile={backFile} frontUrl={frontUrl} backUrl={backUrl}
            businessPermitFile={businessPermitFile} businessPermitUrl={businessPermitUrl}
            onDocTypeChange={setDocType} onDocNumberChange={setDocNumber}
            onFileSelect={handleFileSelect} onBusinessPermitSelect={handleBusinessPermitSelect}
            onRemoveFile={(side) => side === "front" ? setFrontFile(null) : setBackFile(null)}
            onRemoveBusinessPermit={() => setBusinessPermitFile(null)}
            onStartCrop={setCropping} onCropComplete={handleCropComplete} onCancelCrop={() => setCropping(null)}
            cropping={cropping} setMessage={setMessage}
          />

          <button type="submit" disabled={submitting || !docNumber.trim() || !frontFile}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
            {submitting ? "Submitting..." : "Submit for Verification"}
          </button>
        </form>
      )}

      <SubmissionHistory
        documents={data?.documents || []}
        onDelete={handleDelete}
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
      />
    </div>
  )
}
