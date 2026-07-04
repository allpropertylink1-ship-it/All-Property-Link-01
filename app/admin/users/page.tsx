"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import Image from "next/image";
import { getUsers, updateUserRole, toggleUserStatus, deleteUser } from "./actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  emailVerified: Date | null;
  phoneVerified: boolean;
  createdAt: Date;
  avatar: string | null;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const result = await getUsers(search, page);
    setTotalUsers(result.count);
    setUsers(result.users);
    setLoading(false);
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil(totalUsers / 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            User Management
          </h1>
          <p className="text-text-secondary">
            Manage all registered users on the platform
          </p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={handleSearchChange}
            className="flex-1 rounded-lg border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <button
            onClick={() => { setSearch(""); setPage(1); }}
            className="touch-target rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-text-on-primary hover:bg-primary-700"
          >
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description={search ? "Try adjusting your search" : "No users registered yet"}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-secondary">
              Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, totalUsers)} of {totalUsers} users
            </p>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Verified</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-secondary">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={`${user.firstName} ${user.lastName}'s avatar`}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-200">
                            {user.firstName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-primary-50 text-primary-600"
                          : user.role === "AGENT"
                            ? "bg-warning-50 text-warning-600"
                            : "bg-surface-secondary text-text-secondary"
                      }`}>
                        {user.role === "ADMIN" ? "Admin" : user.role === "AGENT" ? "Agent" : "User"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {user.emailVerified && (
                          <span className="inline-block rounded-full bg-success-500/10 text-success-600 text-xs px-2 py-0.5">
                            Email
                          </span>
                        )}
                        {user.phoneVerified && (
                          <span className="inline-block rounded-full bg-success-500/10 text-success-600 text-xs px-2 py-0.5">
                            Phone
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateUserRole(user.id, user.role === "ADMIN" ? "USER" : "ADMIN")}
                          className="touch-target flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-text-on-primary hover:bg-primary-700"
                        >
                          {user.role === "ADMIN" ? "Make User" : "Make Admin"}
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id, !!user.emailVerified)}
                          className="touch-target flex items-center gap-1 rounded-lg bg-warning-500 px-3 py-2 text-sm font-medium text-white hover:bg-warning-600"
                        >
                          {user.emailVerified ? "Suspend" : "Activate"}
                        </button>
                        <ConfirmDialog
                          trigger={
                            <button className="touch-target flex items-center gap-1 rounded-lg bg-error-500 px-3 py-2 text-sm font-medium text-white hover:bg-error-600">
                              Delete
                            </button>
                          }
                          title="Delete User"
                          description={`Delete ${user.firstName} ${user.lastName} (${user.email})? This action cannot be undone.`}
                          confirmLabel="Delete"
                          confirmVariant="destructive"
                          onConfirm={() => deleteUser(user.id)}
                        />
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
