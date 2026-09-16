"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, ExternalLink, Bell, CheckCircle, XCircle, Clock, Search, DollarSign } from "@/components/ui/icons";
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

const typeIcons: Record<string, React.ElementType> = {
  LISTING_APPROVED: CheckCircle,
  LISTING_REJECTED: XCircle,
  LISTING_EXPIRING: Clock,
  PRICE_DROP: DollarSign,
  SAVED_SEARCH_MATCH: Search,
  SYSTEM: Bell,
  KYC_VERIFIED: CheckCircle,
  KYC_REJECTED: XCircle,
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
      <div className="space-y-6">
        <section aria-labelledby="notifications-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
            Inbox
          </p>
          <h1 id="notifications-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
            Notifications
          </h1>
        </section>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="notifications-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          Inbox
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 id="notifications-heading" className="font-heading text-2xl font-bold tracking-tight text-text-primary">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-text-secondary" role="status">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "All caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="touch-target flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
            >
              <CheckCheck size={16} />
              Mark all read
            </button>
          )}
        </div>
      </section>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12">
          <EmptyState
            title="No notifications"
            description="Notifications about your activity will appear here."
          />
        </div>
      ) : (
        <ul className="space-y-2" aria-label="Notifications">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || Bell;
            return (
              <li
                key={notif.id}
                className={cn(
                  "flex items-start gap-4 rounded-xl border p-4 transition-colors",
                  notif.read
                    ? "border-border bg-surface"
                    : "border-primary-200 bg-primary-50/50"
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-secondary" aria-hidden="true">
                  <Icon size={18} className={notif.read ? "text-text-secondary" : "text-primary-600"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-sm",
                          notif.read ? "text-text-primary" : "font-semibold text-text-primary"
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
                          className="touch-target rounded-lg p-2.5 text-text-secondary hover:bg-surface-secondary hover:text-primary-600"
                          title="Mark as read"
                          aria-label={`Mark "${notif.title}" as read`}
                        >
                          <CheckCheck size={16} />
                        </button>
                      )}
                      {notif.link && (
                        <button
                          type="button"
                          onClick={() => router.push(notif.link!)}
                          className="touch-target rounded-lg p-2.5 text-text-secondary hover:bg-surface-secondary hover:text-primary-600"
                          title="View"
                          aria-label={`View details for "${notif.title}"`}
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
