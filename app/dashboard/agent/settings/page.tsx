"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { api } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { uploadImage } from "@/lib/image-client"
import { Loader2, Link as LinkIcon, Copy, Check, MapPin } from "@/components/ui/icons"
import ImageCropper from "@/components/kyc/ImageCropper"
import { FormBanner } from "@/components/shared/FormFeedback"
import { AgentGuard } from "@/components/dashboard/AgentGuard"
import { resolveImageUrl } from "@/lib/images"

const KENYA_REGIONS = [
  "Nairobi", "Central", "Coast", "Eastern",
  "North-Eastern", "Nyanza", "Rift Valley", "Western",
] as const

const inputClass = "mt-1 block w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-secondary focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"

export default function AgentSettingsPage() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState(false)

  const [copied, setCopied] = useState(false)

  // ── Photo & region state ──
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [specificArea, setSpecificAreaState] = useState("")
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [profileDataLoading, setProfileDataLoading] = useState(true)
  const [prLoading, setPrLoading] = useState(false)
  const [prError, setPrError] = useState("")
  const [prSuccess, setPrSuccess] = useState(false)
  const [cropping, setCropping] = useState(false)
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError("")
    setProfileSuccess(false)

    const body: Record<string, string> = {}
    if (fullName.trim()) body.fullName = fullName.trim()
    if (phone.trim()) body.phone = phone.trim()

    if (Object.keys(body).length === 0) {
      setProfileError("No fields to update")
      setProfileLoading(false)
      return
    }

    const { error } = await api.patch("/api/referral-partner/profile", body)
    if (error) setProfileError(error)
    else setProfileSuccess(true)
    setProfileLoading(false)
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwLoading(true)
    setPwError("")
    setPwSuccess(false)

    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match")
      setPwLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters")
      setPwLoading(false)
      return
    }

    const { error } = await api.post("/api/referral-partner/change-password", {
      currentPassword,
      newPassword,
    })
    if (error) setPwError(error)
    else {
      setPwSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }
    setPwLoading(false)
  }

  const referralLink = user?.agentCode ? `https://allpropertylink.co.ke/auth/register?ref=${user.agentCode}` : ""

  // Fetch current avatar/regions on mount
  useEffect(() => {
    if (!user?.aplAgentId) return
    api.get<{ agent: { avatar: string | null; regions: string[]; specificArea: string | null } }>(
      `/api/apl-agents/${user.aplAgentId}`
    ).then(({ data }) => {
      if (data?.agent) {
        setAvatarUrl(data.agent.avatar)
        setSelectedRegions(data.agent.regions || [])
        setSpecificAreaState(data.agent.specificArea || "")
      }
      setProfileDataLoading(false)
    })
  }, [user?.aplAgentId])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    setPrError("")
    const url = URL.createObjectURL(file)
    setCropImageUrl(url)
    setCropping(true)
  }

  async function handleCropComplete(croppedBlob: Blob) {
    setCropping(false)
    setAvatarUploading(true)
    setPrError("")
    try {
      const url = await uploadImage(new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" }), "avatars", { maxDimension: 400, quality: 0.85 })
      const { error } = await api.patch("/api/apl-agents/profile", { avatar: url })
      if (error) throw new Error(error)
      setAvatarUrl(url)
    } catch (err) {
      setPrError(err instanceof Error ? err.message : "Photo upload failed")
    } finally {
      setAvatarUploading(false)
    }
  }

  function handleCropCancel() {
    setCropping(false)
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl)
    setCropImageUrl(null)
  }

  async function handleAvatarRemove() {
    setPrError("")
    const { error } = await api.patch("/api/apl-agents/profile", { avatar: null })
    if (error) { setPrError(error); return }
    setAvatarUrl(null)
  }

  function toggleRegion(region: string) {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    )
  }

  async function handleProfileRegionSave() {
    setPrLoading(true)
    setPrError("")
    setPrSuccess(false)
    const { error } = await api.patch("/api/apl-agents/profile", {
      regions: selectedRegions,
      specificArea: specificArea.trim() || null,
    })
    if (error) setPrError(error)
    else setPrSuccess(true)
    setPrLoading(false)
  }

  async function copyReferralLink() {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <AgentGuard>
      <div className="max-w-2xl space-y-10">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Settings</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`} &middot; Code: {user?.agentCode}
          </p>
        </div>

        {referralLink && (
          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-1 font-heading text-lg font-semibold text-text-primary">Your Referral Link</h2>
            <p className="mb-4 text-sm text-text-secondary">Share this link to earn commissions on referred clients</p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 py-2.5">
              <LinkIcon size={16} className="shrink-0 text-accent-300" />
              <code className="flex-1 truncate text-sm text-text-primary">{referralLink}</code>
              <button
                onClick={copyReferralLink}
                className="touch-target shrink-0 rounded-lg bg-primary-600 p-2 text-white transition-colors hover:bg-primary-700"
                title="Copy link"
                aria-label="Copy referral link"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            {copied && <p className="mt-2 text-xs text-success-700">Copied to clipboard!</p>}
          </div>
        )}

        {/* ─── Photo & Region section ─── */}
        <div className="space-y-6 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-heading text-lg font-semibold text-text-primary">Profile Picture &amp; Coverage</h2>

          {prError && <FormBanner variant="error">{prError}</FormBanner>}
          {prSuccess && <FormBanner variant="success">Profile picture &amp; coverage updated</FormBanner>}

          {/* Photo */}
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-accent-200/60">
              {avatarUploading ? (
                <div className="flex h-full w-full items-center justify-center bg-surface-secondary">
                  <Loader2 size={20} className="animate-spin text-text-secondary" />
                </div>
              ) : resolveImageUrl(avatarUrl) ? (
                <Image src={resolveImageUrl(avatarUrl) as string} alt="Profile" fill className="object-cover" sizes="80px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary-100 font-heading text-xl font-bold text-primary-600">
                  {(user?.fullName || user?.agentCode || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={handleAvatarUpload} />
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                aria-busy={avatarUploading}
                className="touch-target rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary disabled:opacity-50"
              >
                {avatarUrl ? "Change photo" : "Upload photo"}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleAvatarRemove}
                  className="touch-target rounded-lg border border-border px-4 py-2 text-sm font-medium text-error-600 transition-colors hover:bg-surface-secondary"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Regions */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-primary">
              Regions covered
            </label>
            <p className="mb-3 text-xs text-text-secondary">
              Select all areas where you onboard clients.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {KENYA_REGIONS.map((region) => {
                const active = selectedRegions.includes(region)
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => toggleRegion(region)}
                    aria-pressed={active}
                    className={`flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      active
                        ? "border-accent-300 bg-accent-300/10 text-accent-600"
                        : "border-border text-text-secondary hover:border-accent-300/50"
                    }`}
                  >
                    <MapPin size={12} className={active ? "text-accent-500" : "text-text-secondary"} />
                    {region}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Specific area */}
          <div>
            <label htmlFor="specificArea" className="block text-sm font-medium text-text-primary">
              Specific area <span className="font-normal text-text-secondary">(optional)</span>
            </label>
            <input
              id="specificArea"
              type="text"
              value={specificArea}
              onChange={(e) => setSpecificAreaState(e.target.value)}
              placeholder="e.g. Mombasa / Diani"
              maxLength={80}
              className={inputClass}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleProfileRegionSave}
              disabled={prLoading || profileDataLoading}
              aria-busy={prLoading}
              className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 hover:shadow-md disabled:opacity-50"
            >
              {prLoading && <Loader2 size={16} className="animate-spin" />}
              Save changes
            </button>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-6 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-heading text-lg font-semibold text-text-primary">Profile</h2>

          {profileError && <FormBanner variant="error">{profileError}</FormBanner>}
          {profileSuccess && <FormBanner variant="success">Profile updated</FormBanner>}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-text-primary">Full Name</label>
            <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-primary">Phone</label>
            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={user?.phone || "07XXXXXXXX"}
              className={inputClass}
            />
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={profileLoading} aria-busy={profileLoading}
              className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {profileLoading && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>

        <form onSubmit={handlePasswordChange} className="space-y-6 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-heading text-lg font-semibold text-text-primary">Change Password</h2>

          {pwError && <FormBanner variant="error">{pwError}</FormBanner>}
          {pwSuccess && <FormBanner variant="success">Password changed successfully</FormBanner>}

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-text-primary">Current Password</label>
            <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-text-primary">New Password</label>
            <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">Confirm New Password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
              className={inputClass}
            />
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={pwLoading} aria-busy={pwLoading}
              className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {pwLoading && <Loader2 size={16} className="animate-spin" />}
              Change Password
            </button>
          </div>
        </form>

      {cropping && cropImageUrl && (
        <ImageCropper
          imageUrl={cropImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          sideLabel="Profile Picture"
        />
      )}
      </div>
    </AgentGuard>
  )
}
