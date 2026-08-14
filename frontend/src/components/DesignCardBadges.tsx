import React from 'react'

type DesignCardBadgesProps = {
  isPreorder?: boolean
  hasDiscount?: boolean
  discountPercentage?: number
  totalStock?: number
}

/**
 * Product-card status badges. On narrow mobile cards, discount and
 * out-of-stock sit on the bottom of the image so they never collide
 * with Atelier Reserve (or each other) at the top.
 */
export default function DesignCardBadges({
  isPreorder = false,
  hasDiscount = false,
  discountPercentage = 0,
  totalStock = 1,
}: DesignCardBadgesProps) {
  const outOfStock = !isPreorder && totalStock === 0
  const showDiscount = Boolean(hasDiscount && discountPercentage > 0)
  const crowding = [isPreorder, showDiscount, outOfStock].filter(Boolean).length > 1

  const pill =
    'pointer-events-none whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white sm:px-2 sm:py-1 sm:text-xs'

  return (
    <>
      {isPreorder && (
        <div
          className={`absolute left-2 top-2 z-10 max-w-[70%] truncate border border-white/25 bg-blue-wardrobe-dark/90 backdrop-blur-sm sm:left-3 sm:top-3 ${pill}`}
        >
          Atelier Reserve
        </div>
      )}

      {showDiscount && (
        <div
          className={`${
            crowding || isPreorder || outOfStock
              ? 'absolute bottom-2 left-2 z-10 sm:bottom-3 sm:left-3'
              : 'absolute left-2 top-2 z-10 sm:left-3 sm:top-3'
          } bg-red-600 ${pill}`}
        >
          {discountPercentage}% OFF
        </div>
      )}

      {outOfStock && (
        <div
          className={`${
            crowding || showDiscount || isPreorder
              ? 'absolute bottom-2 right-2 z-10 sm:bottom-3 sm:right-3'
              : 'absolute right-2 top-2 z-10 sm:right-3 sm:top-3'
          } bg-red-700 ${pill}`}
        >
          <span className="sm:hidden">SOLD OUT</span>
          <span className="hidden sm:inline">OUT OF STOCK</span>
        </div>
      )}
    </>
  )
}
