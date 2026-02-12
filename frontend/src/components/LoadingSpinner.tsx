import React from 'react'

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="relative w-24 h-24">
        {/* Outer ring - Blue */}
        <div className="absolute inset-0 border-4 border-blue-wardrobe-light/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-wardrobe-dark rounded-full animate-spin-slow"></div>
        
        {/* Inner ring - White with blue accent */}
        <div className="absolute inset-4 border-4 border-white/50 rounded-full"></div>
        <div className="absolute inset-4 border-4 border-transparent border-t-blue-wardrobe-light rounded-full animate-spin-reverse"></div>
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-blue-wardrobe-dark rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

