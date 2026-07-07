"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { 
  Shield, CheckCircle, XCircle, Clock, Upload, Loader2, 
  Trash2, ChevronDown, ChevronRight, ImageIcon, AlertTriangle,
  FileText, ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import ImageCropper from "@/components/kyc/ImageCropper"
import PdfViewer from "@/components/kyc/PdfViewer"
import { useUploadThing } from "@/lib/uploadthing"
import { resolvePdfUrl } from "@/lib/pdf-utils"

interface KycDoc {
  id: string
  documentType: string
  documentNumber: string | null
  frontImage: string | null
  backImage: string | null
  status: string
  rejectionReason: string | null
  createdAt: string
}

interface KycData {
  documents: KycDoc[]
  kycStatus: string
}

interface Message {
  type: "success" | "error"
  text: string
}

const docTypeLabels: Record<string, string> = {
  NATIONAL_ID: "National ID Card",
  DRIVERS_LICENSE: "Driver's License",
  PASSPORT: "Passport",
  BUSINESS_PERMIT: "Business Permit",
  BUSINESS_REGISTRATION": "Business Registration",
  KRA_PIN": "PIN"
}

const coreTypes = ["NATIONAL_ID", "DRIVERS_LICENSE", "PASSPORT"] as const
const additionalTypes = [
  { type: "BUSINESS_PERMIT" as const, label: "Business Permit", desc: "Your valid business permit issued by the county government" },
  { type: "BUSINESS_REGISTRATION" as const, label: "Business Registration", desc: "Certificate of business registration" },
  { type: "KRA_PIN" as const, label: "KRA PIN", desc: "Your KRA PIN certificate (usually a single page)" },
] as const

const aspectRatios: Record<string, number> = {
  NATIONAL_ID: 85.6 / 54,
  DRIVERS_LICENSE: 85.6 / 54,
  PASSPORT: 125 / 88,
  BUSINESS_PERMIT: 1.42,
  BUSINESS_REGISTRATION: 1.42,
  KRA_PIN: 1.42,
}

const MAX_FILE_SIZE = 10 * 1024 * 1024
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"]
const ALL_TYPES = [...IMAGE_TYPES, "application/pdf"]

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  NONE: { label: "Not Verified", icon: Shield, color: "text-muted", bg: "bg-gray-50", border: "border-muted/30" },
  PENDING: { label: "Pending Review", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  VERIFIED: { label: "Verified", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
}

const statusMessages: Record<string, string> = {
  NONE: "Verify your identity to unlock all platform features. Submit your ID document to get started.",
  PENDING: "Your documents are under review. An admin will verify them shortly. You can still use other dashboard features.",
  VERIFIED: "Your identity has been verified. You can now list properties and use all platform features.",
  REJECTED: "Your documents were not approved. Please correct the issues and re-submit below.",
}

function DocImage({ src, label, className }: { src: string; label: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-gray-50 text-xs text-muted", className)}>
        <ImageIcon size={20} className="opacity-50" />
        <span>Failed</span>
      </div>
    )
  }
  return (
    <a href={src} target="_blank" rel="noopener noreferrer"
      className="block overflow-hidden rounded-lg border border-border transition-all hover:ring-2 hover:ring-primary/50"
      title="Click to view full size"
    >
      <img src={src} alt={label} className={cn("h-full w-full object-cover", className)} onError={() => setFailed(true)} />
    </a>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status]
  if (!cfg) return null
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.bg, cfg.color)}>
      <cfg.icon size={12} />
      {cfg.label}
    </span>
  )
}

export default function KycPage() {
  const router = useRouter()
  const [data, setData] = useState<KycData | null>(null)
  const [message, setMessage] = useState<Message | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const { startUpload } = useUploadThing("kycDocument")

  // Form state
  const [documentType, setDocumentType] = useState<string>("NATIONAL_ID")
  const [documentNumber, setDocumentNumber] = useState<string>("")
  const [frontImageUrl, setFrontImageUrl] = useState<string>("")
  const [backImageUrl, setBackImageUrl] = useState<string>("")
  const [frontPreview, setFrontPreview] = useState<string | null>(null)
  const [backPreview, setBackPreview] = useState<string | null>(null)
  const [uploadingFront, setUploadingFront] = useState(false)
  const [uploadingBack, setUploadingBack] = useState(false)
  const [croppingFor, setCroppingFor] = useState<"front" | "back" | null>(null)
  [cropImageUrl, setCropImageUrl] = useState<string | null>(null)
  [cropDocType, setCropDocType] = useState<string | null>(null)

  // Additional documents state
  [additionalDocs, setAdditionalDocs] = useState<Record<string, {
    documentNumber: string
    imageUrl: string
    preview: string | null
    isPdf: boolean
    fileName: string
  }>>({})

  // Form validation helpers
  const isFormValid = () => {
    if (!documentNumber.trim()) return false
    if (!frontImageUrl) return false
    return true
  }

  // Fetch KYC data
  const fetchKyc = useCallback(async () => {
    try {
      const res = await fetch("/api/user/kyc")
      if (res.ok) {
        const result = await res.json()
        setData(result)
        
        // Pre-fill form if rejected (for re-submit)
        if (result.kycStatus === "REJECTED" && result.documents?.length > 0) {
          const rejDoc = result.documents.find(
            (d: KycDoc) => ["NATIONAL_ID", "DRIVERS_LICENSE", "PASSPORT"].includes(d.documentType) && d.status === "REJECTED"
          )
          if (rejDoc) {
            setDocumentType(rejDoc.documentType)
            setDocumentNumber(rejDoc.documentNumber || "")
            setFrontImageUrl(rejDoc.frontImage || "")
            if (rejDoc.backImage) setBackImageUrl(rejDoc.backImage)
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch KYC data:", e)
      setData(null)
    }
  }, [])

  useEffect(() => { fetchKyc() }, [fetchKyc])

  const kycStatus = data?.kycStatus || "NONE"
  const isReSubmit = kycStatus === "REJECTED"
  const coreDoc = data?.documents?.find(d => ["NATIONAL_ID", "DRIVERS_LICENSE", "PASSPORT"].includes(d.documentType))
  const coreDocSubmitted = !!coreDoc
  const coreDocStatus = coreDoc?.status
  const coreRejectionReason = coreDoc?.rejectionReason

  // File handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!IMAGE_TYPES.includes(file.type)) {
      setMessage({ type: "error", text: "Only JPG and PNG files are allowed" })
      e.target.value = ""
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setMessage({ type: "error", text: "File size must be under 10MB" })
      e.target.value = ""
      return
    }
    
    setMessage(null)
    const previewUrl = URL.createObjectURL(file)
    if (side === "front") setFrontPreview(previewUrl)
    else setBackPreview(previewUrl)
    setCroppingFor(side)
    setCropImageUrl(previewUrl)
  }

  const handleRemoveImage = (side: "front" | "back") => {
    if (side === "front") { setFrontImageUrl(""); setFrontPreview(null) }
    else { setBackImageUrl(""); setBackPreview(null) }
    setCroppingFor(null)
    setCropImageUrl(null)
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (croppingFor === "front" || croppingFor === "back") {
      const side = cormingFor
      if (side === "front") setUploadingFront(true)
      else setUploadingBack(true)
      
      try {
        const file = new File([croppedBlob], `document-${side}.jpg`, { type: "image/jpeg" })
        const result = await startUpload([file])
        const url = result?.[0]?.url
        if (url) {
          if (side === "front") setFrontImageUrl(url)
          else setBackImageUrl(url)
        } else {
          throw new Error("Upload failed")
        }
      } catch (err) {
        setMessage({ type: "error", text: "Failed to upload image" })
      } finally {
        if (side === "front") setUploadingFront(false)
        else setUploadingBack(false)
        setCroppingFor(null)
        setCropImageUrl(null)
      }
    }
  }

  const handleCropCancel = () => {
    setCroppingFor(null)
    setCropImageUrl(null)
  }

  const handleAdditionalFileSelect = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!["image/jpeg", "image/png", "image/jpg", "application/pdf"].includes(file.type)) {
      setMessage({ type: "error", text: "Only PDF, JPG, and PNG files are allowed" })
      e.target.value = ""
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setMessage({ type: "error", text: "File size must be under 10MB" })
      e.target.value = ""
      return
    }
    
    setMessage(null)
    const isPdf = file.type === "application/pdf"
    const previewUrl = URL.createObjectURL(file)
    
    setAdditionalDocs(prev => ({
      ...prev,
      [docType]: {
        documentNumber: prev[docType]?.documentNumber || "",
        imageUrl: "", // Will be set after upload
        preview: isPdf ? "" : previewUrl,
        isPdf: isPdf,
        fileName: file.name
      }
    }))
    
    // If it's an image, set preview immediately; if PDF, we'll set preview after upload
    if (!isPdf) {
      setAdditionalDocs(prev => ({
        ...prev,
        [docType]: {
          ...(prev[docType] || {}),
          preview: previewUrl
        }
      }))
    }
    
    // Upload the file
    setAdditionalDocs(prev => ({
      ...prev,
      [docType]: {
        ...(prev[docType] || {}),
        uploading: true
      }
    }))
    
    const uploadFile = async () => {
      try {
        const result = await startUpload([file])
        const url = result?.[0]?.url
        if (url) {
          setAdditionalDocs(prev => ({
            ...prev,
            [docType]: {
              ...(prev[docType] || {}),
              imageUrl: url,
              uploading: false,
              ...(isPdf ? { preview: "" } : {}) // For PDFs, we don't show preview until uploaded
            }
          }))
        } else {
          throw new Error("Upload failed")
        }
      } catch (err) {
        setMessage({ type: "error", text: "Failed to upload file" })
        setAdditionalDocs(prev => ({
          ...prev,
          [docType]: {
            ...(prev[docType] || {}),
            uploading: false
          }
        }))
      }
    }
    
    uploadFile()
  }

  const handleRemoveAdditionalDoc = (docType: string) => {
    setAdditionalDocs(prev => {
      const next = { ...prev }
      delete next[docType]
      return next
    })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setMessage(null)
    
    // Validation
    if (!documentNumber.trim()) {
      setMessage({ type: "error", text: "Please enter your document number" })
      setSubmitting(false)
      return
    }
    
    if (!frontImageUrl) {
      setMessage({ type: "error", text: "Please upload your ID front image" })
      setSubmitting(false)
      return
    }
    
    try {
      let operations: Array<() => Promise<Response>> = []
      
      // Core document
      if (coreDocSubmitted && coreDocStatus === "REJECTED" && coreDoc) {
        // Update existing rejected document
        operations.push(() => 
          fetch(`/api/user/kyc/${coreDoc.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              documentNumber: documentNumber.trim(),
              frontImage: frontImageUrl,
              ...(backImageUrl ? { backImage: backImageUrl } : {}),
            }),
          })
        )
      } else if (!coreDocSubmitted || coreDocStatus === "REJECTED") {
        // Create new document
        operations.push(() => 
          fetch("/api/user/kyc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              documentType,
              documentNumber: documentNumber.trim(),
              frontImage: frontImageUrl,
              ...(backImageUrl ? { backImage: backImageUrl } : {}),
            }),
          })
        )
      }
      
      // Additional documents
      Object.entries(additionalDocs).forEach(([type, doc]) => {
        if (doc.documentNumber.trim() && doc.imageUrl) {
          const existing = (data?.documents || []).find(
            (d: any) => d.documentType === type && d.documentNumber === doc.documentNumber
          )
          
          if (existing) {
            // Update existing
            operations.push(() => 
              fetch(`/api/user/kyc/${existing.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  frontImage: doc.imageUrl,
                  documentNumber: doc.documentNumber.trim(),
                }),
              })
            )
          } else {
            // Create new
            operations.push(() => 
              fetch("/api/user/kyc", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  documentType: type,
                  documentNumber: doc.documentNumber.trim(),
                  frontImage: doc.imageUrl,
                }),
              })
            )
          }
        }
      })
      
      if (operations.length === 0) {
        setMessage({ type: "error", text: "Please complete the required fields before submitting" })
        setSubmitting(false)
        return
      }
      
      // Execute all operations sequentially
      for (let i = 0; i < operations.length; i++) {
        const res = await operations[i]()
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || `Operation ${i + 1} failed`)
        }
      }
      
      setMessage({ 
        type: "success", 
        text: operations.length === 1 
          ? "Document submitted for verification" 
          : `All ${operations.length} documents submitted for verification` 
      })
      
      // Reset form
      setDocumentNumber("")
      setFrontImageUrl("")
      setBackImageUrl("")
      setFrontPreview(null)
      setBackPreview(null)
      setAdditionalDocs({})
      setCroppingFor(null)
      setCropImageUrl(null)
      setCropDocType(null)
      
      // Refresh data
      fetchKyc()
    } catch (err: any) {
      setMessage({ 
        type: "error", 
        text: err instanceof Error ? err.message : "Something went wrong" 
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (docId: string) => {
    setDeleteConfirm(docId)
  }

  const handleDeleteConfirm = async (docId: string) => {
    try {
      const res = await fetch(`/api/user/kyc/${docId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setMessage({ type: "success", text: "Submission deleted" })
      setDeleteConfirm(null)
      fetchKyc()
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to delete" })
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm(null)
  }

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Status Banner */}
        <div className={cn(
          "rounded-xl border p-5 transition-all",
          statusConfig[kycStatus]?.bg, statusConfig[kycStatus]?.border
        )}>
          <div className="flex items-start gap-4">
            <statusConfig[kycStatus]?.icon size={28} className={cn("shrink-0 mt-0.5", statusConfig[kycStatus]?.color)} />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-foreground">
                Identity Verification (KYC)
                <span className="ml-3">
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", statusConfig[kycStatus]?.bg, statusConfig[kycStatus]?.color)}>
                    <statusConfig[kycStatus]?.icon size={12} />
                    {statusConfig[kycStatus]?.label}
                  </span>
                </span>
              </h1>
              <p className={cn("mt-1 text-sm", kycStatus === "REJECTED" ? "text-red-700" : kycStatus === "PENDING" ? "text-amber-700" : kycStatus === "VERIFIED" ? "text-green-700" : "text-muted")}>
                {coreRejectionReason ? (
                  <>
                    {statusMessages[kycStatus]}
                    <p className="mt-1 font-medium">Reason: {coreRejectionReason}</p>
                  </>
                ) : (
                  statusMessages[kycStatus]
                )}
              </p>
            </div>
          </div>
        </div>
        
        {/* Message */}
        {message && (
          <div className={`mt-6 rounded-lg px-4 py-3 text-sm ${
            message.type === "success" 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}
        
        {/* Submission Form - only show if not verified or pending approval */}
        {[() => kycStatus === "NONE", () => kycStatus === "REJECTED"].some(fn => fn()) && (
          <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
            {/* Core Document Form */}
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-surface p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  {isReSubmit ? "Re-submit Core Document" : "Core Identity Document"}
                  <span className="ml-2 text-sm font-normal text-muted">(Required)</span>
                </h2>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Document type</label>
                      <select
                        value={documentType}
                        onChange={e => { setDocumentType(e.target.value); setMessage(null) }}
                        className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {["NATIONAL_ID", "DRIVERS_LICENSE", "PASSPORT"].map(t => (
                          <option key={t} value={t}>{docTypeLabels[t]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Document number</label>
                      <input
                        value={documentNumber}
                        onChange={e => setDocumentNumber(e.target.value)}
                        placeholder="Enter your ID number"
                        className="block w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">Front image</label>
                      <div className="space-y-2">
                        {frontPreview && (
                          <div className="relative h-44 rounded-lg border border-dashed border-muted/50 bg-background">
                            <img src={frontPreview} alt="Front preview" className="h-full w-full object-cover" />
                            {uploadingFront && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                              </div>
                            )}
                          </div>
                        )}
                        {!frontPreview && frontImageUrl && (
                          <div className="space-y-2">
                            {frontImageUrl.match(/\.pdf/i) ? (
                              <PdfViewer url={frontImageUrl} label="Front" compact />
                            ) : (
                              <img src={frontImageUrl} alt="Front ID" className="h-32 w-full rounded object-cover" />
                            )}
                            <button onClick={handleRemoveImage("front")} className="text-xs text-red-500 hover:text-red-600">
                              Remove Front Image
                            </button>
                          </div>
                        )}
                        {!frontPreview && !frontImageUrl && (
                          <label className={cn(
                            "flex h-44 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted/50 bg-background transition-colors",
                            "hover:border-primary/50 hover:bg-primary/5"
                          )}>
                            <Upload className="mb-2 h-6 w-6 text-muted" />
                            <span className="text-sm text-muted">Click to upload front image</span>
                            <span className="mt-1 text-xs text-muted">JPG or PNG, max 10MB</span>
                            <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={(e) => handleFileSelect(e, "front")} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">
                        Back image <span className="text-xs text-muted">(optional)</span>
                      </label>
                      <div className="space-y-2">
                        {backPreview && (
                          <div className="relative h-44 rounded-lg border border-dashed border-muted/50 bg-background">
                            <img src={backPreview} alt="Back preview" className="h-full w-full object-cover" />
                            {uploadingBack && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                              </div>
                            )}
                          </div>
                        )}
                        {!backPreview && backImageUrl && (
                          <div className="space-y-2">
                            {backImageUrl.match(/\.pdf/i) ? (
                              <PdfViewer url={backImageUrl} label="Back" compact />
                            ) : (
                              <img src={backImageUrl} alt="Back ID" className="h-32 w-full rounded object-cover" />
                            )}
                            <button onClick={handleRemoveImage("back")} className="text-xs text-red-500 hover:text-red-600">
                              Remove Back Image
                            </button>
                          </div>
                        )}
                        {!backPreview && !backImageUrl && (
                          <label className={cn(
                            "flex h-44 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted/50 bg-background transition-colors",
                            "hover:border-primary/50 hover:bg-primary/5"
                          )}>
                            <Upload className="mb-2 h-6 w-6 text-muted" />
                            <span className="text-sm text-muted">Click to upload back image</span>
                            <span className="mt-1 text-xs text-muted">JPG or PNG, max 10MB</span>
                            <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={(e) => handleFileSelect(e, "back")} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cropper - only show if we have a preview and are cropping */}
                  {cropImageUrl && croppingFor && (
                    <div className="mt-4">
                      <ImageCropper
                        imageUrl={cropImageUrl}
                        aspectRatio={croppingFor === "additional" && cropDocType
                          ? (aspectRatios[cropDocType] || 1.42)
                          : aspectRatios[documentType]}
                        onCropComplete={handleCropComplete}
                        onCancel={handleCropCancel}
                        sideLabel={
                          croppingFor === "front" ? "Front" :
                          croppingFor === "back" ? "Back" : "Document"
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Additional Documents - Simplified */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Additional Documents <span className="text-sm font-normal text-muted">(Optional)</span>
                </h2>
                <p className="text-sm text-muted">
                  Uploading these helps verify your identity faster
                </p>
              </div>
              
              {/* Document Type Grid */}
              <div className="grid gap-4 sm:grid-cols-3">
                {additionalTypes.map(({ type, label, desc }) => {
                  const doc = additionalDocs[type]
                  const existing = (data?.documents || []).find((d: any) => d.documentType === type)
                  const hasExisting = !!existing
                  const isEditing = !!doc?.imageUrl && !doc.imageUrl.startsWith("http") // preview URL
                  
                  return (
                    <div key={type} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
                        {hasExisting && !existing?.imageUrl && (
                          <span className="text-xs text-muted">(Submitted)</span>
                        )}
                      </div>
                      
                      {doc?.imageUrl && !doc?.imageUrl.startsWith("http") && (
                        <div className="mb-2">
                          <p className="text-xs text-muted">{doc.fileName}</p>
                          {doc.isPdf ? (
                            <div className="flex items-center gap-2">
                              <FileText size={20} className="text-red-400" />
                              <a href={resolvePdfUrl(doc.imageUrl)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                View PDF
                              </a>
                            </div>
                          ) : (
                            <img src={doc.preview || doc.imageUrl} alt="Preview" className="h-24 w-full rounded object-cover" />
                          )}
                        </div>
                      )}
                      
                      {!doc?.imageUrl && (
                        <div className="space-y-2">
                          <div className="flex mb-2">
                            <label className="block text-sm font-medium text-foreground">Document number</label>
                            <input
                              value={doc?.documentNumber || ""}
                              onChange={(e) => {
                                setAdditionalDocs(prev => ({
                                  ...prev,
                                  [type]: {
                                    ...(prev[tempType] || {}),
                                    documentNumber: e.target.value,
                                  }
                                })
                              }}
                              placeholder="Enter document number"
                              className="block w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          
                          <div className="flex items-center">
                            <label className="block text-sm font-medium text-foreground mr-2">
                              Upload file
                            </label>
                            <input
                              type="file"
                              accept=".pdf,image/jpeg,image/png"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                if (!["image/jpeg", "image/png", "image/jpg", "application/pdf"].includes(file.type)) {
                                  setMessage({ type: "error", text: "Only PDF, JPG, and PNG files are allowed" })
                                  e.target.value = ""
                                  return
                                }
                                if (file.size > 10 * 1024 * 1024) {
                                  setMessage({ type: "error", text: "File size must be under 10MB" })
                                  e.target.value = ""
                                  return
                                }
                                
                                setMessage(null)
                                const previewUrl = URL.createObjectURL(file)
                                setAdditionalDocs(prev => ({
                                  ...prev,
                                  [type]: {
                                    documentNumber: doc?.documentNumber || "",
                                    imageUrl: "",
                                    preview: isPdf ? "" : previewUrl,
                                    isPdf: file.type === "application/pdf",
                                    fileName: file.name,
                                  }
                                }))
                              }}
                              className="block w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        </div>
                      )}
                      
                      {doc?.imageUrl && !doc?.imageUrl.startsWith("http") && (
                        <div className="mt-2">
                          {doc.isPdf ? (
                            <div className="flex items-center gap-2">
                              <FileText size={20} className="text-red-400" />
                              <a href={resolvePdfUrl(doc.imageUrl)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                View PDF
                              </a>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <img src={doc.preview || doc.imageUrl} alt="Document" className="h-24 w-full rounded object-cover" />
                              <button onClick={() => handleRemoveAdditionalDoc(type)} className="text-xs text-red-500 hover:text-red-600">
                                Remove
                              </button>
                            </div>
                          )
                        )}
                      }}
                    </div>
                  )
                )}
              </div>
            </div>
          </form>
        )}
        
        {/* Verified state - show success message */}
        {kycStatus === "VERIFIED" && (
          <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-8 text-center">
            <CheckCircle size={48} className="mx-auto text-green-500" />
            <h2 className="mt-3 text-xl font-bold text-green-800">Identity Verified</h2>
            <p className="mt-1 text-sm text-green-700">Your identity has been verified. All platform features are now available to you.</p>
          </div>
        )}
        
        {/* Submission History */}
        <div className="mt-8 rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">Submission History</h2>
          </div>
          {data?.documents && data.documents.length > 0 ? (
            <div className="divide-y divide-border">
              {data.documents.map(doc => (
                <div key={doc.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {docTypeLabels[doc.documentType] || doc.documentType}
                        </span>
                        {["NATIONAL_ID", "DRIVERS_LICENSE", "PASSPORT"].includes(doc.documentType as any) ? (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">Required</span>
                        ) : (
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-muted">Optional</span>
                        )}
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
                              {doc.frontImage.match(/\.pdf/i) ? (
                                <div className="flex items-center gap-2">
                                  <FileText size={20} className="text-red-400" />
                                  <a href={resolvePdfUrl(doc.frontImage)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                    View PDF
                                  </a>
                                </div>
                              ) : (
                                <img src={doc.frontImage} alt="Front ID" className="h-14 w-20 object-cover" />
                              )}
                            </div>
                          )}
                          {doc.backImage && (
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted">Back</p>
                              {doc.backImage.match(/\.pdf/i) ? (
                                <div className="flex items-center gap-2">
                                  <FileText size={20} className="text-red-400" />
                                  <a href={resolvePdfUrl(doc.backImage)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                    View PDF
                                  </a>
                                </div>
                              ) : (
                                <img src={doc.backImage} alt="Back ID" className="h-14 w-20 object-cover" />
                              )}
                            </div>
                          )}
                        )}
                      </div>
                      {doc.status === "REJECTED" && (
                        <button
                          onClick={() => setDeleteConfirm(doc.id)}
                          className="shrink-0 rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete permanently"
                        >
                          {deleting === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      )}
                    </div>
                    {deleteConfirm === doc.id && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleDeleteCancel}>
                        <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-3">
                            <XCircle size={24} className="text-red-500" />
                            <h3 className="text-lg font-semibold">Delete submission?</h3>
                          </div>
                          <p className="mt-2 text-sm text-muted">This permanently deletes the rejected document. You can submit a new one later.</p>
                          <div className="mt-4 flex justify-end gap-3">
                            <button onClick={handleDeleteCancel} className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-gray-50">
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              disabled={deleting === doc.id}
                              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {deleting === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              Delete
                            </button>
                          </div>
                        </div>
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
        }
      </div>
    </div>
  )
}