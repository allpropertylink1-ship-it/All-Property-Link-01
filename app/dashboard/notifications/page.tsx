"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const typeIcons: Record<string, string> = {
  LISTING_APPROVED: "✅",
  LISTING_REJECTED: "❌",
  LISTING_EXPIRING: "⏰",
  PRICE_DROP: "📉",
  SAVED_SEARCH_MATCH: "🔍",
  SYSTEM: "🔔",
  KYC_VERIFIED: "🪪",
  KYC_REJECTED: "🪪",
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await api.get<{ notifications: NotificationItem[]; unreadCount: number }>("/api/notifications");
      if (error) { setNotifications([]); return }
      setNotifications(data?.notifications || []);
      setUnreadCount(data?.unreadCount || 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleMarkAllRead() {
    try {
      const { error } = await api.patch("/api/notifications");
      if (!error) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch {
      // silent
    }
  }

  async function handleMarkRead(id: string) {
    try {
      const { error } = await api.patch(`/api/notifications/${id}`);
      if (!error) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // silent
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">
          Notifications
        </h1>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Notifications
          </h1>
          <p className="text-sm text-text-secondary">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="touch-target flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          >
            <CheckCheck size={16} />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12">
          <EmptyState
            title="No notifications"
            description="Notifications about your activity will appear here."
          />
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                "flex items-start gap-4 rounded-xl border p-4 transition-colors",
                notif.read
                  ? "border-border bg-surface"
                  : "border-primary-200 bg-primary-50/50"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-secondary text-lg">
                {typeIcons[notif.type] || "🔔"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className={cn(
                        "text-sm",
                        notif.read ? "text-text-primary" : "font-medium text-text-primary"
                      )}
                    >
                      {notif.title}
                    </p>
                    <p className="mt-0.5 text-sm text-text-secondary">
                      {notif.message}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!notif.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notif.id)}
                        className="touch-target rounded-lg p-1.5 text-text-secondary hover:bg-surface-secondary hover:text-primary-600"
                        title="Mark as read"
                      >
                        <CheckCheck size={16} />
                      </button>
                    )}
                    {notif.link && (
                      <button
                        type="button"
                        onClick={() => router.push(notif.link!)}
                        className="touch-target rounded-lg p-1.5 text-text-secondary hover:bg-surface-secondary hover:text-primary-600"
                        title="View"
                      >
                        <ExternalLink size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
