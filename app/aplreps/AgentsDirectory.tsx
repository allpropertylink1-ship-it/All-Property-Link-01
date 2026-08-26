"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api-client"
import { resolveImageUrl } from "@/lib/images"
import { Loader2, AlertCircle, Phone, Mail, Building2, ExternalLink } from "@/components/ui/icons"

interface Agent {
  id: string
  fullName: string
  phone: string | null
  email: string | null
  agentCode: string
  avatar: string | null
  regions: string[]
  specificArea: string | null
  _count: { users: number }
  propertyCount: number
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.14 2 11.27c0 2.92 1.45 5.55 3.72 7.25L5 22.1l3.85-1.74c.99.27 2.05.41 3.15.41 5.52 0 10-4.14 10-9.5S17.52 2 12 2z" />
    </svg>
  )
}

function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("0")) return `254${digits.slice(1)}`
  if (digits.startsWith("+")) return digits.slice(1)
  return digits
}

export function AgentsDirectory() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    setLoading(true)
    api.get<{ agents: Agent[] }>("/api/apl-agents").then(({ data, error }) => {
      if (data) setAgents(data.agents)
      else setError(error || "Failed to load representatives")
      setLoading(false)
    })
  }, [])

  const filtered = agents.filter((a) =>
    !search || a.fullName.toLowerCase().includes(search.toLowerCase()) ||
    a.agentCode.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted" /></div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <AlertCircle size={24} className="text-error-500" />
        <p className="text-sm text-text-secondary">{error}</p>
      </div>
    )
  }

  const hasCities = (agent: Agent) => agent.regions.length > 0 || !!agent.specificArea

  return (
    <div>
      <div className="mb-8">
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or code..."
          className="w-full max-w-md rounded-xl border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-text-secondary">No representatives found.</div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agent) => {
            const photoUrl = resolveImageUrl(agent.avatar)
            return (
              <div key={agent.id} className="flex flex-col rounded-2xl border-2 border-accent-200/60 bg-surface p-5 transition-shadow hover:shadow-md">
                <div className="flex gap-5">
                  <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-full ring-2 ring-accent-200/60">
                    {photoUrl ? (
                      <Image src={photoUrl} alt={agent.fullName} fill className="object-cover" sizes="100px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary-100 text-xl font-bold text-primary-600">
                        {initials(agent.fullName)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-baseline justify-between gap-2">
                      <Link href={`/aplreps/${agent.id}`} className="font-heading font-bold text-lg text-text-primary hover:text-primary-600 truncate">
                        {agent.fullName}
                      </Link>
                      <span className="text-xs text-muted shrink-0">{agent.agentCode}</span>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      {agent._count.users} referral{agent._count.users !== 1 ? "s" : ""} · {agent.propertyCount} listing{agent.propertyCount !== 1 ? "s" : ""}
                    </p>
                    <Link
                      href={`/aplreps/${agent.id}`}
                      className="mt-2 self-end text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      View profile <ExternalLink size={13} className="ml-1" />
                    </Link>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {agent.phone && (
                        <>
                          <a href={`tel:${agent.phone}`}
                            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors touch-target"
                          ><Phone size={13} />Call</a>
                          <a href={`https://wa.me/${formatPhoneForWhatsApp(agent.phone)}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-600 transition-colors touch-target"
                          ><WhatsAppIcon />WhatsApp</a>
                        </>
                      )}
                      {agent.email && (
                        <a href={`mailto:${agent.email}`}
                          className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-1.5 text-sm font-medium text-pink-700 hover:bg-pink-200 transition-colors touch-target"
                        ><Mail size={13} />E-Mail</a>
                      )}
                    </div>
                  </div>
                </div>
                {hasCities(agent) && (
                  <>
                    <hr className="border-t border-border my-4" />
                    <div className="flex items-start gap-3">
                      <div className="inline-flex items-center gap-1.5 shrink-0 text-sm font-medium text-text-secondary whitespace-nowrap">
                        <Building2 size={14} className="text-primary-600" />
                        Cities Covered
                      </div>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {agent.regions.map((r) => (
                          <Link key={r} href={`/browse?region=${encodeURIComponent(r)}`} className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700 hover:bg-pink-200 transition-colors">
                            {r} <ExternalLink size={10} />
                          </Link>
                        ))}
                        {agent.specificArea && (
                          <Link href={`/browse?region=${encodeURIComponent(agent.specificArea)}`} className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700 hover:bg-pink-200 transition-colors">
                            {agent.specificArea} <ExternalLink size={10} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}