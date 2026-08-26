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

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
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

const pillBase = "touch-target inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors"

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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filtered.map((agent) => {
            const photoUrl = resolveImageUrl(agent.avatar)
            const cities = agent.specificArea ? [...agent.regions, agent.specificArea] : agent.regions
            return (
              <div key={agent.id} className="flex flex-col rounded-3xl border-2 border-accent-300/60 bg-surface p-5 sm:p-6">
                <div className="flex gap-5 sm:gap-6">
                  <div className="relative h-28 w-28 shrink-0 self-center overflow-hidden rounded-full sm:h-[150px] sm:w-[150px]">
                    {photoUrl ? (
                      <Image src={photoUrl} alt={agent.fullName} fill className="object-cover" sizes="150px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary-100 text-3xl font-bold text-primary-600">
                        {initials(agent.fullName)}
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                      <Link href={`/aplreps/${agent.id}`} className="font-heading text-xl font-bold text-text-primary hover:text-primary-600 sm:text-2xl">
                        {agent.fullName}
                      </Link>
                      <span className="text-sm text-text-primary sm:text-base">{agent.agentCode}</span>
                    </div>
                    <p className="mt-2 text-sm text-text-primary sm:text-base">
                      {agent._count.users} referral{agent._count.users !== 1 ? "s" : ""} | {agent.propertyCount} listing{agent.propertyCount !== 1 ? "s" : ""}
                    </p>
                    <div className="mt-4 grid w-fit grid-cols-1 gap-2.5 sm:grid-cols-[auto_auto] sm:gap-x-5 sm:gap-y-3">
                      <Link href={`/aplreps/${agent.id}`}
                        className={`${pillBase} bg-rose-200 text-rose-950 hover:bg-rose-300`}
                      >View profile <ExternalLink size={14} className="text-rose-900" /></Link>
                      {agent.phone && (
                        <a href={`https://wa.me/${formatPhoneForWhatsApp(agent.phone)}`} target="_blank" rel="noopener noreferrer"
                          className={`${pillBase} bg-emerald-500 text-white hover:bg-emerald-600`}
                        ><WhatsAppIcon />WhatsApp</a>
                      )}
                      {agent.phone && (
                        <a href={`tel:${agent.phone}`}
                          className={`${pillBase} bg-primary-700 text-white hover:bg-primary-800`}
                        ><Phone size={15} />Call</a>
                      )}
                      {agent.email && (
                        <a href={`mailto:${agent.email}`}
                          className={`${pillBase} bg-rose-200 text-rose-950 hover:bg-rose-300`}
                        ><Mail size={15} className="text-red-600" />E-Mail</a>
                      )}
                    </div>
                    <div className="mt-5 border-t border-accent-300/50" />
                  </div>
                </div>
                {cities.length > 0 && (
                  <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <span className="flex shrink-0 items-center gap-3">
                      <Building2 size={44} className="text-primary-700" />
                      <span className="text-base font-medium text-text-primary sm:text-lg">Cities Covered</span>
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {cities.map((c) => (
                        <Link key={c} href={`/browse?region=${encodeURIComponent(c)}`}
                          className="inline-flex items-center gap-2 rounded-full bg-rose-200/80 px-4 py-2 text-sm font-medium text-rose-950 transition-colors hover:bg-rose-200"
                        >
                          {c} <ExternalLink size={12} className="text-rose-700" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}