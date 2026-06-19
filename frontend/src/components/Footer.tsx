import React from 'react'
import { Link } from 'react-router-dom'
import { SiPinterest, SiTiktok, SiWhatsapp, SiYoutube } from 'react-icons/si'

type SocialBrand = 'pinterest' | 'tiktok' | 'whatsapp' | 'youtube'

const SOCIAL_BRAND_STYLES: Record<SocialBrand, { icon: string; hover: string }> = {
  pinterest: { icon: '#ffffff', hover: 'hover:bg-[#E60023]/90 hover:border-[#E60023]/50' },
  tiktok: { icon: '#ffffff', hover: 'hover:bg-black/80 hover:border-white/40' },
  whatsapp: { icon: '#ffffff', hover: 'hover:bg-[#25D366]/90 hover:border-[#25D366]/50' },
  youtube: { icon: '#ffffff', hover: 'hover:bg-[#FF0000]/90 hover:border-[#FF0000]/50' },
}

function SocialIcon({ brand }: { brand: SocialBrand }) {
  const className = 'h-[18px] w-[18px] sm:h-5 sm:w-5'

  switch (brand) {
    case 'pinterest':
      return <SiPinterest className={className} aria-hidden />
    case 'tiktok':
      return <SiTiktok className={className} aria-hidden />
    case 'whatsapp':
      return <SiWhatsapp className={className} aria-hidden />
    case 'youtube':
      return <SiYoutube className={className} aria-hidden />
    default:
      return null
  }
}

const footerLinkClass =
  'inline-block text-[15px] font-medium text-white/95 transition-all duration-200 hover:text-white hover:translate-x-0.5 hover:underline underline-offset-4 decoration-white/60'

const footerHeadingClass =
  'mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white'

export default function Footer() {
  const socialLinks: { name: string; brand: SocialBrand; url: string }[] = [
    { name: 'Pinterest', brand: 'pinterest', url: 'https://pin.it/3vBSzyDxM' },
    { name: 'TikTok', brand: 'tiktok', url: 'https://www.tiktok.com/@thebluewardrobe_ng?_r=1&_t=ZS-94f2kufoyEy' },
    { name: 'WhatsApp', brand: 'whatsapp', url: 'https://wa.me/message/IGIYXO342VMUH1' },
    { name: 'YouTube', brand: 'youtube', url: 'https://youtube.com/@thebluewardrobe?si=JxL5fTvSt1_JotHs' },
  ]

  return (
    <footer className="mt-20 bg-gradient-to-br from-blue-wardrobe-dark via-blue-wardrobe-light to-blue-wardrobe-dark text-white">
      <div className="container mx-auto px-4 py-12 sm:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="mb-4 font-serif text-2xl font-semibold text-white sm:text-3xl">
              THE BLUE WARDROBE
            </h3>
            <p className="mb-6 max-w-md text-[15px] leading-relaxed text-white/90 sm:text-base">
              Curating rare fabrics from around the world, transformed into timeless luxury designs.
              Each piece in The Dress Diaries Collection tells a story of craftsmanship and global elegance.
            </p>

            {/* Address */}
            <div className="mb-8">
              <h4 className={footerHeadingClass}>Visit Our Studio</h4>
              <address className="text-[15px] not-italic leading-relaxed text-white/90 sm:text-base">
                Shop 20, 445 Plaza
                <br />
                Nnebisi Road
                <br />
                Asaba, Delta State
                <br />
                Nigeria
              </address>
            </div>

            {/* Social Media Links */}
            <div>
              <h4 className={footerHeadingClass}>Connect With Us</h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => {
                  const brandStyle = SOCIAL_BRAND_STYLES[social.brand]
                  return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-white/12 text-white shadow-lg shadow-black/15 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-wardrobe-dark ${brandStyle.hover}`}
                    aria-label={`Follow us on ${social.name}`}
                    title={social.name}
                    style={{ color: brandStyle.icon }}
                  >
                    <span className="transition-transform duration-300 group-hover:scale-110">
                      <SocialIcon brand={social.brand} />
                    </span>
                  </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={footerHeadingClass}>Explore</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className={footerLinkClass}>
                  About the Brand
                </Link>
              </li>
              <li>
                <Link to="/blog" className={footerLinkClass}>
                  Journal
                </Link>
              </li>
              <li>
                <Link to="/collections" className={footerLinkClass}>
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/contact" className={footerLinkClass}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className={footerHeadingClass}>Information</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/shipping-returns" className={footerLinkClass}>
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={footerLinkClass}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className={footerLinkClass}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/25 pt-8 md:flex-row">
          <p className="text-sm text-white/85">
            © {new Date().getFullYear()} THE BLUE WARDROBE. All rights reserved.
          </p>
          <p className="text-sm text-white/85">
            Crafted with elegance. Delivered globally.
          </p>
        </div>
      </div>
    </footer>
  )
}
