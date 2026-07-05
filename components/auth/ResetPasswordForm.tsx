"use client"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { api } from "@/lib/api-client"
import { PasswordToggle } from "./PasswordToggle"

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!token) {
      setError("Invalid reset link")
      setLoading(false)
      return
    }

    if (password !== confirm) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setLoading(false)
      return
    }

    const { error: reqError } = await api.post("/api/auth/reset-password", { token, password })
    if (reqError) {
      setError(reqError)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="rounded-lg bg-accent-300/10 px-4 py-8 text-center">
        <p className="mb-4 text-sm text-text-primary">
          Password reset successful! You can now sign in with your new password.
        </p>
        <a
          href="/auth/login"
          className="touch-target inline-block rounded-sm bg-accent-300 px-6 py-3 text-sm font-medium text-white"
        >
          Sign in
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-500">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-text-primary">
          New password
        </label>
        <div className="mt-1">
          <PasswordToggle
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            placeholder="Enter new password"
          />
        </div>
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-text-primary">
          Confirm password
        </label>
        <div className="mt-1">
          <PasswordToggle
            id="confirm"
            name="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            placeholder="Confirm new password"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="touch-target w-full rounded-sm bg-accent-300 px-4 py-3 font-medium text-white transition-colors hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-300/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Resetting..." : "Reset password"}
      </button>
      <p className="text-center text-sm text-text-secondary">
        <a href="/auth/login" className="font-medium text-accent-300 hover:text-accent-400">
          Back to sign in
        </a>
      </p>
    </form>
  )
}
