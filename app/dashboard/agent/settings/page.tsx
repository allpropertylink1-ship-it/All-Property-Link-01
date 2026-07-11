"use client"

import { useState } from "react"
import { api } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { useAgentPasswordGuard } from "@/lib/use-agent-password-guard"
import { Loader2, AlertCircle, Building2, CheckCircle, Link as LinkIcon, Copy, Check } from "lucide-react"

export default function AgentSettingsPage() {
  const { user } = useAuth()
  useAgentPasswordGuard()
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

  if (user?.authMethod !== "agent") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-md text-center">
          <Building2 size={48} className="mx-auto mb-4 text-muted" />
          <h2 className="mb-2 font-heading text-xl font-bold text-text-primary">Access Restricted</h2>
        </div>
      </div>
    )
  }

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

    const { error } = await api.patch("/api/agent/profile", body)
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

    const { error } = await api.post("/api/agent/change-password", {
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

  const referralLink = user.agentCode ? `https://allpropertylink-amber.vercel.app/auth/register?ref=${user.agentCode}` : ""

  async function copyReferralLink() {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {user.fullName || `${user.firstName} ${user.lastName}`} &middot; Code: {user.agentCode}
        </p>
      </div>

      {referralLink && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-1 font-heading text-lg font-semibold text-text-primary">Your Referral Link</h2>
          <p className="mb-4 text-sm text-text-secondary">Share this link to earn commissions on referred clients</p>
          <div className="flex items-center gap-2 rounded-sm border border-border bg-surface-secondary px-4 py-3">
            <LinkIcon size={16} className="shrink-0 text-accent-300" />
            <code className="flex-1 truncate text-sm text-text-primary">{referralLink}</code>
            <button
              onClick={copyReferralLink}
              className="touch-target shrink-0 rounded-sm bg-accent-300 p-2 text-white transition-colors hover:bg-accent-400"
              title="Copy link"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          {copied && <p className="mt-2 text-xs text-success-700">Copied to clipboard!</p>}
        </div>
      )}

      <form onSubmit={handleProfileUpdate} className="space-y-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-heading text-lg font-semibold text-text-primary">Profile</h2>

        {profileError && <div className="flex items-center gap-2 rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500"><AlertCircle size={16} /> {profileError}</div>}
        {profileSuccess && <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm text-success-700"><CheckCircle size={16} /> Profile updated</div>}

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-text-primary">Full Name</label>
          <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={user.fullName || `${user.firstName} ${user.lastName}`}
            className="mt-1 block w-full rounded-sm border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-primary">Phone</label>
          <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={user.phone || "07XXXXXXXX"}
            className="mt-1 block w-full rounded-sm border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
          />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={profileLoading}
            className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            {profileLoading && <Loader2 size={16} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordChange} className="space-y-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-heading text-lg font-semibold text-text-primary">Change Password</h2>

        {pwError && <div className="flex items-center gap-2 rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500"><AlertCircle size={16} /> {pwError}</div>}
        {pwSuccess && <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm text-success-700"><CheckCircle size={16} /> Password changed successfully</div>}

        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-text-primary">Current Password</label>
          <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
            className="mt-1 block w-full rounded-sm border border-border bg-surface px-4 py-3 text-text-primary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-text-primary">New Password</label>
          <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8}
            className="mt-1 block w-full rounded-sm border border-border bg-surface px-4 py-3 text-text-primary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">Confirm New Password</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
            className="mt-1 block w-full rounded-sm border border-border bg-surface px-4 py-3 text-text-primary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
          />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={pwLoading}
            className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            {pwLoading && <Loader2 size={16} className="animate-spin" />}
            Change Password
          </button>
        </div>
      </form>
    </div>
  )
}