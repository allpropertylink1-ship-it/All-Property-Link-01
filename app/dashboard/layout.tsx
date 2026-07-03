import { requireAuth } from "@/lib/auth-utils";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <DashboardNav />
      <main className="flex-1 bg-surface-secondary p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
