import React, { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigationType } from 'react-router-dom'
import api from '../lib/api'
import DesignPriceLines from '../components/DesignPriceLines'
import DesignCardBadges from '../components/DesignCardBadges'
import DesignPagination from '../components/DesignPagination'

type Design = {
  id: number
  sku: string
  title: string
  description: string
  price: number
  discount_price?: number
  has_discount: boolean
  effective_price: number
  effective_price_usd?: number | null
  effective_price_gbp?: number | null
  discount_percentage: number
  total_stock: number
  images: Array<{
    id: number
    image_url: string
    alt_text?: string
  }>
  collection: string
  average_rating: number
  total_reviews: number
  is_preorder?: boolean
  preorder_wait_days?: number
  preorder_status?: string
  created_at?: string
}

export default function Designs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navType = useNavigationType()
  const filterParam = (searchParams.get('filter') || '').toLowerCase()
  const isPreorderFilter =
    filterParam === 'preorders' ||
    filterParam === 'preorder' ||
    filterParam === 'atelier-reserve'

  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'rating'>('newest')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const pageFromUrl = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  // Desktop is a 4-column grid — 8 per page fills 4 above + 4 below.
  const designsPerPage = 8
  const totalPages = Math.max(1, Math.ceil(designs.length / designsPerPage))
  const currentPage = Math.min(pageFromUrl, totalPages)
  const startIndex = (currentPage - 1) * designsPerPage
  const endIndex = startIndex + designsPerPage
  const currentDesigns = designs.slice(startIndex, endIndex)

  useEffect(() => {
    document.title = isPreorderFilter
      ? 'Atelier Reserve — THE BLUE WARDROBE'
      : 'All Designs — THE BLUE WARDROBE'
    
    const fetchDesigns = async () => {
      try {
        setLoading(true)
        const response = isPreorderFilter
          ? await api.get('/designs/atelier-reserve/')
          : await api.get('/designs/')
        
        let sortedDesigns = [...response.data]
        
        switch (sortBy) {
          case 'newest':
            sortedDesigns.sort((a, b) => {
              const ta = a.created_at ? new Date(a.created_at).getTime() : 0
              const tb = b.created_at ? new Date(b.created_at).getTime() : 0
              if (tb !== ta) return tb - ta
              return b.id - a.id
            })
            break
          case 'price-low':
            sortedDesigns.sort((a, b) => a.effective_price - b.effective_price)
            break
          case 'price-high':
            sortedDesigns.sort((a, b) => b.effective_price - a.effective_price)
            break
          case 'rating':
            sortedDesigns.sort((a, b) => b.average_rating - a.average_rating)
            break
        }
        
        setDesigns(sortedDesigns)
      } catch (error) {
        console.error('Failed to fetch designs:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDesigns()
  }, [sortBy, isPreorderFilter])

  const setPageInUrl = (page: number) => {
    const next = new URLSearchParams(searchParams)
    if (page <= 1) next.delete('page')
    else next.set('page', String(page))
    setSearchParams(next)
  }

  const handlePageChange = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) return
    
    setIsTransitioning(true)
    
    const designsGrid = document.getElementById('designs-grid')
    if (designsGrid) {
      designsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    setPageInUrl(page)
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }

  const handleSortChange = (value: 'newest' | 'price-low' | 'price-high' | 'rating') => {
    setSortBy(value)
    const next = new URLSearchParams(searchParams)
    next.delete('page')
    setSearchParams(next)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--tbw-bg)]">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-gray-200 bg-white dark:border-slate-700 dark:bg-[var(--tbw-surface)]">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50/20 to-purple-50/10 dark:from-slate-900/40 dark:to-slate-950/30" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-serif font-semibold text-blue-wardrobe-dark dark:text-blue-luxury-200 md:text-4xl">
              {isPreorderFilter ? 'Atelier Reserve' : 'All Designs'}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-slate-300">
              {isPreorderFilter
                ? 'Reserve unreleased dresses — estimated wait 14 days after order.'
                : 'Browse our complete collection of dress diaries, each crafted with attention to detail and luxury fabrics.'}
            </p>
            <div className="mt-4 text-sm text-gray-500 dark:text-slate-400">
              {designs.length} designs total
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${designs.length} designs found`}
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as 'newest' | 'price-low' | 'price-high' | 'rating')}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-transparent transition-all duration-200"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Designs Grid */}
      <div 
        id="designs-grid"
        className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
      >
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6 lg:gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse rounded-xl border border-gray-100/80 bg-white p-2.5 sm:p-4">
                <div className="aspect-[3/4] w-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg mb-2 sm:mb-4" />
                <div className="h-3 sm:h-4 bg-gray-200 rounded mb-1.5 sm:mb-2" />
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : currentDesigns.length > 0 ? (
          <div 
            className={`transition-all duration-500 ease-out ${
              isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
            }`}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 items-stretch gap-2 sm:gap-4 md:gap-6 lg:gap-8">
              {currentDesigns.map((design, index) => (
                <div
                  key={design.id}
                  className="h-full transform transition-all duration-700 hover:scale-105"
                  style={{
                    animation: navType === 'POP' ? undefined : `fadeInUp 0.8s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <Link
                    to={`/designs/${design.id}`}
                    id={`catalog-design-${design.id}`}
                    className="group luxury-shadow flex h-full flex-col rounded-xl sm:rounded-lg overflow-hidden hover:luxury-shadow-lg transition-all duration-500 bg-white block border border-gray-100/80 dark:border-slate-700"
                  >
                    <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden cursor-pointer group">
                      {design.images?.length > 0 ? (
                        <img
                          src={design.images[0].image_url}
                          alt={design.images[0].alt_text || design.title}
                          className="h-full w-full object-cover object-top origin-top transform transition-transform duration-700 group-hover:scale-[1.03]"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Create modal for full image viewing
                            const modal = document.createElement('div')
                            modal.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-auto'
                            modal.innerHTML = `
                              <div class="relative flex items-center justify-center min-h-full">
                                <img src="${design.images[0].image_url}" alt="${design.images[0].alt_text || design.title}" class="max-w-full max-h-screen object-contain">
                                <button class="fixed top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-75 transition-all text-xl">
                                  ✕
                                </button>
                              </div>
                            `
                            modal.onclick = (e) => {
                              if (e.target === modal || (e.target as HTMLElement)?.tagName === 'BUTTON') {
                                document.body.removeChild(modal)
                              }
                            }
                            document.body.appendChild(modal)
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-blue-wardrobe-dark font-serif text-xl font-semibold mb-1">
                              {design.sku}
                            </div>
                            <div className="text-gray-500 text-xs tracking-wider uppercase">
                              DDC LOOK
                            </div>
                          </div>
                        </div>
                      )}
                      <DesignCardBadges
                        isPreorder={design.is_preorder}
                        hasDiscount={design.has_discount}
                        discountPercentage={design.discount_percentage}
                        totalStock={design.total_stock}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="flex flex-1 flex-col p-2.5 sm:p-4 md:p-6">
                      <div className="text-[10px] sm:text-xs tracking-[0.12em] sm:tracking-[0.15em] uppercase text-gray-500 dark:text-slate-400 mb-1 sm:mb-2 line-clamp-1">
                        {design.collection}
                      </div>
                      <h3 className="text-xs sm:text-base md:text-lg font-serif font-semibold text-blue-wardrobe-dark dark:text-slate-100 mb-1 sm:mb-2 line-clamp-2 group-hover:text-blue-wardrobe-light dark:group-hover:text-blue-luxury-300 transition-colors leading-snug">
                        {design.title}
                      </h3>
                      <div className="flex flex-1 items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <div className="min-h-[1.125rem] sm:min-h-[1.25rem]">
                            {design.has_discount ? (
                              <div className="text-[10px] sm:text-sm text-red-500 line-through mb-0.5">
                                NGN {design.price.toLocaleString()}
                              </div>
                            ) : null}
                          </div>
                          <DesignPriceLines design={design} className="[&>div:first-child]:text-sm [&>div:first-child]:sm:text-lg" />
                        </div>
                        {design.total_reviews > 0 && (
                          <div className="hidden sm:flex shrink-0 items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm text-gray-600">
                              {design.average_rating.toFixed(1)} ({design.total_reviews})
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 sm:mt-4 w-full rounded-lg border border-gray-300 dark:border-slate-600 py-1.5 sm:py-2 text-center text-[11px] sm:text-sm font-medium text-blue-wardrobe-dark dark:text-slate-200 transition-colors group-hover:border-blue-wardrobe-light group-hover:bg-blue-50/60 dark:group-hover:border-blue-luxury-400 dark:group-hover:bg-blue-900/40">
                        View design
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            
            <DesignPagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalCount={designs.length}
              onPageChange={handlePageChange}
            />
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No designs available yet. Check back soon for new Dress Diaries releases.</p>
          </div>
        )}
      </div>
    </div>
  )
}
