"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { getInquiries, respondToInquiry, closeInquiry, viewInquiry } from "./actions";

interface InquiryRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: Date;
  property: { title: string; id: string } | null;
}

export default function AdminInquiriesPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "read" | "responded" | "closed">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    const result = await getInquiries(filter, page);
    setTotal(result.total);
    setInquiries(result.data);
    setLoading(false);
  }, [filter, page]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleFilterChange = (f: "all" | "pending" | "read" | "responded" | "closed") => {
    setFilter(f);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            Inquiry Management
          </h1>
          <p className="text-text-secondary">
            Review and manage user inquiries
          </p>
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "read", "responded", "closed"] as const).map((f) => (
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
              {f === "all" ? "All" : f === "pending" ? "Pending" : f === "read" ? "Read" : f === "responded" ? "Responded" : "Closed"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : inquiries.length === 0 ? (
        <EmptyState
          title="No inquiries found"
          description={filter === "all" ? "No inquiries in the system" : `No ${filter} inquiries`} />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-secondary">
              Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total} inquiries
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
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-surface-secondary">
                    <td className="px-4 py-3">
                      {inq.name}
                    </td>
                    <td className="px-4 py-3">
                      {inq.email}
                    </td>
                    <td className="px-4 py-3">
                      {inq.phone || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {inq.property?.title || "General inquiry"}
                    </td>
                    <td className="px-4 py-3 text-break max-w-[200px]">
                      {inq.message.length > 100 ? inq.message.substring(0, 100) + "..." : inq.message}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        inq.status === "PENDING"
                          ? "bg-warning-500/10 text-warning-500"
                          : inq.status === "READ"
                            ? "bg-primary-50 text-primary-600"
                            : inq.status === "RESPONDED"
                              ? "bg-success-500/10 text-success-700"
                              : "bg-surface-secondary text-text-secondary"
                      }`}>
                        {inq.status === "PENDING" ? "Pending" : inq.status === "READ" ? "Read" : inq.status === "RESPONDED" ? "Responded" : "Closed"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <div className="flex space-x-2">
                        {inq.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => respondToInquiry(inq.id)}
                              className="touch-target flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                            >
                              Respond
                            </button>
                            <button
                              onClick={() => closeInquiry(inq.id)}
                              className="touch-target flex items-center gap-1 rounded-lg bg-error-500 px-3 py-2 text-sm font-medium text-white hover:bg-error-600"
                            >
                              Close
                            </button>
                          </>
                        )}
                        {(inq.status === "READ" || inq.status === "RESPONDED") && (
                          <button
                            onClick={() => closeInquiry(inq.id)}
                            className="touch-target flex items-center gap-1 rounded-lg bg-error-500 px-3 py-2 text-sm font-medium text-white hover:bg-error-600"
                          >
                            Close
                          </button>
                        )}
                        <button
                          onClick={() => viewInquiry(inq.id)}
                          className="touch-target flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-text-on-primary hover:bg-primary-700"
                        >
                          View Details
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
