import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

type Design = {
  id: number
  sku: string
  title: string
  description: string
  price: number
  discount_price?: number
  has_discount: boolean
  effective_price: number
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

export default function Designs() {
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'rating'>('newest')

  useEffect(() => {
    document.title = 'All Designs — THE BLUE WARDROBE'
    
    const fetchDesigns = async () => {
      try {
        setLoading(true)
        const response = await api.get('/designs/')
        
        // Sort designs based on selected criteria
        let sortedDesigns = [...response.data]
        
        switch (sortBy) {
          case 'newest':
            // API should already return newest first
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
  }, [sortBy])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-blue-wardrobe-dark mb-4">
              All Designs
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse our complete collection of dress diaries, each crafted with attention to detail and luxury fabrics.
            </p>
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
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-transparent"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-64 sm:h-72 lg:h-80 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : designs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {designs.map((design, index) => (
              <Link
                to={`/designs/${design.id}`}
                key={design.id}
                className="group luxury-shadow rounded-lg overflow-hidden hover:luxury-shadow-lg transition-all duration-500 bg-white transform hover:-translate-y-2"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both`,
                }}
              >
                <div className="h-64 sm:h-72 lg:h-80 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden relative cursor-pointer group">
                  {design.images?.length > 0 ? (
                    <img
                      src={design.images[0].image_url}
                      alt={design.images[0].alt_text || design.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
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
                          if (e.target === modal || e.target.tagName === 'BUTTON') {
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
                    <div className="absolute top-4 left-4 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      {design.discount_percentage}% OFF
                    </div>
                  )}
                  {design.total_stock === 0 && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      OUT OF STOCK
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4 md:p-6">
                  <div className="text-xs tracking-[0.15em] uppercase text-gray-500 mb-2">
                    {design.collection}
                  </div>
                  <h3 className="text-base md:text-lg font-serif font-semibold text-blue-wardrobe-dark mb-2 group-hover:text-blue-wardrobe-light transition-colors">
                    {design.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      {design.has_discount && (
                        <div className="text-sm text-red-600 line-through">
                          NGN {design.price.toLocaleString()}
                        </div>
                      )}
                      <div className="text-lg font-semibold text-blue-wardrobe-dark">
                        NGN {design.effective_price.toLocaleString()}
                      </div>
                    </div>
                    {design.total_reviews > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-600">
                          {design.average_rating.toFixed(1)} ({design.total_reviews})
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-sm text-blue-wardrobe-light font-medium group-hover:underline">
                    View Design →
                  </div>
                </div>
              </Link>
            ))}
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
