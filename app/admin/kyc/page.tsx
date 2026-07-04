"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface KycUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  avatar: string | null;
  kycStatus: string;
}

interface KycDoc {
  id: string;
  documentType: string;
  documentNumber: string | null;
  status: string;
  frontImage: string | null;
  backImage: string | null;
  rejectionReason: string | null;
  createdAt: string;
  user: KycUser;
}

const docTypeLabels: Record<string, string> = {
  NATIONAL_ID: "National ID",
  PASSPORT: "Passport",
  DRIVERS_LICENSE: "Driver's License",
};

export default function AdminKycPage() {
  const [documents, setDocuments] = useState<KycDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kyc");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  async function handleApprove(docId: string) {
    try {
      const res = await fetch(`/api/admin/kyc/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      if (res.ok) {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === docId ? { ...d, status: "VERIFIED", user: { ...d.user, kycStatus: "VERIFIED" } } : d
          )
        );
      }
    } catch {
      // silent
    }
  }

  async function handleReject(docId: string) {
    if (!rejectionReason.trim()) return;
    try {
      const res = await fetch(`/api/admin/kyc/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", rejectionReason: rejectionReason.trim() }),
      });
      if (res.ok) {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === docId
              ? { ...d, status: "REJECTED", rejectionReason: rejectionReason.trim(), user: { ...d.user, kycStatus: "REJECTED" } }
              : d
          )
        );
        setShowRejectInput(null);
        setRejectionReason("");
      }
    } catch {
      // silent
    }
  }

  const pendingCount = documents.filter((d) => d.status === "PENDING").length;

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            KYC Verification
          </h1>
          <p className="text-text-secondary">
            Review identity documents submitted by users
            {pendingCount > 0 && (
              <span className="ml-2 inline-block rounded-full bg-warning-500/10 px-2 py-0.5 text-xs font-medium text-warning-500">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          title="No KYC submissions"
          description="User-submitted identity documents will appear here."
        />
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-600">
                    {doc.user.firstName[0]}
                    {doc.user.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {doc.user.firstName} {doc.user.lastName}
                    </p>
                    <p className="text-sm text-text-secondary">{doc.user.email}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
                    doc.status === "VERIFIED"
                      ? "bg-success-500/10 text-success-600"
                      : doc.status === "REJECTED"
                        ? "bg-error-500/10 text-error-500"
                        : doc.status === "PENDING"
                          ? "bg-warning-500/10 text-warning-500"
                          : "bg-surface-secondary text-text-secondary"
                  )}
                >
                  {doc.status === "VERIFIED" ? "Verified" : doc.status === "REJECTED" ? "Rejected" : doc.status === "PENDING" ? "Pending" : doc.status}
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-text-secondary">Document type</p>
                  <p className="text-sm font-medium text-text-primary">
                    {docTypeLabels[doc.documentType] || doc.documentType}
                  </p>
                </div>
                {doc.documentNumber && (
                  <div>
                    <p className="text-xs text-text-secondary">Document number</p>
                    <p className="text-sm font-medium text-text-primary">
                      {doc.documentNumber}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-text-secondary">Submitted</p>
                  <p className="text-sm font-medium text-text-primary">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {(doc.frontImage || doc.backImage) && (
                <div className="mt-4 flex gap-4">
                  {doc.frontImage && (
                    <a
                      href={doc.frontImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-border px-4 py-2 text-sm text-primary-600 hover:bg-surface-secondary"
                    >
                      View front
                    </a>
                  )}
                  {doc.backImage && (
                    <a
                      href={doc.backImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-border px-4 py-2 text-sm text-primary-600 hover:bg-surface-secondary"
                    >
                      View back
                    </a>
                  )}
                </div>
              )}

              {doc.rejectionReason && (
                <div className="mt-4 rounded-lg bg-error-500/10 p-3 text-sm text-error-500">
                  Rejected: {doc.rejectionReason}
                </div>
              )}

              {doc.status === "PENDING" && (
                <div className="mt-4 flex items-center gap-3">
                  <ConfirmDialog
                    trigger={
                      <button className="touch-target rounded-lg bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600">
                        Approve
                      </button>
                    }
                    title="Approve KYC"
                    description={`Approve identity verification for ${doc.user.firstName} ${doc.user.lastName}?`}
                    confirmLabel="Approve"
                    confirmVariant="default"
                    onConfirm={() => handleApprove(doc.id)}
                  />

                  {showRejectInput === doc.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Rejection reason..."
                        className="w-64 rounded-lg border border-border px-3 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                      <button
                        onClick={() => handleReject(doc.id)}
                        disabled={!rejectionReason.trim()}
                        className="touch-target rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white hover:bg-error-600 disabled:opacity-50"
                      >
                        Confirm reject
                      </button>
                      <button
                        onClick={() => { setShowRejectInput(null); setRejectionReason(""); }}
                        className="touch-target rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-surface-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowRejectInput(doc.id)}
                      className="touch-target rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white hover:bg-error-600"
                    >
                      Reject
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
