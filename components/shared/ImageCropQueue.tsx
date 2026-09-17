"use client";

import { useCallback, useState } from "react";
import ImageCropDialog from "@/components/shared/ImageCropDialog";
import { cropBlobToFile } from "@/lib/crop-utils";

interface ImageCropQueueProps {
  files: File[];
  /** Label for the current photo, e.g. (i, n) => `Cover photo` or `Photo 3 of 7`. */
  label: (index: number, total: number, file: File) => string;
  guidance?: string;
  /** Telemetry prefix, e.g. "property-gallery". Suffixed with -i/total per photo. */
  context?: string;
  /** Cropped-or-original Files, in selection order. */
  onDone: (files: File[]) => void;
  /** Discard the whole queue (nothing uploads). */
  onCancel: () => void;
}

/**
 * Steps through a multi-select batch one photo at a time: Apply crop /
 * Use original per photo, plus "Use originals for the rest" so a 9-photo
 * batch never traps the user in nine forced dialogs.
 */
export default function ImageCropQueue({
  files,
  label,
  guidance,
  context,
  onDone,
  onCancel,
}: ImageCropQueueProps) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<File[]>([]);

  const advance = useCallback(
    (file: File, nextIndex: number) => {
      const next = [...results, file];
      if (nextIndex >= files.length) {
        onDone(next);
      } else {
        setResults(next);
        setIndex(nextIndex);
      }
    },
    [results, files.length, onDone]
  );

  const handleComplete = useCallback(
    (blob: Blob) => {
      const file = files[index];
      advance(cropBlobToFile(blob, file?.name ?? `photo-${index + 1}`), index + 1);
    },
    [files, index, advance]
  );

  const handleSkip = useCallback(() => {
    const file = files[index];
    if (file) advance(file, index + 1);
  }, [files, index, advance]);

  const handleSkipRest = useCallback(() => {
    onDone([...results, ...files.slice(index)]);
  }, [results, files, index, onDone]);

  const current = files[index];
  if (!current) return null;

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-3">
        <div className="flex items-center gap-3 rounded-full border border-border bg-surface/95 py-1.5 pl-4 pr-1.5 text-xs font-medium text-text-secondary shadow-lg">
          <span aria-live="polite" className="tabular-nums">
            Photo {index + 1} of {files.length}
          </span>
          {index < files.length - 1 && (
            <button
              type="button"
              onClick={handleSkipRest}
              className="touch-target min-h-[44px] rounded-full px-3 text-primary-600 hover:underline"
            >
              Use originals for the rest
            </button>
          )}
        </div>
      </div>
      <ImageCropDialog
        key={`${index}-${current.name}-${current.size}`}
        sourceFile={current}
        label={label(index, files.length, current)}
        guidance={guidance}
        context={context ? `${context}-${index + 1}` : undefined}
        onComplete={handleComplete}
        onSkip={handleSkip}
        onCancel={onCancel}
      />
    </>
  );
}
