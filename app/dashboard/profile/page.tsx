import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export default async function ProfilePage() {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatar: true,
      passportPhoto: true,
      location: true,
      address: true,
      city: true,
      gender: true,
      dateOfBirth: true,
      nationality: true,
      kycStatus: true,
    },
  });

  if (!user) {
    return (
      <p className="text-sm text-error-500">
        User not found. Please contact support.
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-8 font-heading text-2xl font-bold text-text-primary">
        Profile
      </h1>
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-6">
        <ProfileForm
          user={{
            ...user,
            dateOfBirth: user.dateOfBirth?.toISOString().split("T")[0] || null,
          }}
        />
      </div>
    </div>
  );
}
