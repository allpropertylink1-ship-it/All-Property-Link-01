"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield, CheckCircle, XCircle, Clock, Upload, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import ImageCropper from "@/components/kyc/ImageCropper"

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
  user: { kycStatus: string; firstName: string; lastName: string } | null
  documents: KycDoc[]
}

const docTypeLabels: Record<string, string> = {
  NATIONAL_ID: "National ID Card",
  DRIVERS_LICENSE: "Driver's License",
  PASSPORT: "Passport",
}

const docTypeAspectRatios: Record<string, number> = {
  NATIONAL_ID: 85.6 / 54,
  DRIVERS_LICENSE: 85.6 / 54,
  PASSPORT: 125 / 88,
}

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"]

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
    const side = croppingFor!
    await uploadCroppedBlob(croppedBlob, side)
    setCroppingFor(null)
    setCropImageUrl(null)
    setMessage(null)
  }

  const handleCropCancel = () => {
    if (croppingFor === "front") {
      setFrontPreview(null)
    } else {
      setBackPreview(null)
    }
    setCroppingFor(null)
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

  const kycStatus = data?.user?.kycStatus || "NONE"
  const status: StatusInfo = statusDisplay[kycStatus] || statusDisplay.NONE
  const StatusIcon = status.icon

  return (
    <div className="space-y-8">
      {cropImageUrl && croppingFor && (
        <ImageCropper
          imageUrl={cropImageUrl}
          aspectRatio={docTypeAspectRatios[documentType]}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          sideLabel={croppingFor === "front" ? "Front" : "Back"}
        />
      )}

      <div className="flex items-center justify-between mb-6">
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
            {kycStatus === "REJECTED" && data?.documents[0]?.rejectionReason && (
              <p className="text-sm text-error-500">
                Reason: {data.documents[0].rejectionReason}
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

      {kycStatus !== "VERIFIED" && (
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
                    {doc.rejectionReason && (
                      <p className="mt-1 text-xs text-red-500">Reason: {doc.rejectionReason}</p>
                    )}
                  </div>
                </div>

                {(doc.frontImage || doc.backImage) && (
                  <div className="mt-4 flex items-start gap-4">
                    {doc.frontImage && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted">Front</p>
                        <img
                          src={doc.frontImage}
                          alt="Front ID"
                          className="h-20 w-28 rounded-lg border border-border object-cover"
                        />
                      </div>
                    )}
                    {doc.backImage && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted">Back</p>
                        <img
                          src={doc.backImage}
                          alt="Back ID"
                          className="h-20 w-28 rounded-lg border border-border object-cover"
                        />
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