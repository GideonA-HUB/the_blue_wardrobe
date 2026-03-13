import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useCart } from '../store/cart'

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
  created_at: string
  updated_at: string
}

type DesignImage = {
  id: number
  image: string
  image_url: string
  alt_text: string
  order: number
  created_at: string
}

type SizeInventory = {
  id: number
  size: number
  stock: number
  is_active: boolean
  availability_status: 'available' | 'low_stock' | 'out_of_stock' | 'unavailable'
  is_in_stock: boolean
}

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [design, setDesign] = useState<Design | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingToWardrobe, setAddingToWardrobe] = useState(false)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const { add, items } = useCart()

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get(`/designs/${id}/`).then((r) => {
      setDesign(r.data)
      document.title = `${r.data.title} — THE BLUE WARDROBE`
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [id])

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
              Select sizes (choose multiple)
            </label>
            <div className="grid grid-cols-4 gap-2 max-w-xs">
              {design.size_inventory
                .filter(inv => inv.is_active)
                .map((inv) => {
                  const isSelected = selectedSizes.includes(inv.size.toString())
                  const isOutOfStock = inv.stock === 0
                  
                  return (
                    <button
                      key={inv.id}
                      onClick={() => {
                        if (!isOutOfStock) {
                          if (isSelected) {
                            setSelectedSizes(selectedSizes.filter(s => s !== inv.size.toString()))
                          } else {
                            setSelectedSizes([...selectedSizes, inv.size.toString()])
                          }
                        }
                      }}
                      disabled={isOutOfStock}
                      className={`
                        relative py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200
                        ${isSelected 
                          ? 'border-blue-wardrobe-dark bg-blue-wardrobe-dark text-white' 
                          : isOutOfStock
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                          : 'border-gray-300 text-gray-700 hover:border-blue-wardrobe-light hover:bg-blue-50'
                        }
                      `}
                    >
                      {inv.size}
                      {isOutOfStock && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                      {inv.availability_status === 'low_stock' && inv.stock > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
                      )}
                    </button>
                  )
                })}
            </div>
            {selectedSizes.length > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                <span className="text-emerald-600 font-medium">
                  ✓ Selected sizes: {selectedSizes.join(', ')}
                </span>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <button
              className="w-full max-w-xs px-8 py-4 bg-blue-wardrobe-dark text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed tracking-wide hover:bg-blue-wardrobe-light transition-all duration-300 font-medium luxury-shadow hover:luxury-shadow-lg transform hover:scale-105 disabled:transform-none"
              disabled={selectedSizes.length === 0 || addingToWardrobe}
              onClick={async () => {
                if (!design || selectedSizes.length === 0) return
                
                setAddingToWardrobe(true)
                try {
                  console.log('Adding to wardrobe:', { designId: design.id, selectedSizes })
                  
                  // Add each selected size to cart
                  for (const size of selectedSizes) {
                    console.log('Adding item:', { design_id: design.id, size, quantity: 1 })
                    
                    const response = await api.post('/cart/add/', {
                      design_id: design.id,
                      size: parseInt(size),
                      quantity: 1
                    })
                    
                    console.log('API response:', response.data)
                    
                    // Update local cart state
                    add({
                      id: design.id,
                      title: design.title,
                      price: design.effective_price,
                      size: parseInt(size),
                      qty: 1,
                      image: design.images?.[0]?.image_url,
                    })
                    
                    console.log('Current cart items:', items)
                  }
                  
                  // Clear selected sizes after adding
                  setSelectedSizes([])
                  
                  // Show success feedback
                  alert(`Added ${selectedSizes.length} item(s) to your wardrobe!`)
                } catch (error: any) {
                  console.error('Error adding to wardrobe:', error)
                  console.error('Error response:', error.response?.data)
                  console.error('Error status:', error.response?.status)
                  alert(`Failed to add to wardrobe: ${error.response?.data?.detail || error.message || 'Please try again.'}`)
                } finally {
                  setAddingToWardrobe(false)
                }
              }}
            >
              {addingToWardrobe ? 'Adding...' : `Add to Wardrobe${selectedSizes.length > 1 ? ` (${selectedSizes.length} items)` : ''}`}
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
    </div>
  )
}
