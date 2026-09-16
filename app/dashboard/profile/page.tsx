import { requireAuth, serverFetch } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export default async function ProfilePage() {
  const session = await requireAuth();
  const me = session.user as { authMethod?: string };
  // Reps have their own settings surface; customers keep this page.
  if (me.authMethod === "agent") {
    redirect("/dashboard/agent");
  }

  const res = await serverFetch("/api/user/profile");
  const data = await res.json().catch(() => null);
  const user = data?.user;

  if (!res.ok || !user) {
    return (
      <p className="text-sm text-error-500">
        User not found. Please contact support.
      </p>
    );
  }

  const profileUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    passportPhoto: user.passportPhoto,
    location: user.location,
    address: user.address,
    city: user.city,
    kycStatus: user.kycStatus,
  };

  return (
    <div className="space-y-6">
      <section aria-labelledby="profile-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          Account
        </p>
        <h1 id="profile-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
          Personal Profile
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Identity, contact details, and sign-in security.</p>
      </section>
      <div className="mx-auto max-w-3xl">
        <ProfileForm user={profileUser} />
      </div>
    </div>
  );
}
