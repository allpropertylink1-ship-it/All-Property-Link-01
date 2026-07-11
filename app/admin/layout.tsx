import { requireRole } from "@/lib/auth-utils";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["ADMIN"]);

  return (
    <div className="min-h-screen bg-surface">
      <AdminNav />
      <div className="lg:pl-64">
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}