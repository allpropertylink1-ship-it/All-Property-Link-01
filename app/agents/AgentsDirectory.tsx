"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api-client"
import { Loader2, AlertCircle, Phone, UserCheck } from "@/components/ui/icons"

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
            <div key={agent.id} className="rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-md">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                  {agent.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-text-primary">{agent.fullName}</h3>
                  <p className="text-xs text-muted">{agent.agentCode}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-text-secondary">
                <p className="flex items-center gap-2"><UserCheck size={14} />{agent._count.users} referral{agent._count.users !== 1 ? "s" : ""} · {agent.propertyCount} listing{agent.propertyCount !== 1 ? "s" : ""}</p>
              </div>

              {agent.phone && (
                <a href={`tel:${agent.phone}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors touch-target"
                ><Phone size={14} />Call {agent.phone}</a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
