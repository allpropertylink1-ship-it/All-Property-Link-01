"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Camera, Save, Key, Trash2, Shield, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ImageCropper from "@/components/kyc/ImageCropper";

interface ProfileFormProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    passportPhoto?: string | null;
    location: string | null;
    address: string | null;
    city: string | null;
    gender: string | null;
    dateOfBirth: string | null;
    nationality: string | null;
    kycStatus: string;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passportUploading, setPassportUploading] = useState(false);
  const [passportPhotoUrl, setPassportPhotoUrl] = useState(user.passportPhoto || "");
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [cropping, setCropping] = useState(false);

  useEffect(() => {
    if (user.passportPhoto === undefined) {
      (async () => {
        try {
          const res = await fetch("/api/user/profile", { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            if (data.user?.passportPhoto) setPassportPhotoUrl(data.user.passportPhoto);
          }
        } catch {}
      })();
    }
  }, [user.passportPhoto]);

  function handlePassportSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Only image files are allowed" }); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "File must be under 10MB" }); return;
    }
    setMessage(null);
    setPassportFile(file);
    setCropping(true);
  }

  async function handleCropComplete(blob: Blob) {
    setCropping(false);
    setPassportUploading(true);
    try {
      const file = new File([blob], "passport.jpg", { type: "image/jpeg" });
      const signRes = await fetch("/api/uploadthing/sign", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "allpropertylink/profiles" }),
      });
      if (!signRes.ok) throw new Error("Failed to get upload signature");
      const { signature, timestamp, apiKey, cloudName } = await signRes.json();
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", apiKey);
      fd.append("timestamp", String(timestamp));
      fd.append("signature", signature);
      fd.append("folder", "allpropertylink/profiles");
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const result = await uploadRes.json();
      const url = result.secure_url;
      setPassportPhotoUrl(url);
      setPassportFile(null);
      const patchRes = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passportPhoto: url, avatar: url }),
      });
      if (!patchRes.ok) {
        const err = await patchRes.json();
        throw new Error(err.error || "Failed to save");
      }
      setMessage({ type: "success", text: "Passport photo updated" });
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setPassportUploading(false);
    }
  }

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileLoading(true);
    setMessage(null);

    const form = new FormData(e.currentTarget);
    const data = {
      firstName: form.get("firstName") as string,
      lastName: form.get("lastName") as string,
      phone: form.get("phone") as string,
      location: form.get("location") as string,
      address: form.get("address") as string,
      city: form.get("city") as string,
      gender: form.get("gender") as string,
      dateOfBirth: form.get("dateOfBirth") as string || undefined,
      nationality: form.get("nationality") as string,
    };

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update profile");
      }

      setMessage({ type: "success", text: "Profile updated successfully" });
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordLoading(true);
    setMessage(null);

    const form = new FormData(e.currentTarget);
    const currentPassword = form.get("currentPassword") as string;
    const newPassword = form.get("newPassword") as string;
    const confirmPassword = form.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to change password");
      }

      setMessage({ type: "success", text: "Password changed successfully" });
      setShowPasswordForm(false);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDeleteAccount(confirmText: string) {
    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmText }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete account");
      }

      await logout();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }

  const kycStatus = user.kycStatus || "NONE";
  const kycDisplay = {
    NONE: { label: "Not verified", icon: Shield, color: "text-text-secondary" },
    PENDING: { label: "In progress", icon: Clock, color: "text-warning-500" },
    VERIFIED: { label: "Verified", icon: CheckCircle, color: "text-success-600" },
    REJECTED: { label: "Rejected", icon: XCircle, color: "text-error-500" },
  };
  const kyc = kycDisplay[kycStatus as keyof typeof kycDisplay] || kycDisplay.NONE;

  return (
    <div className="space-y-8">
      {message && (
        <div
          className={cn(
            "rounded-lg px-4 py-3 text-sm",
            message.type === "success"
              ? "bg-success-500/10 text-success-700"
              : "bg-error-500/10 text-error-500"
          )}
        >
          {message.text}
        </div>
      )}

      <div className="flex items-center gap-6">
        <div className="relative">
          <label className="block cursor-pointer">
            {passportPhotoUrl ? (
              <img src={passportPhotoUrl} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/20" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-2xl font-bold text-primary-600">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white shadow hover:bg-primary-700 transition-colors">
              {passportUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            </div>
            <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handlePassportSelect} className="hidden" disabled={passportUploading} />
          </label>
        </div>
        <div>
          <h2 className="font-heading text-xl font-semibold text-text-primary">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-sm text-text-secondary">{user.email}</p>
          <div className="mt-1 flex items-center gap-2">
            <kyc.icon size={14} className={kyc.color} />
            <span className={cn("text-xs", kyc.color)}>KYC: {kyc.label}</span>
          </div>
          <p className="mt-0.5 text-xs text-text-secondary">Click the camera icon to change your profile photo</p>
        </div>
      </div>

      {cropping && passportFile && (
        <ImageCropper
          imageUrl={URL.createObjectURL(passportFile)}
          onCropComplete={handleCropComplete}
          onCancel={() => { setCropping(false); setPassportFile(null); }}
          sideLabel="Passport Photo"
        />
      )}

      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <h3 className="font-heading text-lg font-semibold text-text-primary">
          Personal Information
        </h3>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              defaultValue={user.firstName}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={user.lastName}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              defaultValue={user.email || ""}
              disabled
              className="cursor-not-allowed opacity-60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={user.phone || ""}
              placeholder="+254 7XX XXX XXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              defaultValue={user.dateOfBirth || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              name="gender"
              defaultValue={user.gender || ""}
              className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              name="nationality"
              defaultValue={user.nationality || ""}
              placeholder="e.g., Kenyan"
            />
          </div>
        </div>

        <h3 className="font-heading text-lg font-semibold text-text-primary">
          Address
        </h3>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              defaultValue={user.address || ""}
              placeholder="Street address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              defaultValue={user.city || ""}
              placeholder="e.g., Nairobi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Region / County</Label>
            <Input
              id="location"
              name="location"
              defaultValue={user.location || ""}
              placeholder="e.g., Nairobi County"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={profileLoading}>
            <Save size={16} className="mr-2" />
            {profileLoading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>

      <div className="border-t border-border pt-6">
        <h3 className="mb-4 font-heading text-lg font-semibold text-text-primary">
          Account Security
        </h3>

        {showPasswordForm ? (
          <form onSubmit={handlePasswordChange} className="space-y-4 rounded-lg border border-border bg-surface-secondary p-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Changing..." : "Change password"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPasswordForm(true)}
          >
            <Key size={16} className="mr-2" />
            Change password
          </Button>
        )}
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="mb-2 font-heading text-lg font-semibold text-text-primary">
          Danger Zone
        </h3>
        <p className="mb-4 text-sm text-text-secondary">
          Irreversible actions on your account
        </p>

        <ConfirmDialog
          trigger={
            <Button type="button" variant="destructive">
              <Trash2 size={16} className="mr-2" />
              Delete account
            </Button>
          }
          title="Delete account"
          description={
            <div className="space-y-3">
              <p>This will permanently delete your account, listings, KYC documents, and all associated data. This cannot be undone.</p>
              <p className="text-sm text-text-secondary">Type <strong>delete-account</strong> to confirm:</p>
            </div>
          }
          confirmLabel="Delete my account"
          confirmVariant="destructive"
          requiresInput
          requiredInputValue="delete-account"
          inputLabel="Confirmation"
          inputPlaceholder="Type delete-account"
          inputType="text"
          onConfirmWithInput={handleDeleteAccount}
        />
      </div>
    </div>
  );
}
