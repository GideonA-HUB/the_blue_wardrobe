import React from 'react'
import { Link } from 'react-router-dom'

type SocialBrand = 'instagram' | 'facebook' | 'tiktok' | 'whatsapp' | 'youtube'

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
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#000000" />
          <path
            d="M12 2.5c.6 0 1 .4 1 1v10.2c0 .6-.4 1-1 1s-1-.4-1-1V3.5c0-.6.4-1 1-1z"
            fill="#fff"
          />
          <path
            d="M16 5.5c.6 0 1 .4 1 1v5.2c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5c.6 0 1 .4 1 1s-.4 1-1 1c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3V6.5c0-.6.4-1 1-1z"
            fill="#fff"
          />
          <circle cx="16" cy="8" r="1.5" fill="#FF0050" />
        </svg>
      )
    case 'whatsapp':
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#25D366" />
          <path
            d="M12 2C6.5 2 2 6.5 2 12c0 2 .6 3.8 1.6 5.3L2 22l4.8-1.6C8.3 21.4 10.1 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.7 0-3.3-.5-4.6-1.4l-.3-.2-3.1 1 1-3-.2-.3C4.5 14.8 4 13.2 4 11.5 4 7.4 7.4 4 11.5 4S19 7.4 19 11.5 15.6 19 11.5 19H12zm3.5-6.5c-.2 0-.5-.1-.8-.2-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.4-.8 1-.9 1.2-.2.2-.4.2-.7.1-.3-.1-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.4.1-.1.2-.3.3-.4.1-.1.1-.3 0-.4-.1-.1-.4-1-.6-1.4-.2-.4-.3-.4-.5-.4h-.5c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 1.9 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4z"
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
    { name: 'Instagram', brand: 'instagram', url: 'https://www.instagram.com/thebluewardrobe.ng?igsh=NGd6dDA3ajJ3b2x5&utm_source=qr' },
    { name: 'Facebook', brand: 'facebook', url: 'https://www.facebook.com/share/1GSdNX3xXC/?mibextid=wwXIfr' },
    { name: 'TikTok', brand: 'tiktok', url: 'https://www.tiktok.com/@thebluewardrobe_ng?_r=1&_t=ZS-94f2kufoyEy' },
    { name: 'WhatsApp', brand: 'whatsapp', url: 'https://wa.me/message/IGIYXO342VMUH1' },
    { name: 'YouTube', brand: 'youtube', url: 'https://youtube.com/@thebluewardrobe?si=JxL5fTvSt1_JotHs' },
  ]

  return (
    <footer className="mt-20 bg-gradient-to-br from-blue-wardrobe-dark via-blue-wardrobe-light to-blue-wardrobe-dark text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="mb-4 font-serif text-2xl font-semibold !text-white">THE BLUE WARDROBE</h3>
            <p className="mb-4 max-w-md text-sm leading-relaxed text-blue-50/95">
              Curating rare fabrics from around the world, transformed into timeless luxury designs.
              Each piece in The Dress Diaries Collection tells a story of craftsmanship and global elegance.
            </p>
            
            {/* Address */}
            <div className="mb-6">
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider !text-blue-50">Visit Our Studio</h4>
              <address className="text-sm text-blue-50/95 not-italic">
                Shop 20, 445 Plaza<br />
                Nnebisi Road<br />
                Asaba, Delta State<br />
                Nigeria
              </address>
            </div>
            
            {/* Social Media Links */}
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider !text-blue-50">Connect With Us</h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:bg-white/25"
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
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider !text-blue-50">Explore</h4>
            <ul className="space-y-2 text-sm text-blue-50/95">
              <li>
                <Link to="/about" className="transition-colors hover:text-white">
                  About the Brand
                </Link>
              </li>
              <li>
                <Link to="/blog" className="transition-colors hover:text-white">
                  Journal
                </Link>
              </li>
              <li>
                <Link to="/collections" className="transition-colors hover:text-white">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider !text-blue-50">Information</h4>
            <ul className="space-y-2 text-sm text-blue-50/95">
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-white/15 pt-8 md:flex-row">
          <p className="text-xs text-blue-100/80">
            © {new Date().getFullYear()} THE BLUE WARDROBE. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-blue-100/80 md:mt-0">
            Crafted with elegance. Delivered globally.
          </p>
        </div>
      </div>
    </footer>
  )
}

