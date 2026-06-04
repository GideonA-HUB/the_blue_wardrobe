import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../store/cart'
import LogoSpinner from './LogoSpinner'
import ThemeToggle from './ThemeToggle'
import api from '../lib/api'
import { usePayCurrency, type PayCurrency } from '../store/checkoutCurrency'

export default function Navbar() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const localItems = useCart((s) => s.items)
  const { payCurrency, setPayCurrency } = usePayCurrency()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    <nav className={`sticky top-0 z-50 border-b border-gray-200 bg-white luxury-shadow transition-all duration-300 dark:border-slate-700 dark:bg-[var(--tbw-surface)] ${
      isScrolled ? 'py-2 shadow-lg' : 'py-4'
    }`}>
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group nav-transition">
          <LogoSpinner src={logoUrl} />
          <span className="font-serif text-xl font-semibold text-blue-wardrobe-dark transition-colors group-hover:text-blue-wardrobe-light dark:text-slate-100 dark:group-hover:text-blue-luxury-300">
            THE BLUE WARDROBE
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/about" 
            className="text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-wardrobe-light after:transition-all hover:after:w-full nav-transition"
          >
            About
          </Link>
          <Link 
            to="/blog" 
            className="text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-wardrobe-light after:transition-all hover:after:w-full nav-transition"
          >
            Journal
          </Link>
          <Link 
            to="/collections" 
            className="text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-wardrobe-light after:transition-all hover:after:w-full nav-transition"
          >
            Collections
          </Link>
          <Link 
            to="/designs" 
            className="text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-wardrobe-light after:transition-all hover:after:w-full nav-transition"
          >
            All Designs
          </Link>
          <Link 
            to="/contact" 
            className="text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-wardrobe-light after:transition-all hover:after:w-full nav-transition"
          >
            Contact
          </Link>
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <label htmlFor="nav-pay-currency" className="sr-only">
              Checkout currency
            </label>
            <select
              id="nav-pay-currency"
              value={payCurrency}
              onChange={(e) => setPayCurrency(e.target.value as PayCurrency)}
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-blue-wardrobe-dark dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              title="Currency for Flutterwave checkout"
            >
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <Link 
            to="/cart" 
            className="text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-wardrobe-light after:transition-all hover:after:w-full flex items-center gap-2 nav-transition hover-lift"
          >
            Wardrobe
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-scale-in">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="rounded-lg p-2 transition-all duration-300 hover:bg-gray-100 hover-scale dark:hover:bg-slate-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
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
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ${
        isMobileMenuOpen ? 'max-h-96 opacity-100 mobile-menu-enter' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="border-t border-gray-200 bg-white dark:border-slate-700 dark:bg-[var(--tbw-surface)]">
          <div className="container mx-auto space-y-4 px-4 py-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-slate-700">
              <span className="text-sm font-medium text-gray-600 dark:text-slate-400">Appearance</span>
              <ThemeToggle showLabel />
            </div>
            <Link 
              to="/about" 
              className="block text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors py-2 nav-transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/blog" 
              className="block text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors py-2 nav-transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Journal
            </Link>
            <Link 
              to="/collections" 
              className="block text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors py-2 nav-transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Collections
            </Link>
            <Link 
              to="/designs" 
              className="block text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors py-2 nav-transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              All Designs
            </Link>
            <Link 
              to="/contact" 
              className="block text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors py-2 nav-transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="flex items-center gap-2 py-2">
              <span className="text-sm text-gray-600 dark:text-slate-400">Pay in</span>
              <select
                value={payCurrency}
                onChange={(e) => setPayCurrency(e.target.value as PayCurrency)}
                className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <Link 
              to="/cart" 
              className="flex items-center gap-2 text-blue-wardrobe-dark hover:text-blue-wardrobe-light font-medium transition-colors py-2 nav-transition"
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
      </div>
    </nav>
  )
}
