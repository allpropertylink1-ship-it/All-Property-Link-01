"use client"

import { useState } from "react"
import { Upload, XCircle, FileText, Trash2 } from "@/components/ui/icons"
import PdfViewer from "@/components/kyc/PdfViewer"
import ImageCropper from "@/components/kyc/ImageCropper"

interface Props {
  docType: string
  docNumber: string
  frontFile: File | null
  backFile: File | null
  frontUrl: string
  backUrl: string
  businessPermitFile: File | null
  businessPermitUrl: string
  onDocTypeChange: (v: string) => void
  onDocNumberChange: (v: string) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => void
  onBusinessPermitSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (side: "front" | "back") => void
  onRemoveBusinessPermit: () => void
  onStartCrop: (side: "front" | "back") => void
  onCropComplete: (blob: Blob) => Promise<void>
  onCancelCrop: () => void
  cropping: "front" | "back" | null
  setMessage: (msg: { type: "success" | "error"; text: string } | null) => void
}

const CORE_TYPES = ["NATIONAL_ID", "DRIVERS_LICENSE", "PASSPORT"]
const LABELS: Record<string, string> = {
  NATIONAL_ID: "National ID Card", DRIVERS_LICENSE: "Driver's License", PASSPORT: "Passport",
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

const previewUrl = (f: File | null) => f ? URL.createObjectURL(f) : null
const isPdf = (url: string) => /\.pdf$/i.test(url)

export function DocumentUpload(props: Props) {
  const [localMsg, setLocalMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setLocalMsg({ type: "error", text: "Only JPG and PNG files are allowed" })
      e.target.value = ""
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setLocalMsg({ type: "error", text: "File must be under 10MB" })
      e.target.value = ""
      return
    }
    setLocalMsg(null)
    props.onFileSelect(e, side)
  }

  const handleBusinessPermitSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== "application/pdf") {
      setLocalMsg({ type: "error", text: "Only PDF files are allowed" })
      e.target.value = ""
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setLocalMsg({ type: "error", text: "File must be under 10MB" })
      e.target.value = ""
      return
    }
    setLocalMsg(null)
    props.onBusinessPermitSelect(e)
  }

  const msg = localMsg

  return (
    <>
      {msg && (
        <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${msg.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Core Identity Document <span className="text-sm font-normal text-muted">(Required)</span>
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Document type</label>
            <select value={props.docType} onChange={e => props.onDocTypeChange(e.target.value)}
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              {CORE_TYPES.map(t => <option key={t} value={t}>{LABELS[t]}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Document number</label>
            <input value={props.docNumber} onChange={e => props.onDocNumberChange(e.target.value)} placeholder="Enter ID number"
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Front image</label>
            {props.frontFile ? (
              <div className="space-y-2">
                {props.cropping === "front" && props.frontFile ? (
                  <ImageCropper imageUrl={previewUrl(props.frontFile)!} onCropComplete={props.onCropComplete} onCancel={props.onCancelCrop} sideLabel="Front" />
                ) : (
                  <>
                    <FilePreview url={previewUrl(props.frontFile)!} onRemove={() => { props.onRemoveFile("front"); URL.revokeObjectURL(previewUrl(props.frontFile)!) }} />
                    <button type="button" onClick={() => props.onStartCrop("front")} className="text-xs text-primary hover:underline">Re-crop</button>
                  </>
                )}
              </div>
            ) : props.frontUrl ? (
              <div className="space-y-2">
                {isPdf(props.frontUrl) ? <PdfViewer url={props.frontUrl} compact /> : <img src={props.frontUrl} alt="" className="h-44 w-full rounded-lg object-cover" />}
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
            {props.backFile ? (
              <div className="space-y-2">
                {props.cropping === "back" && props.backFile ? (
                  <ImageCropper imageUrl={previewUrl(props.backFile)!} onCropComplete={props.onCropComplete} onCancel={props.onCancelCrop} sideLabel="Back" />
                ) : (
                  <>
                    <FilePreview url={previewUrl(props.backFile)!} onRemove={() => { props.onRemoveFile("back"); URL.revokeObjectURL(previewUrl(props.backFile)!) }} />
                    <button type="button" onClick={() => props.onStartCrop("back")} className="text-xs text-primary hover:underline">Re-crop</button>
                  </>
                )}
              </div>
            ) : props.backUrl ? (
              <div className="space-y-2">
                {isPdf(props.backUrl) ? <PdfViewer url={props.backUrl} compact /> : <img src={props.backUrl} alt="" className="h-44 w-full rounded-lg object-cover" />}
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

      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Business Permit <span className="text-sm font-normal text-muted">(Optional — upload your business permit document)</span>
        </h2>
        {props.businessPermitFile ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
            <FileText size={24} className="text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{props.businessPermitFile.name}</p>
              <p className="text-xs text-muted">{(props.businessPermitFile.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <button type="button" onClick={props.onRemoveBusinessPermit} className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ) : props.businessPermitUrl ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
            <FileText size={24} className="text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Business Permit</p>
            </div>
            <a href={props.businessPermitUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View</a>
          </div>
        ) : (
          <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted/50 bg-background hover:border-primary/50 hover:bg-primary/5 transition-colors">
            <FileText className="mb-2 h-6 w-6 text-muted" />
            <span className="text-sm text-muted">Upload business permit (PDF)</span>
            <span className="mt-1 text-xs text-muted">PDF only, max 10MB</span>
            <input type="file" accept="application/pdf" onChange={handleBusinessPermitSelect} className="hidden" />
          </label>
        )}
      </div>
    </>
  )
}
