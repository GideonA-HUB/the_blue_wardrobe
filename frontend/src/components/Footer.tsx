import React from 'react'
import { Link } from 'react-router-dom'

type SocialBrand = 'instagram' | 'facebook' | 'twitter' | 'pinterest' | 'youtube'

function SocialIcon({ brand }: { brand: SocialBrand }) {
  const common = 'w-5 h-5'

  switch (brand) {
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <linearGradient id="ig-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fdc468" />
            <stop offset="50%" stopColor="#df4996" />
            <stop offset="100%" stopColor="#4f5bd5" />
          </linearGradient>
          <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#ig-gradient)" />
          <circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="1.6" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="#fff" />
        </svg>
      )
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#1877F2" />
          <path
            d="M13.2 18.5v-4h1.7l.3-2.6h-2V10c0-.8.2-1.3 1.3-1.3h.9V6.3c-.4-.1-1.1-.2-1.9-.2-1.9 0-3.3 1.2-3.3 3.4v2h-2v2.6h2v4h2z"
            fill="#fff"
          />
        </svg>
      )
    case 'twitter':
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#1DA1F2" />
          <path
            d="M17.8 9.1c.5-.3.9-.8 1.1-1.3-.5.3-1 .4-1.6.5-.5-.5-1.2-.8-1.9-.8-1.5 0-2.7 1.3-2.7 2.8 0 .2 0 .5.1.7-2.2-.1-4.1-1.2-5.4-2.9-.2.4-.3.8-.3 1.3 0 .9.4 1.7 1.2 2.2-.4 0-.7-.1-1-.3 0 1.3.9 2.4 2.1 2.6-.2.1-.5.1-.8.1-.2 0-.4 0-.6-.1.4 1.1 1.5 1.9 2.7 1.9-1.1.9-2.5 1.4-4 1.4-.3 0-.5 0-.8-.1 1.4.9 3 1.4 4.7 1.4 5.7 0 8.8-4.9 8.8-9.1v-.3c.6-.4 1.1-.9 1.5-1.5-.6.3-1.2.5-1.8.6z"
            fill="#fff"
          />
        </svg>
      )
    case 'pinterest':
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#E60023" />
          <path
            d="M12 6.3c-3 0-4.5 2.1-4.5 4.3 0 1.1.6 2.4 1.6 2.8.2.1.2 0 .3-.1.1-.2.4-1 .4-1.1 0-.1 0-.2-.1-.3-.3-.4-.5-1-.5-1.5 0-1.4 1.1-2.7 2.8-2.7 1.5 0 2.5 1 2.5 2.4 0 1.7-.9 2.9-2 2.9-.6 0-1.1-.5-.9-1.1.2-.7.4-1.4.4-1.9 0-.4-.2-.7-.7-.7-.6 0-1 0-1.3 1-.2.7-.4 1.5-.4 2.1 0 .9.6 1.6 1.8 1.6 1.4 0 2.6-.9 3.1-2.6.2-.6.3-1.2.3-1.8 0-2-1.5-3.8-3.9-3.8z"
            fill="#fff"
          />
        </svg>
      )
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <rect x="3" y="6" width="18" height="12" rx="3" fill="#FF0000" />
          <path d="M11 10v4l3.5-2z" fill="#fff" />
        </svg>
      )
    default:
      return null
  }
}

export default function Footer() {
  const socialLinks: { name: string; brand: SocialBrand; url: string }[] = [
    { name: 'Instagram', brand: 'instagram', url: 'https://instagram.com/thebluewardrobe' },
    { name: 'Facebook', brand: 'facebook', url: 'https://facebook.com/thebluewardrobe' },
    { name: 'Twitter', brand: 'twitter', url: 'https://twitter.com/thebluewardrobe' },
    { name: 'Pinterest', brand: 'pinterest', url: 'https://pinterest.com/thebluewardrobe' },
    { name: 'YouTube', brand: 'youtube', url: 'https://youtube.com/@thebluewardrobe' },
  ]

  return (
    <footer className="bg-blue-wardrobe-dark text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-serif text-2xl font-semibold mb-4">THE BLUE WARDROBE</h3>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md mb-6">
              Curating rare fabrics from around the world, transformed into timeless luxury designs.
              Each piece in The Dress Diaries Collection tells a story of craftsmanship and global elegance.
            </p>
            
            {/* Social Media Links */}
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Connect With Us</h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                    aria-label={social.name}
                    title={social.name}
                  >
                    <SocialIcon brand={social.brand} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/collections" className="hover:text-white transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Information</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} THE BLUE WARDROBE. All rights reserved.
          </p>
          <p className="text-gray-400 text-xs mt-2 md:mt-0">
            Crafted with elegance. Delivered globally.
          </p>
        </div>
      </div>
    </footer>
  )
}

