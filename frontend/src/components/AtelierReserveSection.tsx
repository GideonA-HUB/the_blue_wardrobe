import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import DesignPriceLines from './DesignPriceLines'
import {
  formatCountdownLabel,
  getAtelierCountdownTarget,
  useCountdown,
} from '../hooks/useCountdown'

type PreorderDesign = {
  id: number
  sku: string
  title: string
  price: number
  has_discount: boolean
  effective_price: number
  effective_price_usd?: number | null
  effective_price_gbp?: number | null
  discount_percentage: number
  total_stock: number
  images: Array<{ id: number; image_url: string; alt_text?: string }>
  collection: string
  is_preorder: boolean
  preorder_start_at?: string | null
  preorder_end_at?: string | null
  preorder_wait_days?: number
  preorder_status?: string
}

function CountdownDisplay({
  mode,
  target,
}: {
  mode: 'closes' | 'opens'
  target: string
}) {
  const parts = useCountdown(target)
  const label = mode === 'closes' ? 'Closes in' : 'Opens in'

  return (
    <div className="inline-flex flex-col items-center gap-1 sm:items-start">
      <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-blue-wardrobe-light/90 dark:text-blue-luxury-300">
        {label}
      </span>
      <span className="font-serif text-lg tabular-nums tracking-wide text-blue-wardrobe-dark dark:text-blue-luxury-100 sm:text-xl">
        {parts.finished ? (mode === 'closes' ? 'Closed' : 'Opening…') : formatCountdownLabel(parts)}
      </span>
    </div>
  )
}

export default function AtelierReserveSection() {
  const [designs, setDesigns] = useState<PreorderDesign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    api
      .get('/designs/atelier-reserve/')
      .then((r) => {
        if (!cancelled) setDesigns(Array.isArray(r.data) ? r.data : [])
      })
      .catch(() => {
        if (!cancelled) setDesigns([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const countdown = getAtelierCountdownTarget(designs)
  const defaultWait =
    designs.find((d) => d.preorder_wait_days)?.preorder_wait_days ?? 14

  if (!loading && designs.length === 0) {
    return null
  }

  return (
    <section
      id="atelier-reserve"
      className="relative mb-16 mt-8 overflow-hidden md:mb-24 md:mt-12"
      aria-labelledby="atelier-reserve-heading"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-wardrobe-dark/[0.04] via-transparent to-blue-wardrobe-light/[0.06] dark:from-blue-900/20 dark:to-slate-950/40" />

      <div className="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div className="text-center md:text-left">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-blue-wardrobe-light dark:text-blue-luxury-300">
            Private reservation
          </p>
          <h2
            id="atelier-reserve-heading"
            className="mb-3 font-serif text-3xl font-semibold text-blue-wardrobe-dark dark:text-blue-luxury-200 md:text-5xl"
          >
            Atelier Reserve
          </h2>
          <p className="mx-auto max-w-xl text-base text-gray-600 dark:text-slate-300 md:mx-0 md:text-lg">
            Reserve unreleased dresses — estimated wait {defaultWait} days
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end md:items-end">
          {loading ? (
            <div className="h-12 w-48 animate-pulse rounded-lg bg-blue-50 dark:bg-slate-800" />
          ) : countdown.mode === 'none' || !countdown.target ? (
            <p className="text-sm text-gray-500 dark:text-slate-400">No preorders at the moment</p>
          ) : (
            <CountdownDisplay mode={countdown.mode} target={countdown.target} />
          )}
          <Link
            to="/designs?filter=preorders"
            className="inline-flex items-center rounded-full border border-blue-wardrobe-light/30 bg-white/80 px-5 py-2.5 text-sm font-medium text-blue-wardrobe-dark backdrop-blur-sm transition-all hover:border-blue-wardrobe-light hover:bg-blue-wardrobe-dark hover:text-white dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-blue-luxury-600"
          >
            View All →
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-100 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900 sm:p-4">
              <div className="mb-3 aspect-[3/4] rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700" />
              <div className="mb-2 h-3 rounded bg-gray-200 dark:bg-slate-700" />
              <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 items-stretch gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-8">
          {designs.slice(0, 6).map((design) => (
            <Link
              key={design.id}
              to={`/designs/${design.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-100/80 bg-white luxury-shadow transition-all duration-500 hover:luxury-shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:rounded-lg"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700">
                {design.images?.[0] ? (
                  <img
                    src={design.images[0].image_url}
                    alt={design.images[0].alt_text || design.title}
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-serif text-blue-wardrobe-dark dark:text-slate-200">
                    {design.sku}
                  </div>
                )}
                <div className="absolute left-2 top-2 rounded-full border border-white/30 bg-blue-wardrobe-dark/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white backdrop-blur-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
                  Atelier Reserve
                </div>
                {design.preorder_status === 'upcoming' && (
                  <div className="absolute bottom-2 left-2 right-2 rounded-md bg-black/55 px-2 py-1 text-center text-[10px] text-white backdrop-blur-sm sm:text-xs">
                    Opens soon
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-2.5 sm:p-4 md:p-5">
                <div className="mb-1 line-clamp-1 text-[10px] uppercase tracking-[0.14em] text-gray-500 dark:text-slate-400 sm:text-xs">
                  {design.collection}
                </div>
                <h3 className="mb-2 line-clamp-2 font-serif text-xs font-semibold leading-snug text-blue-wardrobe-dark transition-colors group-hover:text-blue-wardrobe-light dark:text-slate-100 dark:group-hover:text-blue-luxury-300 sm:text-base md:text-lg">
                  {design.title}
                </h3>
                <div className="mb-2 text-[10px] text-gray-500 dark:text-slate-400 sm:text-xs">
                  Estimated wait: {design.preorder_wait_days ?? 14} days
                </div>
                <div className="mt-auto">
                  <DesignPriceLines
                    design={design}
                    className="[&>div:first-child]:text-sm [&>div:first-child]:sm:text-lg"
                  />
                  <div className="mt-3 w-full rounded-lg border border-gray-300 py-1.5 text-center text-[11px] font-medium text-blue-wardrobe-dark transition-colors group-hover:border-blue-wardrobe-light group-hover:bg-blue-50/60 dark:border-slate-600 dark:text-slate-200 dark:group-hover:border-blue-luxury-400 dark:group-hover:bg-blue-900/40 sm:py-2 sm:text-sm">
                    {design.preorder_status === 'upcoming' ? 'View reserve' : 'Preorder Now'}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
