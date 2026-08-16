"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api-client"
import { Loader2, AlertCircle, Phone, UserCheck, ArrowRight } from "@/components/ui/icons"

interface Agent {
  id: string
  fullName: string
  phone: string | null
  email: string | null
  agentCode: string
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
          {filtered.map((agent) => (
            <div key={agent.id} className="flex flex-col rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-md">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                  {agent.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <Link href={`/agents/${agent.id}`} className="font-heading font-semibold text-text-primary hover:text-primary-600">
                    {agent.fullName}
                  </Link>
                  <p className="flex items-center gap-1 text-xs text-muted">
                    <UserCheck size={12} className="text-primary-600" /> {agent.agentCode}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-text-secondary">
                <p className="flex items-center gap-2"><UserCheck size={14} />{agent._count.users} referral{agent._count.users !== 1 ? "s" : ""} · {agent.propertyCount} listing{agent.propertyCount !== 1 ? "s" : ""}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
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
          ))}
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
