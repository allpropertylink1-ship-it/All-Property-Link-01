"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { deleteProperty, restoreProperty, purgeProperty } from "@/app/actions/properties";
import { deleteService, restoreService, purgeService } from "@/app/actions/services";

interface ListingRowActionsProps {
  kind: "property" | "service";
  id: string;
  title: string;
  deleted: boolean;
}

const KIND_LABEL = { property: "listing", service: "service" } as const;

export function ListingRowActions({ kind, id, title, deleted }: ListingRowActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const label = KIND_LABEL[kind];

  function run(fn: () => Promise<{ success: boolean; error?: string }>) {
    setError("");
    startTransition(async () => {
      const result = await fn();
      if (!result.success) {
        setError(result.error || "Action failed");
        return;
      }
      router.refresh();
    });
  }

  const onDelete = () => run(() => (kind === "property" ? deleteProperty(id) : deleteService(id)));
  const onRestore = () => run(() => (kind === "property" ? restoreProperty(id) : restoreService(id)));
  const onPurge = (confirmTitle: string) =>
    run(() => (kind === "property" ? purgeProperty(id, confirmTitle) : purgeService(id, confirmTitle)));

  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {!deleted ? (
        <ConfirmDialog
          trigger={
            <button
              type="button"
              disabled={pending}
              className="touch-target inline-flex items-center rounded-lg px-3 py-2 text-xs font-medium text-error-600 transition-colors hover:bg-error-500/10 disabled:opacity-50"
            >
              {pending ? "Working…" : "Delete"}
            </button>
          }
          title={`Delete this ${label}?`}
          description={`"${title}" moves to the recycle bin for 3 days. You can restore it, or permanently delete it from there.`}
          confirmLabel="Move to bin"
          confirmVariant="destructive"
          onConfirm={onDelete}
        />
      ) : (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={onRestore}
            className="touch-target inline-flex items-center rounded-lg px-3 py-2 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50 disabled:opacity-50"
          >
            {pending ? "Working…" : "Restore"}
          </button>
          <ConfirmDialog
            trigger={
              <button
                type="button"
                disabled={pending}
                className="touch-target inline-flex items-center rounded-lg px-3 py-2 text-xs font-medium text-error-600 transition-colors hover:bg-error-500/10 disabled:opacity-50"
              >
                Purge
              </button>
            }
            title={`Permanently delete this ${label}?`}
            description={
              <>
                This cannot be undone. Reviews, photos and the public page are removed. Linked payment records
                keep a title reference. The URL will never be reused. Backup copies expire with retention.
              </>
            }
            confirmLabel="Purge forever"
            confirmVariant="destructive"
            requiresInput
            requiredInputValue={title}
            inputLabel={`Type "${title}" to confirm`}
            inputPlaceholder={title}
            onConfirmWithInput={onPurge}
          />
        </>
      )}
      {error && (
        <span role="alert" className="w-full text-xs text-error-600">
          {error}
        </span>
      )}
    </span>
  );
}
