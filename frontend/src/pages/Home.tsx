import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../lib/api'
import AnimatedHero, { type HomeHeroPayload } from '../components/AnimatedHero'
import type { AtelierSlide } from '../components/ui/interactive-selector'
import { useOptimizedScroll } from '../hooks/useOptimizedScroll'
import NewsletterBanner from '../components/NewsletterBanner'
import VideoSection from '../components/VideoSection'
import InfoCardsSection from '../components/InfoCardsSection'
import DesignPriceLines from '../components/DesignPriceLines'

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
}

type HomepageApi = {
  hero: HomeHeroPayload
  atelier_slides: AtelierSlide[]
}

export default function Home() {
  const [allDesigns, setAllDesigns] = useState<Design[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const scrollY = useOptimizedScroll()
  const [homepage, setHomepage] = useState<HomepageApi | null>(null)
  
  const designsPerPage = 6
  const totalPages = Math.ceil(allDesigns.length / designsPerPage)
  const startIndex = (currentPage - 1) * designsPerPage
  const endIndex = startIndex + designsPerPage
  const currentDesigns = allDesigns.slice(startIndex, endIndex)

  useEffect(() => {
    document.title = 'THE BLUE WARDROBE — Luxury Dress Diaries'
    
    // Fetch all designs for homepage
    const fetchDesigns = async () => {
      try {
        setLoading(true)
        const response = await api.get('/designs/')
        setAllDesigns(response.data)
        setCurrentPage(1)
      } catch (error) {
        console.error('Failed to fetch designs:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDesigns()

    api
      .get<HomepageApi>('/homepage/')
      .then((r) => setHomepage(r.data))
      .catch(() => setHomepage(null))
  }, [])

  const handlePageChange = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) return
    
    setIsTransitioning(true)
    
    // Smooth scroll to top of designs section
    const designsSection = document.getElementById('designs-section')
    if (designsSection) {
      designsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    
    setTimeout(() => {
      setCurrentPage(page)
      setIsTransitioning(false)
    }, 300)
  }

  const renderPaginationNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show smart pagination for larger numbers
      if (currentPage <= 3) {
        for (let i = 1; i <= Math.min(5, totalPages); i++) {
          pages.push(i)
        }
        if (totalPages > 5) {
          pages.push('...')
          pages.push(totalPages)
        }
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = Math.max(totalPages - 4, 1); i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <div className="min-h-screen">
      <AnimatedHero hero={homepage?.hero} />
      
      {/* Featured Designs Section */}
      <section 
        id="designs-section"
        className="mt-16 md:mt-24 mb-16 md:mb-20 relative overflow-hidden"
        style={{
          transform: `translateY(${scrollY * 0.02}px)`,
        }}
      >
        {/* Background parallax element */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/20 -z-10"
          style={{
            transform: `translateY(${scrollY * 0.01}px)`,
          }}
        />
        
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between relative z-10">
          <div className="text-center md:text-left">
            <h2 className="mb-4 text-4xl font-serif font-semibold text-blue-wardrobe-dark md:text-5xl">
              Featured Designs
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 md:mx-0">
              Discover our latest dress diaries crafted from rare, luxurious fabrics sourced globally.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Page {currentPage} of {totalPages} • {allDesigns.length} designs total
            </div>
          </div>
          <div className="flex justify-center md:justify-end gap-3">
            <Link
              to="/designs"
              className="inline-flex items-center rounded-full border border-blue-wardrobe-light/25 bg-white px-5 py-3 text-sm font-medium text-blue-wardrobe-dark transition-all duration-300 hover:bg-blue-wardrobe-light hover:text-white hover:scale-105 hover:shadow-lg"
            >
              See all designs
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-8">
            {[...Array(6)].map((_, index) => (
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-8">
              {currentDesigns.map((design, index) => (
                <div
                  key={design.id}
                  className="transform transition-all duration-700 hover:scale-105"
                  style={{
                    animation: `fadeInUp 0.8s ease-out ${index * 0.15}s both`,
                    transform: `translateY(${scrollY * 0.005 * (index + 1)}px)`,
                  }}
                >
                  <Link
                    to={`/designs/${design.id}`}
                    className="group luxury-shadow rounded-xl sm:rounded-lg overflow-hidden hover:luxury-shadow-lg transition-all duration-500 bg-white block border border-gray-100/80"
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
                      {design.has_discount && (
                        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-red-600 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full animate-bounce">
                          {design.discount_percentage}% OFF
                        </div>
                      )}
                      {design.total_stock === 0 && (
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-600 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                          OUT OF STOCK
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-2.5 sm:p-4 md:p-6">
                      <div className="text-[10px] sm:text-xs tracking-[0.12em] sm:tracking-[0.15em] uppercase text-gray-500 mb-1 sm:mb-2 line-clamp-1">
                        {design.collection}
                      </div>
                      <h3 className="text-xs sm:text-base md:text-lg font-serif font-semibold text-blue-wardrobe-dark mb-1 sm:mb-2 line-clamp-2 group-hover:text-blue-wardrobe-light transition-colors leading-snug">
                        {design.title}
                      </h3>
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          {design.has_discount && (
                            <div className="text-[10px] sm:text-sm text-red-600 line-through mb-0.5">
                              NGN {design.price.toLocaleString()}
                            </div>
                          )}
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
                      <div className="mt-2 sm:mt-4 w-full rounded-lg border border-gray-300 py-1.5 sm:py-2 text-center text-[11px] sm:text-sm font-medium text-blue-wardrobe-dark transition-colors group-hover:border-blue-wardrobe-light group-hover:bg-blue-50/60">
                        View design
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div 
                className="mt-12 mb-8 md:mt-16 md:mb-12 flex flex-col items-center gap-4"
                style={{
                  animation: `fadeInUp 0.8s ease-out 0.6s both`,
                }}
              >
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-blue-wardrobe-light/25 text-blue-wardrobe-dark hover:bg-blue-wardrobe-light hover:text-white hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  {renderPaginationNumbers().map((page, index) => (
                    <div key={index}>
                      {page === '...' ? (
                        <span className="px-3 py-2 text-gray-400">...</span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(page as number)}
                          className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 ${
                            currentPage === page
                              ? 'bg-blue-wardrobe-light text-white scale-110 shadow-lg'
                              : 'bg-white border border-blue-wardrobe-light/25 text-blue-wardrobe-dark hover:bg-blue-wardrobe-light hover:text-white hover:scale-105 hover:shadow-lg'
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-blue-wardrobe-light/25 text-blue-wardrobe-dark hover:bg-blue-wardrobe-light hover:text-white hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    Next
                  </button>
                </div>
                
                {/* Page Info */}
                <div className="text-sm text-gray-500 text-center">
                  Showing {startIndex + 1}-{Math.min(endIndex, allDesigns.length)} of {allDesigns.length} designs
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No designs available yet. Check back soon for new Dress Diaries releases.</p>
          </div>
        )}
      </section>

      <VideoSection atelierSlides={homepage?.atelier_slides ?? []} />
      <InfoCardsSection />
      <NewsletterBanner />
    </div>
  )
}
