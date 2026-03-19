import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api, { fetchCSRFToken } from '../lib/api'
import { useCart } from '../store/cart'
import Toast from '../components/Toast'

interface SizeMeasurement {
  id: number
  size: number
  bust: number
  waist: number
  hips: number
  stock: number
  is_active: boolean
  availability_status: 'available' | 'low_stock' | 'out_of_stock'
}

interface SizeInventory {
  id: number
  size: string
  stock: number
  is_active: boolean
  availability_status: 'available' | 'low_stock' | 'out_of_stock'
}

interface DesignImage {
  id: number
  image_url: string
  alt_text?: string
}

interface DesignReview {
  id: number
  design: number
  name: string
  email: string
  rating: number
  comment: string
  is_approved: boolean
  stars_display: string
  created_at: string
  updated_at: string
}

interface Design {
  id: number
  title: string
  description?: string
  sku: string
  price: number
  effective_price: number
  has_discount: boolean
  discount_percentage?: number
  total_stock: number
  video_url?: string
  images: DesignImage[]
  size_inventory: SizeInventory[]
  size_measurements: SizeMeasurement[]
  // Review fields
  average_rating: number
  total_reviews: number
  rating_distribution: { [key: number]: number }
  reviews: DesignReview[]
  created_at: string
  updated_at: string
}

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [design, setDesign] = useState<Design | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingToWardrobe, setAddingToWardrobe] = useState(false)
  const [selectedSizeMeasurements, setSelectedSizeMeasurements] = useState<number[]>([])
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [showSizeDetails, setShowSizeDetails] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const { add, items } = useCart()
  
  // Review state
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    rating: 5,
    comment: ''
  })
  const [submittingReview, setSubmittingReview] = useState(false)
  
  // Debug: Log cart items whenever they change
  useEffect(() => {
    console.log('Cart items updated:', items)
    console.log('Cart count:', items.reduce((sum, item) => sum + item.qty, 0))
  }, [items])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    
    // Fetch CSRF token first
    fetchCSRFToken().then(() => {
      console.log('CSRF token fetched')
    }).catch(error => {
      console.warn('Failed to fetch CSRF token:', error)
    })
    
    api.get(`/designs/${id}/`).then((r) => {
      setDesign(r.data)
      document.title = `${r.data.title} — THE BLUE WARDROBE`
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [id])

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!design || !reviewForm.name.trim() || !reviewForm.email.trim() || !reviewForm.comment.trim()) {
      setToast({ message: 'Please fill in all fields', type: 'error' })
      return
    }

    setSubmittingReview(true)
    try {
      const response = await api.post(`/designs/${design.id}/reviews/`, reviewForm)
      
      // Update design with new review
      setDesign(prev => prev ? {
        ...prev,
        reviews: [response.data, ...prev.reviews],
        total_reviews: prev.total_reviews + 1,
        average_rating: ((prev.average_rating * prev.total_reviews) + response.data.rating) / (prev.total_reviews + 1)
      } : null)

      // Reset form and show success
      setReviewForm({ name: '', email: '', rating: 5, comment: '' })
      setShowReviewForm(false)
      setToast({ 
        message: '🎉 Review submitted successfully! Thank you for sharing your experience.', 
        type: 'success' 
      })
    } catch (error: any) {
      console.error('Failed to submit review:', error)
      const errorMessage = error.response?.data?.details || 'Failed to submit review'
      setToast({ message: errorMessage, type: 'error' })
    } finally {
      setSubmittingReview(false)
    }
  }

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : 'button'}
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(star)}
            className={`text-3xl transition-all duration-300 transform ${
              interactive ? 'cursor-pointer hover:scale-125 hover:rotate-12' : 'cursor-default'
            } ${
              star <= rating 
                ? 'text-transparent bg-gradient-to-br from-yellow-400 to-orange-400 bg-clip-text drop-shadow-sm' 
                : 'text-gray-300'
            }`}
            style={{
              filter: star <= rating ? 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3))' : 'none',
              animation: interactive && star <= rating ? `pulse 2s infinite ${star * 0.1}s` : 'none'
            }}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="text-gray-400 text-lg">Loading look…</div>
      </div>
    )
  }

  if (!design) {
    return (
      <div className="py-16 text-center">
        <div className="text-gray-400 text-lg">Design not found.</div>
      </div>
    )
  }

  return (
    <div className="py-8 md:py-12">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="animate-fade-in">
          <div className="luxury-shadow rounded-lg overflow-hidden cursor-pointer group bg-white animate-scale-in"
               onClick={() => {
                 if (design.images?.length > 0) {
                   // Create modal for full image viewing
                   const modal = document.createElement('div');
                   modal.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-auto';
                   modal.innerHTML = `
                     <div class="relative flex items-center justify-center min-h-full">
                       <img src="${design.images[0].image_url}" alt="${design.images[0].alt_text || design.title}" class="max-w-full max-h-screen object-contain">
                       <button class="fixed top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-75 transition-all text-xl">
                         ✕
                       </button>
                     </div>
                   `;
                   modal.onclick = (e) => {
                     if (e.target === modal || e.target.tagName === 'BUTTON') {
                       document.body.removeChild(modal);
                     }
                   };
                   document.body.appendChild(modal);
                 }
               }}>
            {design.images?.length > 0 ? (
              <img
                src={design.images[0].image_url}
                alt={design.images[0].alt_text || design.title}
                className="w-full h-auto max-h-96 md:max-h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700"
                style={{ animation: 'fadeIn 0.8s ease-out 0.2s both' }}
              />
            ) : (
              <div className="w-full h-64 md:h-80 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-blue-wardrobe-dark font-serif text-lg md:text-xl font-semibold mb-2">
                    {design.sku}
                  </div>
                  <div className="text-gray-500 text-xs md:text-sm tracking-wider uppercase">
                    THE BLUE WARDROBE
                  </div>
                </div>
              </div>
            )}
          </div>
          {design.video_url && (
            <div className="mt-3 md:mt-4 luxury-shadow rounded-lg overflow-hidden bg-black">
              <video
                src={design.video_url}
                controls
                className="w-full h-auto max-h-64 md:max-h-80 lg:max-h-96 object-contain"
                poster={design.images?.[0]?.image_url}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          {design.images && design.images.length > 1 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 md:gap-2 mt-3 md:mt-4">
              {design.images.slice(1, 5).map((img, idx) => (
                <div
                  key={img.id}
                  className="luxury-shadow rounded overflow-hidden cursor-pointer hover:opacity-75 transition-opacity animate-scale-in"
                  style={{ animation: `scaleIn 0.5s ease-out ${0.4 + idx * 0.1}s both` }}
                  onClick={() => {
                    // Create modal or lightbox for image viewing
                    const modal = document.createElement('div');
                    modal.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-auto';
                    modal.innerHTML = `
                      <div class="relative flex items-center justify-center min-h-full">
                        <img src="${img.image_url}" alt="${img.alt_text || design.title}" class="max-w-full max-h-screen object-contain">
                        <button class="fixed top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-75 transition-all text-xl">
                          ✕
                        </button>
                      </div>
                    `;
                    modal.onclick = (e) => {
                      if (e.target === modal || e.target.tagName === 'BUTTON') {
                        document.body.removeChild(modal);
                      }
                    };
                    document.body.appendChild(modal);
                  }}
                >
                  <img 
                    src={img.image_url} 
                    alt={img.alt_text || `${design.title} ${idx + 2}`} 
                    className="w-full h-16 md:h-20 object-cover hover:scale-110 transition-transform duration-300" 
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="animate-slide-right">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-semibold text-blue-wardrobe-dark tracking-tight">
              {design.title}
            </h1>
            <div className="text-right sm:ml-4">
              {design.has_discount && (
                <div className="text-red-600 text-sm md:text-base font-medium line-through">
                  NGN {design.price.toLocaleString()}
                </div>
              )}
              <p className="text-2xl md:text-3xl font-bold text-blue-wardrobe-dark">
                NGN {design.effective_price.toLocaleString()}
              </p>
              {design.has_discount && (
                <div className="bg-red-600 text-white text-xs px-2 py-1 rounded-full inline-block mt-1">
                  {design.discount_percentage}% OFF
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 md:pt-6 mb-4 md:mb-6">
            <p className="text-gray-700 leading-relaxed text-sm md:text-base">{design.description || 'A timeless piece from The Dress Diaries Collection.'}</p>
          </div>

          <div className="mb-6">
            <div className="text-sm text-gray-600">
              {design.total_stock > 0 ? (
                <span className="text-emerald-600 font-medium">
                  ✓ {design.total_stock} pieces available across sizes
                </span>
              ) : (
                <span className="text-red-600 font-medium">Currently out of stock</span>
              )}
            </div>
          </div>

          <div className="mt-8">
            <label className="block text-xs font-semibold tracking-[0.2em] uppercase text-gray-600 mb-3">
              Select size
            </label>
            
            {/* Check if size measurements exist */}
            {!design.size_measurements || design.size_measurements.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <div className="text-yellow-800 font-medium">Size measurements not available</div>
                    <div className="text-yellow-600 text-sm">Please contact admin to set up size measurements for this design.</div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-2 max-w-xs">
                  {[6, 8, 10, 12, 14, 16, 18, 20].map((size) => {
                    const sizeMeasurements = design.size_measurements?.filter(sm => sm.size === size && sm.is_active) || []
                    const hasAvailableMeasurements = sizeMeasurements.some(sm => sm.stock > 0)
                    const isSelected = selectedSize === size
                    
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          if (hasAvailableMeasurements) {
                            setSelectedSize(size)
                            setShowSizeDetails(true)
                          }
                        }}
                        disabled={!hasAvailableMeasurements}
                        className={`
                          relative py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200
                          ${isSelected 
                            ? 'border-blue-wardrobe-dark bg-blue-wardrobe-dark text-white' 
                            : !hasAvailableMeasurements
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                            : 'border-gray-300 text-gray-700 hover:border-blue-wardrobe-light hover:bg-blue-50'
                          }
                        `}
                      >
                        {size}
                        {!hasAvailableMeasurements && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Size Details Modal */}
          {showSizeDetails && selectedSize && (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-2xl p-4 sm:p-8 max-w-lg w-full max-h-[90vh] sm:max-h-[85vh] overflow-y-auto luxury-shadow-lg transform transition-all duration-300 scale-100 animate-scale-in">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-wardrobe-dark text-white rounded-full text-2xl font-bold mb-4">
                    {selectedSize}
                  </div>
                  <h3 className="text-2xl font-serif font-semibold text-blue-wardrobe-dark mb-2">
                    Available Measurements
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Select your perfect fit from the measurements below
                  </p>
                </div>

                {/* Measurements List */}
                <div className="space-y-4 mb-8">
                  {design.size_measurements
                    .filter(sm => sm.size === selectedSize && sm.is_active && sm.stock > 0).length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <div className="text-gray-500 font-medium">No measurements available</div>
                      <div className="text-gray-400 text-sm">This size is currently out of stock</div>
                    </div>
                  ) : (
                    design.size_measurements
                      .filter(sm => sm.size === selectedSize && sm.is_active && sm.stock > 0)
                      .map((measurement, index) => (
                      <div
                        key={measurement.id}
                        className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:luxury-shadow-md ${
                          selectedSizeMeasurements.includes(measurement.id)
                            ? 'border-blue-wardrobe-dark bg-gradient-to-r from-blue-50 to-blue-100 transform scale-[1.02]'
                            : 'border-gray-200 hover:border-blue-wardrobe-light hover:bg-gray-50'
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => {
                          if (selectedSizeMeasurements.includes(measurement.id)) {
                            setSelectedSizeMeasurements(selectedSizeMeasurements.filter(id => id !== measurement.id))
                          } else {
                            setSelectedSizeMeasurements([...selectedSizeMeasurements, measurement.id])
                          }
                        }}
                      >
                        {/* Selection Indicator */}
                        <div className="absolute top-4 right-4">
                          {selectedSizeMeasurements.includes(measurement.id) && (
                            <div className="w-6 h-6 bg-blue-wardrobe-dark text-white rounded-full flex items-center justify-center animate-scale-in">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Measurements Display */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                          <div className="flex-1">
                            <div className="font-serif text-lg font-semibold text-blue-wardrobe-dark mb-3">
                              Measurements
                            </div>
                            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-sm">
                              <div className="text-center">
                                <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Bust</div>
                                <div className="font-semibold text-blue-wardrobe-dark">{measurement.bust}"</div>
                              </div>
                              <div className="text-center">
                                <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Waist</div>
                                <div className="font-semibold text-blue-wardrobe-dark">{measurement.waist}"</div>
                              </div>
                              <div className="text-center">
                                <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Hips</div>
                                <div className="font-semibold text-blue-wardrobe-dark">{measurement.hips}"</div>
                              </div>
                            </div>
                          </div>
                          <div className="text-center sm:text-right sm:ml-6">
                            <div className="text-sm text-gray-600 mb-1">Available</div>
                            <div className={`font-semibold ${
                              measurement.stock <= 5 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {measurement.stock} in stock
                            </div>
                            {measurement.stock <= 5 && (
                              <div className="text-xs text-yellow-600 mt-1">Limited</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowSizeDetails(false)
                      setSelectedSize(null)
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowSizeDetails(false)
                      setSelectedSize(null)
                    }}
                    className="flex-1 px-6 py-3 bg-blue-wardrobe-dark text-white rounded-xl hover:bg-blue-wardrobe-light transition-all duration-300 font-medium luxury-shadow hover:luxury-shadow-lg transform hover:scale-105"
                  >
                    Done ({selectedSizeMeasurements.length} selected)
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedSizeMeasurements.length > 0 && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="text-emerald-600 font-medium">
                ✓ Selected {selectedSizeMeasurements.length} measurement(s)
              </span>
            </div>
          )}

          <div className="mt-8 space-y-4">
            <button
              className="w-full max-w-xs px-8 py-4 bg-blue-wardrobe-dark text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed tracking-wide hover:bg-blue-wardrobe-light transition-all duration-300 font-medium luxury-shadow hover:luxury-shadow-lg transform hover:scale-105 disabled:transform-none"
              disabled={selectedSizeMeasurements.length === 0 || addingToWardrobe}
              onClick={async () => {
                if (!design || selectedSizeMeasurements.length === 0) return
                
                setAddingToWardrobe(true)
                try {
                  console.log('Adding to wardrobe:', { designId: design.id, selectedSizeMeasurements })
                  
                  // Add each selected size measurement to cart
                  for (const sizeMeasurementId of selectedSizeMeasurements) {
                    const measurement = design.size_measurements.find(sm => sm.id === sizeMeasurementId)
                    if (!measurement) continue
                    
                    console.log('Adding measurement:', { size_measurement_id: sizeMeasurementId, quantity: 1 })
                    
                    const response = await api.post('/cart/add/', {
                      design_id: design.id,
                      size_measurement_id: sizeMeasurementId,
                      quantity: 1
                    })
                    
                    console.log('API response:', response.data)
                    
                    // Update local cart state
                    add({
                      id: design.id,
                      title: design.title,
                      price: design.effective_price,
                      size: measurement.size,
                      qty: 1,
                      image: design.images?.[0]?.image_url,
                    })
                    
                    console.log('Current cart items:', items)
                  }
                  
                  // Clear selected measurements after adding
                  setSelectedSizeMeasurements([])
                  
                  // Show success feedback
                  setToast({
                    message: `✨ Added ${selectedSizeMeasurements.length} item(s) to your wardrobe!`,
                    type: 'success'
                  })
                } catch (error: any) {
                  console.error('Error adding to wardrobe:', error)
                  console.error('Error response:', error.response?.data)
                  console.error('Error status:', error.response?.status)
                  setToast({
                    message: `Failed to add to wardrobe: ${error.response?.data?.detail || error.message || 'Please try again.'}`,
                    type: 'error'
                  })
                } finally {
                  setAddingToWardrobe(false)
                }
              }}
            >
              {addingToWardrobe ? 'Adding...' : `Add to Wardrobe${selectedSizeMeasurements.length > 1 ? ` (${selectedSizeMeasurements.length} items)` : ''}`}
            </button>
            
            {/* Checkout button for users ready to proceed */}
            <button
              className="w-full max-w-xs px-8 py-3 border-2 border-blue-wardrobe-dark text-blue-wardrobe-dark rounded-full hover:bg-blue-wardrobe-dark hover:text-white transition-all duration-300 font-medium"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-20 relative overflow-hidden">
        {/* Background gradient for parallax effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-wardrobe-light/5 via-white to-purple-wardrobe/5 transform -skew-y-3"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-wardrobe-dark to-purple-wardrobe bg-clip-text text-transparent">
              Customer Reviews
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover what our customers are saying about their Blue Wardrobe experience
            </p>
          </div>
          
          {/* Rating Summary Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 transform hover:scale-105 transition-all duration-500 luxury-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Average Rating */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full mb-4 transform hover:rotate-12 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">{design.average_rating.toFixed(1)}</span>
                </div>
                <div className="mb-2">
                  {renderStars(Math.round(design.average_rating))}
                </div>
                <div className="text-gray-600 font-medium">{design.total_reviews} Verified Reviews</div>
                <div className="text-sm text-gray-500 mt-2">Based on customer feedback</div>
              </div>
              
              {/* Rating Distribution */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 mb-4">Rating Distribution</h4>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = design.rating_distribution[rating] || 0
                  const percentage = design.total_reviews > 0 ? (count / design.total_reviews) * 100 : 0
                  return (
                    <div key={rating} className="group">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 w-8">{rating}</span>
                        <span className="text-yellow-400 text-lg group-hover:scale-110 transition-transform">★</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-1000 ease-out transform origin-left"
                            style={{ 
                              width: `${percentage}%`,
                              animation: `slideIn 1s ease-out ${rating * 0.1}s both`
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right font-medium">{count}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          
          {/* Write Review Button */}
          <div className="text-center mb-12">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-wardrobe-dark to-purple-wardrobe text-white rounded-full font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 luxury-shadow hover:luxury-shadow-lg"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>✨</span>
                <span>{showReviewForm ? 'Cancel Review' : 'Write a Review'}</span>
                <span>✨</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-wardrobe to-blue-wardrobe-dark rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-500 animate-slide-up luxury-shadow">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h3>
                <p className="text-gray-600">Help others make informed decisions</p>
              </div>
              
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-wardrobe-dark transition-colors">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all duration-300 hover:border-gray-300"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-wardrobe-dark transition-colors">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={reviewForm.email}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all duration-300 hover:border-gray-300"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Your Rating</label>
                  <div className="flex justify-center gap-2">
                    {renderStars(reviewForm.rating, true, (rating) => 
                      setReviewForm(prev => ({ ...prev, rating }))
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Click to rate</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all duration-300 hover:border-gray-300 resize-none"
                    placeholder="Share your experience with this design..."
                    required
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-8 py-3 bg-gradient-to-r from-blue-wardrobe-dark to-purple-wardrobe text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold disabled:opacity-50 disabled:transform-none luxury-shadow"
                  >
                    {submittingReview ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Review'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {design.reviews.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-gray-600 mb-6">Be the first to share your experience with this design!</p>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-6 py-3 bg-blue-wardrobe-dark text-white rounded-xl hover:bg-blue-wardrobe-light transition-all duration-300 font-medium"
                >
                  Write the First Review
                </button>
              </div>
            ) : (
              design.reviews.map((review, index) => (
                <div 
                  key={review.id} 
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-wardrobe-light to-purple-wardrobe rounded-full flex items-center justify-center text-white font-semibold">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{review.name}</div>
                        <div className="text-sm text-gray-500">{review.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {renderStars(review.rating)}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(review.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  
                  {/* Helpful buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button className="text-sm text-gray-500 hover:text-blue-wardrobe-dark transition-colors">
                        👍 Helpful
                      </button>
                      <button className="text-sm text-gray-500 hover:text-blue-wardrobe-dark transition-colors">
                        🤔 Not helpful
                      </button>
                    </div>
                    <div className="text-xs text-gray-400">
                      Verified Purchase
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
