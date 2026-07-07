"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield, CheckCircle, XCircle, Clock, Upload, Loader2, FileText, Trash2, RefreshCcw, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import ImageCropper from "@/components/kyc/ImageCropper"
import PdfViewer from "@/components/kyc/PdfViewer"

interface KycDoc {
  id: string
  documentType: string
  documentNumber: string | null
  status: string
  frontImage: string | null
  backImage: string | null
  rejectionReason: string | null
  createdAt: string
}

interface KycData {
  documents: KycDoc[]
}

const docTypeLabels: Record<string, string> = {
  NATIONAL_ID: "National ID Card",
  DRIVERS_LICENSE: "Driver's License",
  PASSPORT: "Passport",
  BUSINESS_PERMIT: "Business Permit",
  BUSINESS_REGISTRATION: "Business Registration",
  KRA_PIN: "KRA PIN",
}

const docTypeAspectRatios: Record<string, number> = {
  NATIONAL_ID: 85.6 / 54,
  DRIVERS_LICENSE: 85.6 / 54,
  PASSPORT: 125 / 88,
  BUSINESS_PERMIT: 1.42,
  BUSINESS_REGISTRATION: 1.42,
  KRA_PIN: 1.42,
}

const additionalDocTypes = [
  { type: "BUSINESS_PERMIT", label: "Business Permit", desc: "Your valid business permit issued by the county government" },
  { type: "BUSINESS_REGISTRATION", label: "Business Registration", desc: "Certificate of business registration" },
  { type: "KRA_PIN", label: "KRA PIN", desc: "Your KRA PIN certificate (usually a single page)" },
] as const

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"]
const ADDITIONAL_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
const ADDITIONAL_MAX_SIZE = 10 * 1024 * 1024

interface StatusInfo {
  label: string
  icon: React.ElementType
  color: string
}

const statusDisplay: Record<string, StatusInfo> = {
  NONE: { label: "Not Verified", icon: Shield, color: "text-gray-500" },
  PENDING: { label: "Pending Review", icon: Clock, color: "text-yellow-500" },
  VERIFIED: { label: "Verified", icon: CheckCircle, color: "text-green-500" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "text-red-500" },
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

export default function KycPage() {
  const [data, setData] = useState<KycData | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [documentType, setDocumentType] = useState("NATIONAL_ID")
  const [documentNumber, setDocumentNumber] = useState("")
  const [frontImageUrl, setFrontImageUrl] = useState("")
  const [backImageUrl, setBackImageUrl] = useState("")
  const [frontPreview, setFrontPreview] = useState<string | null>(null)
  const [backPreview, setBackPreview] = useState<string | null>(null)
  const [uploadingFront, setUploadingFront] = useState(false)
  const [uploadingBack, setUploadingBack] = useState(false)

  // Additional document state
  const [additionalDocType, setAdditionalDocType] = useState<string | null>(null)
  const [additionalDocNumber, setAdditionalDocNumber] = useState("")
  const [additionalPreview, setAdditionalPreview] = useState<string | null>(null)
  const [additionalImageUrl, setAdditionalImageUrl] = useState("")
  const [additionalUploading, setAdditionalUploading] = useState(false)
  const [additionalSubmitting, setAdditionalSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [additionalCropping, setAdditionalCropping] = useState(false)
  const [additionalIsPdf, setAdditionalIsPdf] = useState(false)
  const [additionalFileName, setAdditionalFileName] = useState("")

  // Cropper state
  const [croppingFor, setCroppingFor] = useState<"front" | "back" | null>(null)
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null)

  const fetchKyc = useCallback(async () => {
    try {
      const res = await fetch("/api/user/kyc")
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch {
      setData(null)
    }
  }, [])

  useEffect(() => {
    fetchKyc()
  }, [fetchKyc])

  const uploadCroppedBlob = async (
    blob: Blob,
    side: "front" | "back"
  ) => {
    const formData = new FormData()
    formData.append("file", blob, `document-${side}.jpg`)

    if (side === "front") setUploadingFront(true)
    else setUploadingBack(true)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const result = await res.json()
      if (result.url) {
        if (side === "front") setFrontImageUrl(result.url)
        else setBackImageUrl(result.url)
      }
    } catch {
      setMessage({ type: "error", text: "Failed to upload image" })
    } finally {
      if (side === "front") setUploadingFront(false)
      else setUploadingBack(false)
    }
  }

  const uploadPdfDirectly = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    setAdditionalUploading(true)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const result = await res.json()
      if (result.url) setAdditionalImageUrl(result.url)
      else throw new Error("No URL returned")
    } catch {
      setMessage({ type: "error", text: "Failed to upload PDF" })
      setAdditionalPreview(null)
      setAdditionalIsPdf(false)
    } finally {
      setAdditionalUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setMessage({ type: "error", text: "Only JPG and PNG files are allowed" })
      e.target.value = ""
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage({ type: "error", text: "File size must be under 5MB" })
      e.target.value = ""
      return
    }

    const previewUrl = URL.createObjectURL(file)
    if (side === "front") {
      setFrontPreview(previewUrl)
    } else {
      setBackPreview(previewUrl)
    }
    setCropImageUrl(previewUrl)
    setCroppingFor(side)
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (croppingFor) {
      const side = croppingFor
      await uploadCroppedBlob(croppedBlob, side)
      setCroppingFor(null)
    } else if (additionalCropping) {
      const formData = new FormData()
      formData.append("file", croppedBlob, "additional-doc.jpg")
      setAdditionalUploading(true)
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        if (!res.ok) throw new Error("Upload failed")
        const result = await res.json()
        if (result.url) setAdditionalImageUrl(result.url)
      } catch {
        setMessage({ type: "error", text: "Failed to upload image" })
      } finally {
        setAdditionalUploading(false)
      }
      setAdditionalCropping(false)
    }
    setCropImageUrl(null)
    setMessage(null)
  }

  const handleCropCancel = () => {
    if (croppingFor) {
      if (croppingFor === "front") {
        setFrontPreview(null)
      } else {
        setBackPreview(null)
      }
      setCroppingFor(null)
    } else if (additionalCropping) {
      setAdditionalPreview(null)
      setAdditionalCropping(false)
    }
    setCropImageUrl(null)
  }

  const removeImage = (side: "front" | "back") => {
    if (side === "front") {
      setFrontImageUrl("")
      setFrontPreview(null)
    } else {
      setBackImageUrl("")
      setBackPreview(null)
    }
    const input = document.querySelector(`input[name="${side}Image"]`) as HTMLInputElement
    if (input) input.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      if (!documentNumber.trim()) {
        setMessage({ type: "error", text: "Document number is required" })
        setSubmitting(false)
        return
      }

      if (!frontImageUrl) {
        setMessage({ type: "error", text: "Front image is required" })
        setSubmitting(false)
        return
      }

      const res = await fetch("/api/user/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType,
          documentNumber: documentNumber.trim(),
          frontImage: frontImageUrl,
          backImage: backImageUrl || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to submit KYC documents")
      }

      setMessage({ type: "success", text: "Documents submitted for verification" })
      setDocumentType("NATIONAL_ID")
      setDocumentNumber("")
      setFrontImageUrl("")
      setBackImageUrl("")
      setFrontPreview(null)
      setBackPreview(null)
      fetchKyc()
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const kycStatus = data?.documents && data.documents.length > 0 ? data.documents[0].status : "NONE"
  const status: StatusInfo = statusDisplay[kycStatus] || statusDisplay.NONE
  const StatusIcon = status.icon

  const hasPending = data?.documents?.some((d) => d.status === "PENDING")
  const lastRejection = data?.documents?.find((d) => d.status === "REJECTED")

  return (
    <div className="space-y-8">
      {cropImageUrl && (croppingFor || (additionalCropping && !additionalIsPdf)) && (
        <ImageCropper
          imageUrl={cropImageUrl}
          aspectRatio={croppingFor ? docTypeAspectRatios[documentType] : 1.42}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          sideLabel={croppingFor === "front" ? "Front" : croppingFor === "back" ? "Back" : "Document"}
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Identity Verification (KYC)
        </h1>
        <div className="flex items-center gap-3">
          <StatusIcon size={32} className={status.color} />
          <div>
            <p className={cn("font-medium", status.color)}>{status.label}</p>
            {kycStatus === "VERIFIED" && (
              <p className="text-sm text-text-secondary">
                Your identity has been verified. You can now list properties and use all features.
              </p>
            )}
            {kycStatus === "PENDING" && (
              <p className="text-sm text-warning-600">
                Your documents are under review. An admin will verify them shortly.
              </p>
            )}
            {kycStatus === "REJECTED" && lastRejection?.rejectionReason && (
              <p className="text-sm text-error-500">
                Reason: {lastRejection.rejectionReason}
              </p>
            )}
            {kycStatus === "NONE" && (
              <p className="text-sm text-muted-foreground">
                Submit your identity documents to unlock platform features.
              </p>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div className={cn(
          "mb-4 px-4 py-3 rounded-lg",
          message.type === "success"
            ? "bg-success-500/10 text-success-700"
            : "bg-error-500/10 text-error-500"
        )}>
          {message.text}
        </div>
      )}

      {kycStatus === "PENDING" && hasPending && (
        <div className="rounded-xl border border-warning-200 bg-warning-50 p-6">
          <div className="flex items-center gap-3">
            <Clock size={24} className="shrink-0 text-warning-500" />
            <div>
              <h2 className="font-heading text-lg font-semibold text-warning-700">Documents Under Review</h2>
              <p className="text-sm text-warning-600">
                Your documents have been submitted and are awaiting admin verification. You can already access other dashboard features while you wait.
              </p>
            </div>
          </div>
        </div>
      )}

      {kycStatus === "REJECTED" && lastRejection && (
        <div className="rounded-xl border border-error-200 bg-error-50 p-6">
          <div className="flex items-start gap-3">
            <XCircle size={24} className="shrink-0 text-error-500" />
            <div>
              <h2 className="font-heading text-lg font-semibold text-error-700">Documents Rejected</h2>
              {lastRejection.rejectionReason && (
                <p className="mt-1 text-sm text-error-600">
                  Reason: {lastRejection.rejectionReason}
                </p>
              )}
              <p className="mt-1 text-sm text-error-600">
                Please submit new, valid documents for verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {kycStatus !== "VERIFIED" && !hasPending && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 font-heading text-xl font-semibold text-text-primary">
            Submit Your Documents
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="documentType" className="mb-1 block text-sm font-medium text-text-primary">
                Document type
              </label>
              <select
                id="documentType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="NATIONAL_ID">National ID Card</option>
                <option value="DRIVERS_LICENSE">Driver's License</option>
                <option value="PASSPORT">Passport</option>
              </select>
            </div>

            <div>
              <label htmlFor="documentNumber" className="mb-1 block text-sm font-medium text-text-primary">
                Document number
              </label>
              <input
                id="documentNumber"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Enter your ID number"
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  Front image
                </label>
                {frontPreview ? (
                  <div className="space-y-2">
                    <div className="relative h-48 rounded-lg border border-dashed border-muted/50 bg-background">
                      <img
                        src={frontPreview}
                        alt="Front preview"
                        className="h-full w-full rounded-lg object-cover"
                      />
                      {uploadingFront && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    {frontImageUrl && !uploadingFront && (
                      <button
                        type="button"
                        onClick={() => removeImage("front")}
                        className="text-xs text-error-500 hover:text-error-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ) : (
                  <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted/50 bg-background hover:border-teal-400 hover:bg-teal-50/50">
                    <Upload className="mb-2 h-6 w-6 text-muted" />
                    <span className="text-sm text-muted">Click to upload</span>
                    <span className="mt-1 text-xs text-muted">JPG or PNG, max 5MB</span>
                    <input
                      type="file"
                      name="frontImage"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={(e) => handleFileSelect(e, "front")}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  Back image <span className="text-muted">(optional)</span>
                </label>
                {backPreview ? (
                  <div className="space-y-2">
                    <div className="relative h-48 rounded-lg border border-dashed border-muted/50 bg-background">
                      <img
                        src={backPreview}
                        alt="Back preview"
                        className="h-full w-full rounded-lg object-cover"
                      />
                      {uploadingBack && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    {backImageUrl && !uploadingBack && (
                      <button
                        type="button"
                        onClick={() => removeImage("back")}
                        className="text-xs text-error-500 hover:text-error-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ) : (
                  <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted/50 bg-background hover:border-teal-400 hover:bg-teal-50/50">
                    <Upload className="mb-2 h-6 w-6 text-muted" />
                    <span className="text-sm text-muted">Click to upload</span>
                    <span className="mt-1 text-xs text-muted">JPG or PNG, max 5MB</span>
                    <input
                      type="file"
                      name="backImage"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={(e) => handleFileSelect(e, "back")}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !documentNumber.trim() || !frontImageUrl}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Submit for Verification
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Additional Documents (Optional) */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100">
            <Upload size={16} className="text-teal-600" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-text-primary">
              Additional Documents <span className="text-sm font-normal text-muted">(Optional)</span>
            </h2>
            <p className="mt-0.5 text-sm text-teal-600">
              Uploading these documents is completely optional, but doing so helps an admin verify your identity <strong>faster</strong>.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {additionalDocTypes.map(({ type, label, desc }) => {
            const sub = data?.documents?.find((d) => d.documentType === type)
            const isActive = additionalDocType === type

            return (
              <div
                key={type}
                className={cn(
                  "rounded-lg border p-4 transition-all",
                  sub?.status === "VERIFIED" && "border-green-200 bg-green-50/50",
                  sub?.status === "PENDING" && "border-amber-200 bg-amber-50/50",
                  sub?.status === "REJECTED" && "border-red-200 bg-red-50/50",
                  !sub && !isActive && "border-dashed border-muted/50 hover:border-teal-300",
                  isActive && "border-teal-300 bg-teal-50/30"
                )}
              >
                {sub ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                          sub.status === "VERIFIED" && "bg-green-100 text-green-700",
                          sub.status === "PENDING" && "bg-amber-100 text-amber-700",
                          sub.status === "REJECTED" && "bg-red-100 text-red-700"
                        )}>
                          {sub.status === "VERIFIED" && <><CheckCircle size={10} /> Verified</>}
                          {sub.status === "PENDING" && <><Clock size={10} /> Pending</>}
                          {sub.status === "REJECTED" && <><XCircle size={10} /> Rejected</>}
                        </span>
                      </div>
                    </div>
                    {sub.documentNumber && (
                      <p className="mt-2 text-[11px] text-muted">
                        {sub.documentNumber}
                      </p>
                    )}
                    {sub.rejectionReason && (
                      <p className="mt-1 text-[11px] text-red-500">Reason: {sub.rejectionReason}</p>
                    )}
                    {sub.frontImage && (
                      sub.frontImage.match(/\.pdf/i) ? (
                        <PdfViewer url={sub.frontImage} label={label} compact />
                      ) : (
                        <DocImage src={sub.frontImage} label={label} className="mt-2 h-16 w-full" />
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setAdditionalDocType(type)
                        setAdditionalDocNumber(sub.documentNumber || "")
                        setAdditionalPreview(null)
                        setAdditionalImageUrl("")
                        setAdditionalIsPdf(false)
                      }}
                      className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-[11px] font-medium text-muted hover:bg-gray-50 hover:text-foreground transition-colors"
                    >
                      <RefreshCcw size={12} /> Replace
                    </button>
                  </>
                ) : isActive ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setAdditionalDocType(null)
                          setAdditionalPreview(null)
                          setAdditionalImageUrl("")
                          setAdditionalDocNumber("")
                        }}
                        className="text-[11px] text-muted hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-[11px] text-muted">{desc}</p>

                    {additionalPreview ? (
                      <div className="space-y-2">
                        <div className="relative flex h-36 items-center justify-center rounded-lg border border-dashed border-muted/50 bg-background">
                          {additionalIsPdf ? (
                            additionalUploading ? (
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-muted" />
                                <span className="text-[11px] text-muted">Uploading {additionalFileName}...</span>
                              </div>
                            ) : additionalImageUrl ? (
                              <div className="flex flex-col items-center gap-2">
                                <FileText size={32} className="text-red-500" />
                                <span className="text-[11px] font-medium text-foreground">{additionalFileName}</span>
                                <a
                                  href={additionalImageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-primary hover:underline"
                                >
                                  View PDF
                                </a>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <FileText size={32} className="text-red-400" />
                                <span className="text-[11px] text-muted">{additionalFileName}</span>
                              </div>
                            )
                          ) : (
                            <>
                              <img
                                src={additionalPreview}
                                alt="Preview"
                                className="h-full w-full rounded-lg object-cover"
                              />
                              {additionalUploading && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        {additionalImageUrl && !additionalUploading && (
                          <button
                            type="button"
                            onClick={() => {
                              setAdditionalImageUrl("")
                              setAdditionalPreview(null)
                              setAdditionalIsPdf(false)
                              setAdditionalFileName("")
                            }}
                            className="text-[11px] text-error-500 hover:text-error-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ) : (
                      <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted/50 bg-background hover:border-teal-400 hover:bg-teal-50/50">
                        <Upload className="mb-1 h-4 w-4 text-muted" />
                        <span className="text-[11px] text-muted">Click to upload</span>
                        <span className="text-[10px] text-muted">PDF, JPG, or PNG</span>
                        <input
                          type="file"
                          accept=".pdf,image/jpeg,image/png"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            if (!ADDITIONAL_ACCEPTED_TYPES.includes(file.type)) {
                              setMessage({ type: "error", text: "Only PDF, JPG, and PNG files are allowed" })
                              e.target.value = ""
                              return
                            }
                            if (file.size > ADDITIONAL_MAX_SIZE) {
                              setMessage({ type: "error", text: "File size must be under 10MB" })
                              e.target.value = ""
                              return
                            }
                            const isPdf = file.type === "application/pdf"
                            setAdditionalIsPdf(isPdf)
                            setAdditionalFileName(file.name)
                            if (isPdf) {
                              setAdditionalPreview(file.name)
                              setAdditionalImageUrl("")
                              setAdditionalUploading(false)
                              uploadPdfDirectly(file)
                            } else {
                              setAdditionalPreview(URL.createObjectURL(file))
                              setCropImageUrl(URL.createObjectURL(file))
                              setAdditionalCropping(true)
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    )}

                    {additionalImageUrl && !additionalUploading && (
                      <>
                        <input
                          value={additionalDocNumber}
                          onChange={(e) => setAdditionalDocNumber(e.target.value)}
                          placeholder="Document number"
                          className="block w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          required
                        />
                        <button
                          type="button"
                          disabled={additionalSubmitting || !additionalDocNumber.trim()}
                          onClick={async () => {
                            if (!additionalDocNumber.trim()) return
                            setAdditionalSubmitting(true)
                            try {
                              const existingDoc = data?.documents?.find(d => d.documentType === type)
                              const isUpdate = !!existingDoc
                              const res = await fetch(`/api/user/kyc${isUpdate ? `/${existingDoc!.id}` : ""}`, {
                                method: isUpdate ? "PATCH" : "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  documentType: type,
                                  documentNumber: additionalDocNumber.trim(),
                                  frontImage: additionalImageUrl,
                                }),
                              })
                              if (!res.ok) {
                                const err = await res.json()
                                throw new Error(err.error || "Failed to submit")
                              }
                              setAdditionalDocType(null)
                              setAdditionalPreview(null)
                              setAdditionalImageUrl("")
                              setAdditionalDocNumber("")
                              setAdditionalIsPdf(false)
                              setMessage({ type: "success", text: `${label} submitted for verification` })
                              fetchKyc()
                            } catch (err) {
                              setMessage({
                                type: "error",
                                text: err instanceof Error ? err.message : "Failed to submit",
                              })
                            } finally {
                              setAdditionalSubmitting(false)
                            }
                          }}
                          className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {additionalSubmitting ? (
                            <><Loader2 className="h-3 w-3 animate-spin" /> Submitting...</>
                          ) : (
                            <>Submit {label}</>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAdditionalDocType(type)
                      setAdditionalPreview(null)
                      setAdditionalImageUrl("")
                      setAdditionalDocNumber("")
                    }}
                    className="w-full text-left"
                  >
                    <h3 className="text-sm font-semibold text-foreground">{label}</h3>
                    <p className="mt-1 text-[11px] text-muted">{desc}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-teal-600 hover:text-teal-700">
                      <Upload size={12} /> Upload
                    </span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="mb-4 font-heading text-xl font-semibold text-text-primary">
          Submission History
        </h2>

        {data?.documents && data.documents.length > 0 ? (
          <div className="space-y-4">
            {data.documents.map((doc) => (
              <div key={doc.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted">Document:</span>
                      <span className="font-medium text-foreground">
                        {doc.documentType ? docTypeLabels[doc.documentType] || doc.documentType : "Unknown"}
                      </span>
                    </div>
                    {doc.documentNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted">Number:</span>
                        <span className="font-mono text-xs text-foreground">{doc.documentNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted">Submitted:</span>
                      <span className="text-foreground">{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded text-xs font-medium",
                        doc.status === "PENDING" && "bg-yellow-500/20 text-yellow-600",
                        doc.status === "VERIFIED" && "bg-green-500/20 text-green-600",
                        doc.status === "REJECTED" && "bg-red-500/20 text-red-600"
                      )}>
                        {doc.status === "PENDING" && "Pending Review"}
                        {doc.status === "VERIFIED" && "Verified"}
                        {doc.status === "REJECTED" && "Rejected"}
                      </span>
                      {doc.status === "REJECTED" && (
                        <button
                          type="button"
                          disabled={deleting === doc.id}
                          onClick={async () => {
                            if (!confirm("Delete this rejected submission permanently?")) return
                            setDeleting(doc.id)
                            try {
                              const res = await fetch(`/api/user/kyc/${doc.id}`, { method: "DELETE" })
                              if (!res.ok) {
                                const err = await res.json()
                                throw new Error(err.error || "Failed to delete")
                              }
                              setMessage({ type: "success", text: "Submission deleted" })
                              fetchKyc()
                            } catch (err) {
                              setMessage({
                                type: "error",
                                text: err instanceof Error ? err.message : "Failed to delete",
                              })
                            } finally {
                              setDeleting(null)
                            }
                          }}
                          className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete permanently"
                        >
                          {deleting === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      )}
                    </div>
                    {doc.rejectionReason && (
                      <p className="text-xs text-red-500">Reason: {doc.rejectionReason}</p>
                    )}
                  </div>
                </div>

                {(doc.frontImage || doc.backImage) && (
                  <div className="mt-4 flex items-start gap-4">
                    {doc.frontImage && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted">
                          {doc.documentType === "BUSINESS_PERMIT" || doc.documentType === "BUSINESS_REGISTRATION" || doc.documentType === "KRA_PIN" ? "Document" : "Front"}
                        </p>
                        {doc.frontImage.match(/\.pdf/i) ? (
                          <PdfViewer url={doc.frontImage} label={doc.documentType} compact />
                        ) : (
                          <DocImage src={doc.frontImage} label={doc.documentType} />
                        )}
                      </div>
                    )}
                    {doc.backImage && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted">Back</p>
                        {doc.backImage.match(/\.pdf/i) ? (
                          <PdfViewer url={doc.backImage} label="Back" compact />
                        ) : (
                          <DocImage src={doc.backImage} label="Back" />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted">No submissions yet</p>
          </div>
        )}
      </div>
    </div>
  )
}