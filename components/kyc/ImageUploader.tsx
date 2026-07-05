"use client"

import { useState, useRef, useCallback } from "react"
import { Camera, Upload, X, RotateCcw } from "lucide-react"

interface ImageUploaderProps {
  label: string
  value: string | null
  onChange: (value: string | null) => void
  side: "front" | "back"
}

const CR80_ASPECT_RATIO = 85.6 / 54 // 1.585:1
const TARGET_WIDTH = 1685 // ~500 DPI for CR80 width (85.6mm = 3.37" * 500)
const TARGET_HEIGHT = 1063 // ~500 DPI for CR80 height (54mm = 2.125" * 500)
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function ImageUploader({ label, value, onChange, side }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(value)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processImage = useCallback(async (file: File) => {
    setError(null)
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG or PNG)")
      return
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be under 5MB")
      return
    }

    setProcessing(true)

    try {
      // Read the image
      const imgBitmap = await createImageBitmap(file)
      
      // Create canvas for processing
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        setError("Failed to process image")
        setProcessing(false)
        return
      }

      // Calculate crop to fit CR80 aspect ratio
      const imgAspect = imgBitmap.width / imgBitmap.height
      let cropWidth = imgBitmap.width
      let cropHeight = imgBitmap.height

      if (imgAspect > CR80_ASPECT_RATIO) {
        // Image is wider than CR80, crop width
        cropWidth = imgBitmap.height * CR80_ASPECT_RATIO
      } else {
        // Image is taller than CR80, crop height
        cropHeight = imgBitmap.width / CR80_ASPECT_RATIO
      }

      const cropX = (imgBitmap.width - cropWidth) / 2
      const cropY = (imgBitmap.height - cropHeight) / 2

      // Set canvas to target CR80 resolution
      canvas.width = TARGET_WIDTH
      canvas.height = TARGET_HEIGHT

      // Draw cropped and resized image
      ctx.drawImage(
        imgBitmap,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, TARGET_WIDTH, TARGET_HEIGHT
      )

      // Compress to JPEG with quality adjustment to stay under 5MB
      let quality = 0.92
      let dataUrl: string

      do {
        dataUrl = canvas.toDataURL("image/jpeg", quality)
        const base64Length = dataUrl.length * 0.75 // Approximate bytes
        if (base64Length <= MAX_FILE_SIZE || quality < 0.5) break
        quality -= 0.08
      } while (quality >= 0.5)

      // Verify final size
      const finalSize = dataUrl.length * 0.75
      if (finalSize > MAX_FILE_SIZE) {
        setError("Image too large even after compression. Please use a clearer photo.")
        setProcessing(false)
        return
      }

      setPreview(dataUrl)
      onChange(dataUrl)
    } catch (err) {
      console.error("Image processing error:", err)
      setError("Failed to process image. Please try again.")
    } finally {
      setProcessing(false)
    }
  }, [onChange])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImage(file)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [processImage])

  const handleClear = useCallback(() => {
    setPreview(null)
    onChange(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [onChange])

  const handleRetry = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-primary">
        {label}
      </label>
      
      {!preview ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="flex-1 touch-target flex items-center justify-center gap-2 rounded-sm border border-border bg-surface px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
            {processing ? "Processing..." : "Take Photo"}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="flex-1 touch-target flex items-center justify-center gap-2 rounded-sm border border-border bg-surface px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {processing ? "Processing..." : "Upload"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative rounded-sm border border-border overflow-hidden bg-surface-secondary">
          <img
            src={preview}
            alt={`${side} side of document`}
            className="w-full h-auto object-contain"
            style={{ aspectRatio: `${CR80_ASPECT_RATIO}` }}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={handleRetry}
              disabled={processing}
              className="touch-target p-2 rounded-full bg-black/60 text-white hover:bg-black/80 disabled:cursor-not-allowed"
              title="Replace image"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={processing}
              className="touch-target p-2 rounded-full bg-black/60 text-white hover:bg-black/80 disabled:cursor-not-allowed"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {processing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-300 border-t-transparent" />
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-error-500">{error}</p>
      )}

      <p className="text-xs text-text-secondary">
        JPG or PNG only. Max 5MB. Auto-cropped to ID card size (CR80).
      </p>
    </div>
  )
}