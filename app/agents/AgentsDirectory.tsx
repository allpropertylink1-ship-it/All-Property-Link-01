"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api-client"
import { resolveImageUrl } from "@/lib/images"
import { Loader2, AlertCircle, Phone, ArrowRight, MapPin } from "@/components/ui/icons"

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
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agent) => {
            const photoUrl = resolveImageUrl(agent.avatar)
            return (
              <div key={agent.id} className="flex flex-col rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-md">
                <div className="mb-3 flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-accent-200/60">
                    {photoUrl ? (
                      <Image src={photoUrl} alt={agent.fullName} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary-100 text-sm font-bold text-primary-600">
                        {agent.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <Link href={`/agents/${agent.id}`} className="font-heading font-semibold text-text-primary hover:text-primary-600">
                      {agent.fullName}
                    </Link>
                    <p className="text-xs text-muted">{agent.agentCode}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-text-secondary">
                  <p>{agent._count.users} referral{agent._count.users !== 1 ? "s" : ""} · {agent.propertyCount} listing{agent.propertyCount !== 1 ? "s" : ""}</p>
                </div>

                {/* Region chips */}
                {(agent.regions.length > 0 || agent.specificArea) && (
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                    {agent.regions.map((r) => (
                      <span key={r} className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-medium text-primary-700">
                        <MapPin size={11} className="shrink-0 text-primary-500" />
                        {r}
                      </span>
                    ))}
                    {agent.specificArea && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-300/15 px-2.5 py-1 text-[11px] font-medium text-accent-600">
                        <MapPin size={11} className="shrink-0" />
                        {agent.specificArea}
                      </span>
                    )}
                  </div>
                )}

                <div className={`flex flex-wrap gap-2 ${agent.regions.length > 0 || agent.specificArea ? "mt-4" : "mt-4"}`}>
                  {agent.phone && (
                    <>
                      <a href={`tel:${agent.phone}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors touch-target"
                      ><Phone size={14} />Call</a>
                      <a href={`https://wa.me/${agent.phone.replace(/\D/g, "").replace(/^0/, "254")}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors touch-target"
                      ><WhatsAppIcon />WhatsApp</a>
                    </>
                  )}
                  <Link href={`/agents/${agent.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors touch-target"
                  >View profile <ArrowRight size={14} /></Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.14 2 11.27c0 2.92 1.45 5.55 3.72 7.25L5 22.1l3.85-1.74c.99.27 2.05.41 3.15.41 5.52 0 10-4.14 10-9.5S17.52 2 12 2z" />
    </svg>
  )
}
