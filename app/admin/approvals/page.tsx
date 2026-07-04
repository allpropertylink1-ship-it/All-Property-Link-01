"use client";

import { useState, useEffect, useCallback } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { CheckCircle, XCircle, Eye, ExternalLink } from "lucide-react";

interface PendingUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  contactPerson: string | null;
  category: string | null;
  specialties: string[];
  website: string | null;
  location: string | null;
  estateSubLocation: string | null;
  aplRepName: string | null;
  aplRepPhone: string | null;
  refereeName: string | null;
  refereePhone: string | null;
  refereeLocation: string | null;
  accountStatus: string;
  createdAt: string;
  kycDocuments: {
    id: string;
    documentType: string;
    status: string;
    frontImage: string | null;
    backImage: string | null;
  }[];
}

const categoryLabels: Record<string, string> = {
  AGENT: "Agent",
  FUNDI: "Fundi",
  SERVICE_PROVIDER: "Service Provider",
  PROPERTY_OWNER: "Property Owner",
};

export default function AdminApprovalsPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [rejectInput, setRejectInput] = useState<{ id: string; reason: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users/pending");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  async function handleApprove(userId: string) {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reject: false }),
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(userId: string, reason: string) {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reject: true, reason }),
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setRejectInput(null);
      }
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            User Approvals
          </h1>
          <p className="text-text-secondary">
            Review and approve new user registrations
            {users.length > 0 && (
              <span className="ml-2 inline-block rounded-full bg-warning-500/10 px-2 py-0.5 text-xs font-medium text-warning-500">
                {users.length} pending
              </span>
            )}
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState
          title="No pending approvals"
          description="New user registrations awaiting approval will appear here."
        />
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="rounded-xl border border-border bg-surface">
              <div className="flex items-start justify-between p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-600">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-text-secondary">{user.email}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className="inline-block rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-600">
                        {categoryLabels[user.category || ""] || user.category || "N/A"}
                      </span>
                      <span className="inline-block rounded-full bg-warning-500/10 px-2 py-0.5 text-xs font-medium text-warning-500">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    className="touch-target flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:bg-surface-secondary"
                  >
                    <Eye size={16} />
                    {expandedUser === user.id ? "Less" : "Review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(user.id)}
                    disabled={actionLoading === user.id}
                    className="touch-target flex items-center gap-1 rounded-lg bg-success-500 px-3 py-2 text-sm font-medium text-white hover:bg-success-600 disabled:opacity-50"
                  >
                    {actionLoading === user.id ? "..." : <CheckCircle size={16} />}
                    Approve
                  </button>
                </div>
              </div>

              {expandedUser === user.id && (
                <div className="border-t border-border px-6 pb-6 pt-4">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-text-primary">Personal Info</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Company:</span>
                          <span className="text-text-primary">{user.companyName || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Contact Person:</span>
                          <span className="text-text-primary">{user.contactPerson || user.firstName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Phone:</span>
                          <span className="text-text-primary">{user.phone || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Email:</span>
                          <span className="text-text-primary">{user.email || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Website:</span>
                          <span className="text-text-primary">{user.website || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Category:</span>
                          <span className="text-text-primary">{categoryLabels[user.category || ""] || user.category || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-text-primary">Location & Referee</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Location:</span>
                          <span className="text-text-primary">{user.location || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Estate:</span>
                          <span className="text-text-primary">{user.estateSubLocation || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">APL Rep:</span>
                          <span className="text-text-primary">{user.aplRepName ? `${user.aplRepName} (${user.aplRepPhone})` : "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Referee:</span>
                          <span className="text-text-primary">{user.refereeName ? `${user.refereeName} - ${user.refereePhone}` : "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Referee Location:</span>
                          <span className="text-text-primary">{user.refereeLocation || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {user.specialties && user.specialties.length > 0 && (
                    <div className="mt-4">
                      <h4 className="mb-2 text-sm font-medium text-text-primary">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {user.specialties.map((spec) => (
                          <span key={spec} className="inline-block rounded-full bg-surface-secondary px-2 py-0.5 text-xs text-text-secondary">
                            {spec.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-medium text-text-primary">Documents</h4>
                    {user.kycDocuments && user.kycDocuments.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.kycDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                            <span className="text-xs text-text-secondary">{doc.documentType}</span>
                            {doc.frontImage && (
                              <a href={doc.frontImage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
                                <ExternalLink size={12} /> Front
                              </a>
                            )}
                            {doc.backImage && (
                              <a href={doc.backImage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
                                <ExternalLink size={12} /> Back
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-secondary">No documents uploaded</p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                    {rejectInput?.id === user.id ? (
                      <div className="flex w-full items-center gap-2">
                        <input
                          type="text"
                          value={rejectInput.reason}
                          onChange={(e) => setRejectInput({ id: user.id, reason: e.target.value })}
                          placeholder="Rejection reason..."
                          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          autoFocus
                        />
                        <button
                          onClick={() => handleReject(user.id, rejectInput.reason)}
                          disabled={!rejectInput.reason.trim() || actionLoading === user.id}
                          className="touch-target rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white hover:bg-error-600 disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setRejectInput(null)}
                          className="touch-target rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-surface-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRejectInput({ id: user.id, reason: "" })}
                        className="touch-target flex items-center gap-1 rounded-lg border border-error-500 px-3 py-2 text-sm font-medium text-error-500 hover:bg-error-500/10"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    )}
                    <p className="text-xs text-text-secondary">
                      Registered {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
