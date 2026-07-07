"use client"

import { useState } from "react"
import { Shield, CheckCircle, XCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { resolvePdfUrl } from "@/lib/pdf-utils"
import UploadZone from "./UploadZone"
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
  cropDocType: string | null
  onDocumentTypeChange: (value: string) => void
  onDocumentNumberChange: (value: string) => void
  onHandleFileSelect: (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => void
  onHandleCropComplete: (croppedBlob: Blob) => void
  onHandleCropCancel: () => void
  onRemoveCoreImage: (side: "front" | "back") => void
  aspectRatios: Record<string, number>
  docTypeLabels: Record<string, string>
  coreTypes: readonly string[]
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
  cropDocType,
  onDocumentTypeChange,
  onDocumentNumberChange,
  onHandleFileSelect,
  onHandleCropComplete,
  onHandleCropCancel,
  onRemoveCoreImage,
  aspectRatios,
  docTypeLabels,
  coreTypes,
  isReSubmit,
  coreDocSubmitted,
  coreDocStatus,
}: CoreDocumentFormProps) {
  const isCoreDocSubmitted = coreDocSubmitted && coreDocStatus !== "REJECTED"
  const isCoreDocPending = coreDocStatus === "PENDING"
  const isCoreDocRejected = coreDocStatus === "REJECTED" && coreDocSubmitted
  const isCoreDocVerified = coreDocStatus === "VERIFIED"
  
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
                onChange={e => { onDocumentTypeChange(e.target.value) }}
                className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
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
                onChange={e => onDocumentNumberChange(e.target.value)}
                placeholder="Enter your ID number"
                className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Front image</label>
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
              <label className="mb-1 block text-sm font-medium text-foreground">
                Back image <span className="text-xs text-muted">(optional)</span>
              </label>
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
              aspectRatio={croppingFor === "additional" && cropDocType
                ? (aspectRatios[cropDocType] || 1.42)
                : aspectRatios[documentType]}
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
                  <h3 className="text-sm font-medium text-foreground">Front Image</h3>
                  {frontImageUrl.match(/\.pdf/i) ? (
                    <PdfViewer url={frontImageUrl} label="Front" compact />
                  ) : (
                    <div className="space-y-2">
                      <img src={frontImageUrl} alt="Front ID" className="h-32 w-full rounded object-cover" />
                      <button onClick={handleRemoveFront} className="text-xs text-red-500 hover:text-red-600">
                        Remove Front Image
                      </button>
                    </div>
                  )}
                </div>
              )}
              {backImageUrl && !uploadingBack && !croppingFor && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-foreground">Back Image</h3>
                  {backImageUrl.match(/\.pdf/i) ? (
                    <PdfViewer url={backImageUrl} label="Back" compact />
                  ) : (
                    <div className="space-y-2">
                      <img src={backImageUrl} alt="Back ID" className="h-32 w-full rounded object-cover" />
                      <button onClick={handleRemoveBack} className="text-xs text-red-500 hover:text-red-600">
                        Remove Back Image
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}