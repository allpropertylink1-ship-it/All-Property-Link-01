"use client"

import { useState } from "react"
import { api } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Link as LinkIcon, Copy, Check } from "@/components/ui/icons"
import { FormBanner } from "@/components/shared/FormFeedback"
import { AgentGuard } from "@/components/dashboard/AgentGuard"

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
      </div>
    </AgentGuard>
  )
}
