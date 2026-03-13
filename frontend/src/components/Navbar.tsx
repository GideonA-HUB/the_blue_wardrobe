import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../store/cart'
import LogoSpinner from './LogoSpinner'
import api from '../lib/api'

export default function Navbar() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const localItems = useCart((s) => s.items)

  // Calculate cart count from local items
  useEffect(() => {
    const count = localItems.reduce((sum, item) => sum + item.qty, 0)
    console.log('Navbar: localItems:', localItems)
    console.log('Navbar: calculated count:', count)
    setCartCount(count)
  }, [localItems])

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

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/about" 
            className="text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-wardrobe-light after:transition-all hover:after:w-full"
          >
            About
          </Link>
          <Link 
            to="/blog" 
            className="text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-wardrobe-light after:transition-all hover:after:w-full"
          >
            Journal
          </Link>
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
            className="text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-wardrobe-light after:transition-all hover:after:w-full flex items-center gap-2"
          >
            Wardrobe
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link 
              to="/about" 
              className="block text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/blog" 
              className="block text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Journal
            </Link>
            <Link 
              to="/collections" 
              className="block text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Collections
            </Link>
            <Link 
              to="/contact" 
              className="block text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link 
              to="/cart" 
              className="flex items-center gap-2 text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Wardrobe
              {cartCount > 0 && (
                <span className="bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
