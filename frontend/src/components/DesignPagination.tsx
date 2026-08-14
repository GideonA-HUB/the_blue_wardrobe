import React from 'react'

export function visiblePageItems(currentPage: number, totalPages: number): Array<number | '...'> {
  const pages: Array<number | '...'> = []
  const maxVisiblePages = 5

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return pages
  }

  if (currentPage <= 3) {
    for (let i = 1; i <= Math.min(5, totalPages); i++) pages.push(i)
    if (totalPages > 5) {
      pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  if (currentPage >= totalPages - 2) {
    pages.push(1)
    pages.push('...')
    for (let i = Math.max(totalPages - 4, 1); i <= totalPages; i++) pages.push(i)
    return pages
  }

  pages.push(1)
  pages.push('...')
  for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
  pages.push('...')
  pages.push(totalPages)
  return pages
}

type DesignPaginationProps = {
  currentPage: number
  totalPages: number
  startIndex: number
  endIndex: number
  totalCount: number
  onPageChange: (page: number) => void
  noun?: string
}

export default function DesignPagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalCount,
  onPageChange,
  noun = 'designs',
}: DesignPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div
      className="mt-12 mb-8 flex flex-col items-center gap-4 md:mt-16 md:mb-12"
      style={{ animation: 'fadeInUp 0.8s ease-out 0.6s both' }}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
            currentPage === 1
              ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500'
              : 'border border-blue-wardrobe-light/25 bg-white text-blue-wardrobe-dark hover:scale-105 hover:bg-blue-wardrobe-light hover:text-white hover:shadow-lg dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'
          }`}
        >
          Previous
        </button>

        {visiblePageItems(currentPage, totalPages).map((page, index) =>
          page === '...' ? (
            <span key={`e-${index}`} className="px-3 py-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              type="button"
              key={page}
              onClick={() => onPageChange(page)}
              className={`h-10 w-10 rounded-full text-sm font-medium transition-all duration-300 ${
                currentPage === page
                  ? 'scale-110 bg-blue-wardrobe-light text-white shadow-lg'
                  : 'border border-blue-wardrobe-light/25 bg-white text-blue-wardrobe-dark hover:scale-105 hover:bg-blue-wardrobe-light hover:text-white hover:shadow-lg dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
            currentPage === totalPages
              ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500'
              : 'border border-blue-wardrobe-light/25 bg-white text-blue-wardrobe-dark hover:scale-105 hover:bg-blue-wardrobe-light hover:text-white hover:shadow-lg dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'
          }`}
        >
          Next
        </button>
      </div>

      <div className="text-center text-sm text-gray-500 dark:text-slate-400">
        Showing {startIndex + 1}-{Math.min(endIndex, totalCount)} of {totalCount} {noun}
      </div>
    </div>
  )
}
