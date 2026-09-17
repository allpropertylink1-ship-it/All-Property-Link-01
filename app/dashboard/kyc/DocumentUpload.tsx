/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useMemo, useState } from "react"
import { resolveImageUrl } from "@/lib/images";
import { XCircle, FileText, Trash2 } from "@/components/ui/icons"
import PdfViewer from "@/components/kyc/PdfViewer"
import ImageCropDialog from "@/components/shared/ImageCropDialog"
import DragDropUploader from "@/components/kyc/DragDropUploader"
import { FormBanner } from "@/components/shared/FormFeedback"
import { HEIC_HINT, isHeicFile } from "@/lib/image-client"

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
  onFileDirect?: (file: File, side: "front" | "back") => void
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
          <a href={url} target="_blank" rel="noopener noreferrer" className="relative block overflow-hidden rounded-xl border border-border hover:ring-2 hover:ring-primary-600/30 transition-all">
          <img src={url} alt="" className="h-44 w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
        </a>
      )}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label="Remove preview" className="touch-target absolute -right-2 -top-2 rounded-full bg-surface p-2 text-error-500 shadow hover:bg-error-50 transition-colors">
          <XCircle size={16} />
        </button>
      )}
    </div>
  )
}

const isPdf = (url: string) => /\.pdf$/i.test(url)

const usePreviewUrl = (file: File | null) => {
  // Memoized so render churn never mints spare object URLs (the old
  // previewUrl() helper created a new URL per call — and revoking a *second*
  // fresh URL on remove leaked the first). Revoked exactly once on swap/unmount.
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);
  return url;
};

export function DocumentUpload(props: Props) {
  const [localMsg, setLocalMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const frontPreviewUrl = usePreviewUrl(props.frontFile)
  const backPreviewUrl = usePreviewUrl(props.backFile)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0]
    if (!file) return
    if (isHeicFile(file)) { setLocalMsg({ type: "error", text: HEIC_HINT }); e.target.value = ""; return }
    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
      setLocalMsg({ type: "error", text: "Only JPEG, PNG and WebP are allowed" })
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
        <div className="mb-4">
          <FormBanner variant={msg.type === "success" ? "success" : "error"}>
            {msg.text}
          </FormBanner>
        </div>
      )}

      <section aria-labelledby="kyc-core-doc-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 id="kyc-core-doc-heading" className="font-heading text-base font-semibold text-text-primary">
          Core Identity Document
        </h2>
        <p className="mb-4 mt-0.5 text-sm text-text-secondary">Required — front image plus document number.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="kycDocType">Document type</label>
            <select id="kycDocType" value={props.docType} onChange={e => props.onDocTypeChange(e.target.value)}
              className="block min-h-[44px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-600/20">
              {CORE_TYPES.map(t => <option key={t} value={t}>{LABELS[t]}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="kycDocNumber">Document number</label>
            <input id="kycDocNumber" value={props.docNumber} onChange={e => props.onDocNumberChange(e.target.value)} placeholder="Enter ID number"
              className="block min-h-[44px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-600/20" />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-1 block text-sm font-medium text-text-primary" id="kyc-front-label">Front image</span>
            {props.frontFile ? (
              <div className="space-y-2" role="group" aria-labelledby="kyc-front-label">
                {props.cropping === "front" && props.frontFile ? (
                  <ImageCropDialog
                    sourceFile={props.frontFile}
                    label="Front"
                    guidance="Position the document so all four corners, the photo and the number are clearly visible."
                    docGuard
                    warnOnSkip
                    context="kyc-front"
                    onComplete={props.onCropComplete}
                    onSkip={props.onCancelCrop}
                    onCancel={props.onCancelCrop}
                  />
                ) : (
                  <>
                    {frontPreviewUrl && (
                      <FilePreview url={frontPreviewUrl} onRemove={() => props.onRemoveFile("front")} />
                    )}
                    <button type="button" onClick={() => props.onStartCrop("front")} className="touch-target rounded-lg px-2 py-1 text-xs font-medium text-primary-600 hover:underline">Re-crop</button>
                  </>
                )}
              </div>
            ) : props.frontUrl ? (
              <div className="space-y-2">
                {isPdf(props.frontUrl) ? <PdfViewer url={resolveImageUrl(props.frontUrl) ?? props.frontUrl} compact /> : <img src={resolveImageUrl(props.frontUrl) ?? undefined} alt="" className="h-44 w-full rounded-lg object-cover" />}
              </div>
            ) : (
              <DragDropUploader
                label="front image"
                hint="JPG, PNG or WebP, max 10MB — drag & drop, click, or camera"
                onFile={(f) => {
                  if (props.onFileDirect) props.onFileDirect(f, "front")
                  else {
                    const dt = new DataTransfer()
                    dt.items.add(f)
                    const input = document.createElement("input")
                    input.files = dt.files
                    handleFileSelect({ target: input } as unknown as React.ChangeEvent<HTMLInputElement>, "front")
                  }
                }}
                onError={(t) => setLocalMsg({ type: "error", text: t })}
              />
            )}
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium text-text-primary" id="kyc-back-label">Back image <span className="text-xs font-normal text-text-secondary">(optional)</span></span>
            {props.backFile ? (
              <div className="space-y-2" role="group" aria-labelledby="kyc-back-label">
                {props.cropping === "back" && props.backFile ? (
                  <ImageCropDialog
                    sourceFile={props.backFile}
                    label="Back"
                    guidance="Position the document so all four corners are clearly visible."
                    docGuard
                    warnOnSkip
                    context="kyc-back"
                    onComplete={props.onCropComplete}
                    onSkip={props.onCancelCrop}
                    onCancel={props.onCancelCrop}
                  />
                ) : (
                  <>
                    {backPreviewUrl && (
                      <FilePreview url={backPreviewUrl} onRemove={() => props.onRemoveFile("back")} />
                    )}
                    <button type="button" onClick={() => props.onStartCrop("back")} className="touch-target rounded-lg px-2 py-1 text-xs font-medium text-primary-600 hover:underline">Re-crop</button>
                  </>
                )}
              </div>
            ) : props.backUrl ? (
              <div className="space-y-2">
                {isPdf(props.backUrl) ? <PdfViewer url={resolveImageUrl(props.backUrl) ?? props.backUrl} compact /> : <img src={resolveImageUrl(props.backUrl) ?? undefined} alt="" className="h-44 w-full rounded-lg object-cover" />}
              </div>
            ) : (
              <DragDropUploader
                label="back image"
                hint="JPG, PNG or WebP — drag & drop, click, or camera"
                onFile={(f) => {
                  if (props.onFileDirect) props.onFileDirect(f, "back")
                  else {
                    const dt = new DataTransfer()
                    dt.items.add(f)
                    const input = document.createElement("input")
                    input.files = dt.files
                    handleFileSelect({ target: input } as unknown as React.ChangeEvent<HTMLInputElement>, "back")
                  }
                }}
                onError={(t) => setLocalMsg({ type: "error", text: t })}
              />
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="kyc-permit-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 id="kyc-permit-heading" className="font-heading text-base font-semibold text-text-primary">
          Business Permit
        </h2>
        <p className="mb-4 mt-0.5 text-sm text-text-secondary">Optional — upload your business permit document.</p>
        {props.businessPermitFile ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-secondary p-4">
            <FileText size={24} className="text-primary-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary truncate">{props.businessPermitFile.name}</p>
              <p className="text-xs text-text-secondary">{(props.businessPermitFile.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <button type="button" onClick={props.onRemoveBusinessPermit} aria-label="Remove business permit" className="touch-target rounded-lg p-2.5 text-error-500 hover:bg-error-50 hover:text-error-600 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ) : props.businessPermitUrl ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-secondary p-4">
            <FileText size={24} className="text-primary-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary">Business Permit</p>
            </div>
            <a href={props.businessPermitUrl} target="_blank" rel="noopener noreferrer" className="touch-target rounded-lg px-2 py-1 text-xs font-medium text-primary-600 hover:underline">View</a>
          </div>
        ) : (
          <label className="touch-target flex min-h-[44px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-secondary hover:border-primary-500 hover:bg-primary-50/50 transition-colors p-6">
            <FileText className="mb-2 h-6 w-6 text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">Upload business permit (PDF)</span>
            <span className="mt-1 text-xs text-text-secondary">PDF only, max 10MB</span>
            <input type="file" accept="application/pdf" onChange={handleBusinessPermitSelect} className="hidden" aria-label="Upload business permit PDF" />
          </label>
        )}
      </section>
    </>
  )
}
