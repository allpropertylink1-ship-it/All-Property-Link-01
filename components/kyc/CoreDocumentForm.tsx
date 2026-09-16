/* eslint-disable @next/next/no-img-element */
"use client"

import UploadZone from "./UploadZone"
import { resolveImageUrl } from "@/lib/images";
import ImageCropper from "./ImageCropper"
import PdfViewer from "./PdfViewer"

interface CoreDocumentFormProps {
  documentType: string
  documentNumber: string
  frontImageUrl: string
  backImageUrl: string
  frontPreview: string | null
  backPreview: string | null
  uploadingFront: boolean
  uploadingBack: boolean
  croppingFor: "front" | "back" | null
  cropImageUrl: string | null
  onDocumentTypeChange: (value: string) => void
  onDocumentNumberChange: (value: string) => void
  onHandleFileSelect: (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => void
  onHandleCropComplete: (croppedBlob: Blob) => Promise<void>
  onHandleCropCancel: () => void
  onRemoveCoreImage: (side: "front" | "back") => void
  docTypeLabels: Record<string, string>
  isReSubmit: boolean
  coreDocSubmitted: boolean
  coreDocStatus: string | null
}

export default function CoreDocumentForm({
  documentType,
  documentNumber,
  frontImageUrl,
  backImageUrl,
  frontPreview,
  backPreview,
  uploadingFront,
  uploadingBack,
  croppingFor,
  cropImageUrl,
  onDocumentTypeChange,
  onDocumentNumberChange,
  onHandleFileSelect,
  onHandleCropComplete,
  onHandleCropCancel,
  onRemoveCoreImage,
  docTypeLabels,
  isReSubmit,
  coreDocSubmitted,
  coreDocStatus,
}: CoreDocumentFormProps) {
  const isCoreDocSubmitted = coreDocSubmitted && coreDocStatus !== "REJECTED"
  const isCoreDocPending = coreDocStatus === "PENDING"
  const isCoreDocRejected = coreDocStatus === "REJECTED" && coreDocSubmitted
  
  const handleFrontSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onHandleFileSelect(e, "front")
  }
  
  const handleBackSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onHandleFileSelect(e, "back")
  }
  
  const handleRemoveFront = () => {
    onRemoveCoreImage("front")
  }
  
  const handleRemoveBack = () => {
    onRemoveCoreImage("back")
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="core-doc-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 id="core-doc-heading" className="font-heading text-base font-semibold text-text-primary">
          {isReSubmit ? "Re-submit Core Document" : "Core Identity Document"}
        </h2>
        <p className="mb-4 mt-0.5 text-sm text-text-secondary">Required — front image plus document number.</p>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="coreDocType">Document type</label>
              <select
                id="coreDocType"
                value={documentType}
                onChange={e => { onDocumentTypeChange(e.target.value) }}
                className="block min-h-[44px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30"
              >
                {["NATIONAL_ID", "DRIVERS_LICENSE", "PASSPORT"].map(t => (
                  <option key={t} value={t}>{docTypeLabels[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="coreDocNumber">Document number</label>
              <input
                id="coreDocNumber"
                value={documentNumber}
                onChange={e => onDocumentNumberChange(e.target.value)}
                placeholder="Enter your ID number"
                className="block min-h-[44px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-sm font-medium text-text-primary" id="core-front-label">Front image</span>
              <UploadZone
                preview={frontPreview}
                fileUrl={frontImageUrl}
                uploading={uploadingFront}
                isPdf={false}
                onSelect={handleFrontSelect}
                onRemove={handleRemoveFront}
                accept="image/jpeg,image/png,image/jpg"
                label="Front Image"
                sizeHint="JPG or PNG, max 10MB"
                showRemove={isCoreDocSubmitted && !isCoreDocPending}
              />
            </div>
            <div>
              <span className="mb-1 block text-sm font-medium text-text-primary" id="core-back-label">
                Back image <span className="text-xs font-normal text-text-secondary">(optional)</span>
              </span>
              <UploadZone
                preview={backPreview}
                fileUrl={backImageUrl}
                uploading={uploadingBack}
                isPdf={false}
                onSelect={handleBackSelect}
                onRemove={handleRemoveBack}
                accept="image/jpeg,image/png,image/jpg"
                label="Back Image"
                sizeHint="JPG or PNG, max 10MB"
                showRemove={isCoreDocSubmitted && !isCoreDocPending}
              />
            </div>
          </div>

          {/* Cropper trigger - only show if we have a preview and are cropping */}
          {cropImageUrl && croppingFor && (
            <ImageCropper
              imageUrl={cropImageUrl}
              onCropComplete={onHandleCropComplete}
              onCancel={onHandleCropCancel}
              sideLabel={
                croppingFor === "front" ? "Front" :
                croppingFor === "back" ? "Back" : "Document"
              }
            />
          )}

          {/* Show current documents if already submitted (and not pending/rejected for editing) */}
          {(!isCoreDocSubmitted || isCoreDocRejected || isCoreDocPending) && (
            <>
              {frontImageUrl && !uploadingFront && !croppingFor && (
                <div className="mt-4">
                  <h3 className="font-heading text-sm font-semibold text-text-primary">Front Image</h3>
                  {frontImageUrl.match(/\.pdf/i) ? (
                    <PdfViewer url={frontImageUrl} label="Front" compact />
                  ) : (
                    <div className="space-y-2">
                      <img src={resolveImageUrl(frontImageUrl) ?? undefined} alt="Front ID" className="h-32 w-full rounded-xl object-cover border border-border" />
                      <button type="button" onClick={handleRemoveFront} className="touch-target rounded-lg px-2 py-1 text-xs font-medium text-error-600 hover:bg-error-50">
                        Remove Front Image
                      </button>
                    </div>
                  )}
                </div>
              )}
              {backImageUrl && !uploadingBack && !croppingFor && (
                <div className="mt-4">
                  <h3 className="font-heading text-sm font-semibold text-text-primary">Back Image</h3>
                  {backImageUrl.match(/\.pdf/i) ? (
                    <PdfViewer url={backImageUrl} label="Back" compact />
                  ) : (
                    <div className="space-y-2">
                      <img src={resolveImageUrl(backImageUrl) ?? undefined} alt="Back ID" className="h-32 w-full rounded-xl object-cover border border-border" />
                      <button type="button" onClick={handleRemoveBack} className="touch-target rounded-lg px-2 py-1 text-xs font-medium text-error-600 hover:bg-error-50">
                        Remove Back Image
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}