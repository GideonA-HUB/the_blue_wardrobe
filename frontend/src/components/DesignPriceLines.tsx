import React from 'react'

export type DesignPriceFields = {
  effective_price: number
  price?: number
  has_discount?: boolean
  effective_price_usd?: number | null
  effective_price_gbp?: number | null
}

function fmt(n: number, maxFrac = 2) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: maxFrac })
}

/** Compact NGN + USD + GBP lines derived from API (catalogue is NGN; FX from backend). */
export default function DesignPriceLines({
  design,
  className = '',
}: {
  design: DesignPriceFields
  className?: string
}) {
  const usd = design.effective_price_usd
  const gbp = design.effective_price_gbp
  return (
    <div className={`space-y-0.5 leading-tight ${className}`}>
      <div className="text-sm sm:text-lg font-semibold text-blue-wardrobe-dark">
        NGN {fmt(design.effective_price, 0)}
      </div>
      {usd != null && !Number.isNaN(usd) && (
        <div className="text-[10px] sm:text-xs text-gray-600">USD {fmt(usd)}</div>
      )}
      {gbp != null && !Number.isNaN(gbp) && (
        <div className="text-[10px] sm:text-xs text-gray-600">GBP {fmt(gbp)}</div>
      )}
    </div>
  )
}
