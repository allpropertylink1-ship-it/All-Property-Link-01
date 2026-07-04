"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, CheckCircle, XCircle, Clock } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface KycDoc {
  id: string;
  documentType: string;
  documentNumber: string | null;
  status: string;
  frontImage: string | null;
  backImage: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

interface KycData {
  user: { kycStatus: string; firstName: string; lastName: string } | null;
  documents: KycDoc[];
}

const docTypeLabels: Record<string, string> = {
  NATIONAL_ID: "National ID Card",
  PASSPORT: "Passport",
  DRIVERS_LICENSE: "Driver's License",
};

export default function KycPage() {
  const [data, setData] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [documentType, setDocumentType] = useState("NATIONAL_ID");
  const [documentNumber, setDocumentNumber] = useState("");
  const [frontImage, setFrontImage] = useState("");
  const [backImage, setBackImage] = useState("");

  const fetchKyc = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/kyc");
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKyc();
  }, [fetchKyc]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType,
          documentNumber: documentNumber || undefined,
          frontImage: frontImage || undefined,
          backImage: backImage || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit KYC documents");
      }

      setMessage({ type: "success", text: "Documents submitted for verification" });
      setDocumentType("NATIONAL_ID");
      setDocumentNumber("");
      setFrontImage("");
      setBackImage("");
      fetchKyc();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const kycStatus = data?.user?.kycStatus || "NONE";

  const statusDisplay = {
    NONE: { label: "Not verified", icon: Shield, color: "text-text-secondary", bg: "bg-surface-secondary" },
    PENDING: { label: "Verification in progress", icon: Clock, color: "text-warning-500", bg: "bg-warning-500/10" },
    VERIFIED: { label: "Identity verified", icon: CheckCircle, color: "text-success-600", bg: "bg-success-500/10" },
    REJECTED: { label: "Verification rejected", icon: XCircle, color: "text-error-500", bg: "bg-error-500/10" },
  };

  const status = statusDisplay[kycStatus as keyof typeof statusDisplay] || statusDisplay.NONE;

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">
          Identity Verification (KYC)
        </h1>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 font-heading text-2xl font-bold text-text-primary">
        Identity Verification (KYC)
      </h1>
      <p className="mb-8 text-sm text-text-secondary">
        Verify your identity to unlock full platform features
      </p>

      <div className={cn("mb-8 flex items-center gap-4 rounded-xl border p-6", status.bg)}>
        <status.icon size={32} className={status.color} />
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
          {kycStatus === "PENDING" && (
            <p className="text-sm text-text-secondary">
              Your documents are being reviewed. This usually takes 1-2 business days.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {kycStatus !== "VERIFIED" && (
          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">
              Submit Documents
            </h2>

            {message && (
              <div
                className={cn(
                  "mb-4 rounded-lg px-4 py-3 text-sm",
                  message.type === "success"
                    ? "bg-success-500/10 text-success-700"
                    : "bg-error-500/10 text-error-500"
                )}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="documentType">Document type</Label>
                <select
                  id="documentType"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="NATIONAL_ID">National ID Card</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVERS_LICENSE">Driver's License</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentNumber">Document number (optional)</Label>
                <Input
                  id="documentNumber"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="e.g., ID123456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frontImage">Front image URL</Label>
                <Input
                  id="frontImage"
                  value={frontImage}
                  onChange={(e) => setFrontImage(e.target.value)}
                  placeholder="https://example.com/front.jpg"
                />
                <p className="text-xs text-text-secondary">
                  Paste a URL link to the front of your document
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backImage">Back image URL (optional)</Label>
                <Input
                  id="backImage"
                  value={backImage}
                  onChange={(e) => setBackImage(e.target.value)}
                  placeholder="https://example.com/back.jpg"
                />
                <p className="text-xs text-text-secondary">
                  Paste a URL link to the back of your document (if applicable)
                </p>
              </div>

              <Button type="submit" disabled={submitting || !frontImage} className="w-full">
                {submitting ? "Submitting..." : "Submit for verification"}
              </Button>
            </form>
          </div>
        )}

        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">
            Submission History
          </h2>

          {data?.documents && data.documents.length > 0 ? (
            <div className="space-y-4">
              {data.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-lg border border-border bg-surface-secondary p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">
                      {docTypeLabels[doc.documentType] || doc.documentType}
                    </span>
                    <span
                      className={cn(
                        "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                        doc.status === "VERIFIED"
                          ? "bg-success-500/10 text-success-600"
                          : doc.status === "REJECTED"
                            ? "bg-error-500/10 text-error-500"
                            : doc.status === "PENDING"
                              ? "bg-warning-500/10 text-warning-500"
                              : "bg-surface-secondary text-text-secondary"
                      )}
                    >
                      {doc.status}
                    </span>
                  </div>
                  {doc.documentNumber && (
                    <p className="mb-1 text-xs text-text-secondary">
                      Number: {doc.documentNumber}
                    </p>
                  )}
                  {doc.rejectionReason && (
                    <p className="mb-1 text-xs text-error-500">
                      Reason: {doc.rejectionReason}
                    </p>
                  )}
                  <p className="text-xs text-text-secondary">
                    Submitted {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                  {(doc.frontImage || doc.backImage) && (
                    <div className="mt-2 flex gap-2">
                      {doc.frontImage && (
                        <a
                          href={doc.frontImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:underline"
                        >
                          View front
                        </a>
                      )}
                      {doc.backImage && (
                        <a
                          href={doc.backImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:underline"
                        >
                          View back
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No submissions"
              description="Submit your documents for verification above."
            />
          )}
        </div>
      </div>
    </div>
  );
}
