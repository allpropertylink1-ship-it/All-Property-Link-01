import { ReactNode } from "react"

const tones: Record<string, string> = {
  PENDING: "bg-warning-50 text-warning-700",
  AWAITING_AGENT_ACCEPTANCE: "bg-accent-50 text-accent-700",
  UNDER_REVIEW: "bg-primary-50 text-primary-700",
  PAID: "bg-success-50 text-success-700",
  APPROVED: "bg-success-50 text-success-700",
  ACTIVE: "bg-success-50 text-success-700",
  RESOLVED: "bg-success-50 text-success-700",
  VERIFIED: "bg-success-50 text-success-700",
  REJECTED: "bg-error-50 text-error-600",
  DELETED: "bg-surface-secondary text-text-secondary",
}

export function StatusPill({
  status,
  label,
  icon,
}: {
  status: string
  label?: string
  icon?: ReactNode
}) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${tones[status] || "bg-surface-secondary text-text-secondary"}`}>
      {icon}
      {label || status}
    </span>
  )
}
