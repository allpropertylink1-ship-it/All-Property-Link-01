"use client";

import { useState, useEffect } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getProperties, approveProperty, rejectProperty, togglePublish, viewProperty } from "@/lib/admin-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface PropertyRow {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  propertyType: string;
  city: string;
  moderationStatus: string;
  isPublished: boolean;
  createdAt: Date;
  agent: { firstName: string; lastName: string; avatar: string } | null;
}

export default function AdminListingsPage() {
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "expired" | "all">("pending");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setTotal(0);
      setProperties([]);
      const result = await getProperties(filter, page);
      setTotal(result.total);
      setProperties(result.properties as unknown as PropertyRow[]);
      setLoading(false);
    };
    fetchProperties();
  }, [filter, page]);

  const handleFilterChange = (f: "pending" | "approved" | "rejected" | "expired" | "all") => {
    setFilter(f);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            Property Management
          </h1>
          <p className="text-text-secondary">
            Review and manage property listings
          </p>
        </div>
        <div className="flex gap-2">
          {(["pending", "approved", "rejected", "expired", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={cn(
                "touch-target flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                filter === f
                  ? "bg-primary-600 text-white"
                  : "border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              )}
            >
              {f === "pending" ? "Pending Review" : f === "approved" ? "Approved" : f === "rejected" ? "Rejected" : f === "expired" ? "Expired" : "All"}
            </button>
          ))}
        </div>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          title="No properties found"
          description={filter === "pending" ? "No properties awaiting approval" : "No properties match this filter"}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-secondary">
              Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total} properties
            </p>
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={cn(
                    "touch-target flex items-center justify-center rounded-lg border px-3 py-2 text-sm",
                    p === page
                      ? "bg-primary-600 text-white"
                      : "border-border text-text-secondary hover:bg-surface-secondary"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm divide-y divide-border">
              <thead className="bg-surface-secondary text-text-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium">Agent</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-surface-secondary">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        {prop.agent?.avatar ? (
                          <Image
                            src={prop.agent.avatar}
                            alt={`${prop.agent.firstName}'s avatar`}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-200">
                            {prop.agent?.firstName?.charAt(0).toUpperCase()}{prop.agent?.lastName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary">{prop.title}</p>
                          <p className="text-sm text-text-secondary">{prop.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-end">
                      {prop.currency} {Number(prop.price).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-text-center capitalize">
                      {prop.propertyType}
                    </td>
                    <td className="px-4 py-3 text-text-center">{prop.city}</td>
                    <td className="px-4 py-3">
                      {prop.agent ? (
                        <div className="flex items-center space-x-2">
                          {prop.agent?.avatar ? (
                            <Image
                              src={prop.agent.avatar}
                              alt={`${prop.agent.firstName}'s avatar`}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-primary-200">
                              {prop.agent?.firstName?.charAt(0).toUpperCase()}{prop.agent?.lastName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="ml-2">{prop.agent?.firstName} {prop.agent?.lastName}</span>
                        </div>
                      ) : (
                        <span className="italic text-text-secondary">Unknown Agent</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        prop.moderationStatus === "DRAFT"
                          ? "bg-surface-secondary text-text-secondary"
                          : prop.moderationStatus === "PENDING_REVIEW"
                            ? "bg-warning-500/10 text-warning-500"
                            : prop.moderationStatus === "APPROVED"
                              ? "bg-success-500/10 text-success-600"
                              : prop.moderationStatus === "REJECTED"
                                ? "bg-error-500/10 text-error-600"
                                : prop.moderationStatus === "EXPIRED"
                                  ? "bg-warning-500/10 text-warning-500"
                                  : prop.moderationStatus === "ARCHIVED"
                                    ? "bg-surface-secondary text-text-secondary"
                                    : "bg-surface-secondary text-text-secondary"
                      }`}>
                        {prop.moderationStatus === "DRAFT" ? "Draft" : prop.moderationStatus === "PENDING_REVIEW" ? "Pending Review" : prop.moderationStatus === "APPROVED" ? "Approved" : prop.moderationStatus === "REJECTED" ? "Rejected" : prop.moderationStatus === "EXPIRED" ? "Expired" : "Archived"}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <div className="flex space-x-2">
                        {prop.moderationStatus === "PENDING_REVIEW" && (
                          <>
                            <button
                              onClick={() => approveProperty(prop.id)}
                              className="touch-target flex items-center gap-1 rounded-lg bg-success-500 px-3 py-2 text-sm font-medium text-white hover:bg-success-600"
                            >
                              Approve
                            </button>
                            <ConfirmDialog
                              trigger={
                                <button className="touch-target flex items-center gap-1 rounded-lg bg-error-500 px-3 py-2 text-sm font-medium text-white hover:bg-error-600">
                                  Reject
                                </button>
                              }
                              title="Reject Property"
                              description={`Are you sure you want to reject "${prop.title}"?`}
                              confirmLabel="Reject"
                              confirmVariant="destructive"
                              onConfirm={() => rejectProperty(prop.id)}
                            />
                          </>
                        )}
                        {prop.isPublished && (
                          <>
                            <ConfirmDialog
                              trigger={
                                <button className="touch-target flex items-center gap-1 rounded-lg bg-warning-500 px-3 py-2 text-sm font-medium text-white hover:bg-warning-600">
                                  Unpublish
                                </button>
                              }
                              title="Unpublish Property"
                              description={`Are you sure you want to unpublish "${prop.title}"? It will no longer be visible to users.`}
                              confirmLabel="Unpublish"
                              confirmVariant="destructive"
                              onConfirm={() => togglePublish(prop.id, false)}
                            />
                          </>
                        )}
                        {!prop.isPublished && prop.moderationStatus === "APPROVED" && (
                          <button
                            onClick={() => togglePublish(prop.id, true)}
                            className="touch-target flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => viewProperty(prop.id)}
                          className="touch-target flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-text-on-primary hover:bg-primary-700"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

