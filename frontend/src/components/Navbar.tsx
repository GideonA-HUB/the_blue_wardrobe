import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LogoSpinner from './LogoSpinner'
import api from '../lib/api'

export default function Navbar() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)

  useEffect(() => {
    api
      .get('/assets/')
      .then((r) => {
        const assets = r.data
        console.log('Loaded assets:', assets) // Debug log
        
        // Find logo_primary
        const primary = assets.find((a: any) => a.name === 'logo_primary')
        if (primary && primary.file) {
          console.log('Found logo_primary:', primary.file) // Debug log
          setLogoUrl(primary.file)
        } else {
          console.warn('logo_primary not found. Available assets:', assets.map((a: any) => a.name))
        }
        
        // Find favicon
        const favicon = assets.find((a: any) => a.name === 'favicon')
        if (favicon && favicon.file) {
          console.log('Found favicon:', favicon.file) // Debug log
          setFaviconUrl(favicon.file)
          
          // Update or create favicon link
          let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null
          if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
          }
          link.href = favicon.file
          
          // Also set apple-touch-icon and other favicon types
          const appleTouchIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null
          if (appleTouchIcon) {
            appleTouchIcon.href = favicon.file
          }
        } else {
          console.warn('favicon not found. Available assets:', assets.map((a: any) => a.name))
        }
      })
      .catch((err) => {
        console.error('Error loading assets:', err)
      })
  }, [])

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 luxury-shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <LogoSpinner src={logoUrl} />
          <span className="font-serif text-xl font-semibold text-blue-wardrobe-dark group-hover:text-blue-wardrobe-light transition-colors">
            THE BLUE WARDROBE
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/collections" 
            className="text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-wardrobe-light after:transition-all hover:after:w-full"
          >
            Collections
          </Link>
          <Link 
            to="/contact" 
            className="text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-wardrobe-light after:transition-all hover:after:w-full"
          >
            Contact
          </Link>
          <Link 
            to="/cart" 
            className="text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-wardrobe-light after:transition-all hover:after:w-full"
          >
            Cart
          </Link>
        </div>
      </div>
    </nav>
  )
}
