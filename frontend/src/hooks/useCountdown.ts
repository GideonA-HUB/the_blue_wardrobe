import { useEffect, useMemo, useState } from 'react'

export type CountdownParts = {
  totalMs: number
  days: number
  hours: number
  minutes: number
  seconds: number
  finished: boolean
}

function partsFromMs(ms: number): CountdownParts {
  const totalMs = Math.max(0, ms)
  const totalSeconds = Math.floor(totalMs / 1000)
  return {
    totalMs,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    finished: totalMs <= 0,
  }
}

/** Live countdown to an ISO datetime target. Updates every 1s. */
export function useCountdown(targetIso: string | null | undefined): CountdownParts {
  const targetMs = useMemo(() => {
    if (!targetIso) return null
    const t = Date.parse(targetIso)
    return Number.isNaN(t) ? null : t
  }, [targetIso])

  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (targetMs == null) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [targetMs])

  if (targetMs == null) {
    return partsFromMs(0)
  }
  return partsFromMs(targetMs - now)
}

export function formatCountdownLabel(parts: CountdownParts): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${parts.days}d : ${pad(parts.hours)}h : ${pad(parts.minutes)}m : ${pad(parts.seconds)}s`
}

export type PreorderDesignLite = {
  is_preorder?: boolean
  preorder_start_at?: string | null
  preorder_end_at?: string | null
  preorder_status?: string
}

/**
 * Section-level countdown mode from a list of preorder designs.
 * Active open windows win → "closes"; else upcoming → "opens".
 */
export function getAtelierCountdownTarget(designs: PreorderDesignLite[]): {
  mode: 'closes' | 'opens' | 'none'
  target: string | null
} {
  const now = Date.now()
  const activeEnds: number[] = []
  const upcomingStarts: number[] = []

  for (const d of designs) {
    if (!d.is_preorder) continue
    const start = d.preorder_start_at ? Date.parse(d.preorder_start_at) : NaN
    const end = d.preorder_end_at ? Date.parse(d.preorder_end_at) : NaN

    const started = !Number.isNaN(start) ? now >= start : true
    const notEnded = Number.isNaN(end) || now < end

    if (started && notEnded && !Number.isNaN(end)) {
      activeEnds.push(end)
    } else if (!Number.isNaN(start) && now < start) {
      upcomingStarts.push(start)
    }
  }

  if (activeEnds.length) {
    const earliest = Math.min(...activeEnds)
    return { mode: 'closes', target: new Date(earliest).toISOString() }
  }
  if (upcomingStarts.length) {
    const earliest = Math.min(...upcomingStarts)
    return { mode: 'opens', target: new Date(earliest).toISOString() }
  }
  return { mode: 'none', target: null }
}

/** Convert ISO datetime to datetime-local input value (local timezone). */
export function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Convert datetime-local value to ISO string, or null if empty. */
export function datetimeLocalToIso(value: string | null | undefined): string | null {
  if (!value || !String(value).trim()) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}
