"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api-client"
import { resolveImageUrl } from "@/lib/images"
import { Loader2, AlertCircle, Phone, Mail, CitiesCovered, ExternalLink } from "@/components/ui/icons"

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

function WhatsAppIcon({ size = 15 }: { size?: number }) {
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

function AgentPhoto({ agent, sizeClass }: { agent: Agent; sizeClass: string }) {
  const photoUrl = resolveImageUrl(agent.avatar)
  return (
    <div className={`shrink-0 rounded-full border-2 border-accent-300/70 p-[3px] ${sizeClass}`}>
      <div className="relative h-full w-full overflow-hidden rounded-full">
        {photoUrl ? (
          <Image src={photoUrl} alt={agent.fullName} fill className="object-cover" sizes="160px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-100 text-2xl font-bold text-primary-600">
            {initials(agent.fullName)}
          </div>
        )}
      </div>
    </div>
  )
}

function CityPill({ city }: { city: string }) {
  return (
    <Link
      href={`/browse?region=${encodeURIComponent(city)}`}
      className="inline-flex items-center gap-1.5 rounded-full bg-rose-200 px-4 py-1.5 text-sm font-medium text-rose-950 transition-colors hover:bg-rose-300"
    >
      {city} <ExternalLink size={11} className="text-rose-800/70" />
    </Link>
  )
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filtered.map((agent) => {
            const cities = agent.specificArea ? [...agent.regions, agent.specificArea] : agent.regions
            return (
              <div key={agent.id} className="flex flex-col rounded-3xl border-2 border-accent-300/60 bg-surface p-5 sm:p-6">
                {/* ===== Mobile layout ===== */}
                <div className="lg:hidden">
                  <AgentPhoto agent={agent} sizeClass="mx-auto h-[130px] w-[130px]" />
                  <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <Link href={`/aplreps/${agent.id}`} className="font-heading text-xl font-bold text-text-primary hover:text-primary-600">
                      {agent.fullName}
                    </Link>
                    <span className="text-xs text-text-secondary">{agent.agentCode}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <p className="text-base text-text-primary">
                      {agent._count.users} referral{agent._count.users !== 1 ? "s" : ""} | {agent.propertyCount} listing{agent.propertyCount !== 1 ? "s" : ""}
                    </p>
                    <Link
                      href={`/aplreps/${agent.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-rose-200 px-4 py-1.5 text-sm font-medium text-rose-950 transition-colors hover:bg-rose-300"
                    >
                      View profile <ExternalLink size={12} className="text-rose-800/70" />
                    </Link>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {agent.phone && (
                      <a href={`tel:${agent.phone}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary-700 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-800"
                      ><Phone size={14} />Call</a>
                    )}
                    {agent.phone && (
                      <a href={`https://wa.me/${formatPhoneForWhatsApp(agent.phone)}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                      ><WhatsAppIcon size={14} />WhatsApp</a>
                    )}
                    {agent.email && (
                      <a href={`mailto:${agent.email}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-rose-200 px-3.5 py-1.5 text-sm font-medium text-rose-950 transition-colors hover:bg-rose-300"
                      ><Mail size={14} className="text-red-600" />E-Mail</a>
                    )}
                  </div>
                  {cities.length > 0 && (
                    <>
                      <div className="mt-4 border-t border-accent-300/60" />
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex shrink-0 flex-col items-center gap-1">
                          <CitiesCovered size={40} className="text-text-primary" />
                          <span className="text-xs font-medium leading-tight text-text-primary">Cities Covered</span>
                        </div>
                        <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-2.5">
                          {cities.map((c) => <CityPill key={c} city={c} />)}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* ===== Desktop layout ===== */}
                <div className="hidden lg:flex lg:gap-7">
                  <div className="self-center">
                    <AgentPhoto agent={agent} sizeClass="h-[150px] w-[150px]" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <Link href={`/aplreps/${agent.id}`} className="font-heading text-2xl font-bold text-text-primary hover:text-primary-600">
                        {agent.fullName}
                      </Link>
                      <span className="text-sm text-text-secondary">{agent.agentCode}</span>
                    </div>
                    <p className="mt-2 text-[17px] text-text-primary">
                      {agent._count.users} referral{agent._count.users !== 1 ? "s" : ""} | {agent.propertyCount} listing{agent.propertyCount !== 1 ? "s" : ""}
                    </p>
                    <div className="mt-4 grid max-w-[320px] grid-cols-2 gap-x-4 gap-y-3">
                      <Link
                        href={`/aplreps/${agent.id}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-rose-200 px-4 py-2 text-sm font-medium text-rose-950 transition-colors hover:bg-rose-300"
                      >
                        View profile <ExternalLink size={12} className="text-rose-800/70" />
                      </Link>
                      {agent.phone && (
                        <a href={`https://wa.me/${formatPhoneForWhatsApp(agent.phone)}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                        ><WhatsAppIcon />WhatsApp</a>
                      )}
                      {agent.phone && (
                        <a href={`tel:${agent.phone}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-800"
                        ><Phone size={15} />Call</a>
                      )}
                      {agent.email && (
                        <a href={`mailto:${agent.email}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-200 px-4 py-2 text-sm font-medium text-rose-950 transition-colors hover:bg-rose-300"
                        ><Mail size={15} className="text-red-600" />E-Mail</a>
                      )}
                    </div>
                    {cities.length > 0 && <div className="mt-auto pt-5"><div className="border-t border-accent-300/60" /></div>}
                  </div>
                </div>
                {cities.length > 0 && (
                  <div className="mt-5 hidden lg:flex items-center gap-6">
                    <div className="flex shrink-0 items-center gap-3">
                      <CitiesCovered size={52} className="text-text-primary" />
                      <span className="max-w-[72px] text-[17px] leading-snug text-text-primary">Cities Covered</span>
                    </div>
                    <div className="flex flex-1 flex-wrap gap-x-10 gap-y-3">
                      {cities.map((c) => <CityPill key={c} city={c} />)}
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