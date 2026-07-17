import React, { useMemo, useState } from 'react'
import {
  FaFacebookF,
  FaInstagram,
  FaLink,
  FaLinkedinIn,
  FaPinterestP,
  FaShareNodes,
  FaThreads,
  FaWhatsapp,
  FaXTwitter,
} from 'react-icons/fa6'

type ShareButtonsProps = {
  title: string
  url: string
  description?: string
  imageUrl?: string | null
  /** Compact product-page layout with a primary Share toggle */
  variant?: 'default' | 'product'
}

export default function ShareButtons({
  title,
  url,
  description = '',
  imageUrl,
  variant = 'default',
}: ShareButtonsProps) {
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState(variant !== 'product')

  const shareText = useMemo(() => {
    const cleanDescription = description.replace(/\s+/g, ' ').trim()
    const shortDescription =
      cleanDescription.length > 180 ? `${cleanDescription.slice(0, 177)}...` : cleanDescription
    return [title, shortDescription, url].filter(Boolean).join('\n\n')
  }, [title, description, url])

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedText = encodeURIComponent(shareText)
  const encodedImage = imageUrl ? encodeURIComponent(imageUrl) : ''

  const showFeedback = (text: string) => {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 3200)
  }

  const copyLink = async (feedback: string) => {
    try {
      await navigator.clipboard.writeText(url)
      showFeedback(feedback)
    } catch {
      showFeedback('Unable to copy the link automatically. Please copy it from the address bar.')
    }
  }

  const openShare = async (platform: string) => {
    const shareUrls: Record<string, string | null> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      threads: `https://www.threads.net/intent/post?text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}${
        encodedImage ? `&media=${encodedImage}` : ''
      }`,
      copy: null,
      instagram: null,
      native: null,
    }

    if (platform === 'native' && typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url,
        })
        showFeedback('Shared successfully.')
      } catch {
        // User cancelled or share failed — stay quiet.
      }
      return
    }

    if (platform === 'copy') {
      await copyLink('Link copied. Paste it anywhere to share this look.')
      return
    }

    if (platform === 'instagram') {
      await copyLink('Link copied. Paste it into Instagram to share.')
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
      return
    }

    if (platform === 'threads') {
      const target = shareUrls.threads
      if (target) {
        window.open(target, '_blank', 'noopener,noreferrer,width=640,height=720')
        showFeedback('Opened Threads share.')
      }
      return
    }

    const target = shareUrls[platform]
    if (target) {
      window.open(target, '_blank', 'noopener,noreferrer,width=640,height=720')
      showFeedback(`Opened ${platform} share.`)
    }
  }

  const actions = [
    ...(typeof navigator !== 'undefined' && typeof navigator.share === 'function'
      ? [{ id: 'native', label: 'Share', icon: FaShareNodes }]
      : []),
    { id: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp },
    { id: 'facebook', label: 'Facebook', icon: FaFacebookF },
    { id: 'twitter', label: 'X', icon: FaXTwitter },
    { id: 'pinterest', label: 'Pinterest', icon: FaPinterestP },
    { id: 'threads', label: 'Threads', icon: FaThreads },
    { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedinIn },
    { id: 'instagram', label: 'Instagram', icon: FaInstagram },
    { id: 'copy', label: 'Copy Link', icon: FaLink },
  ]

  const panel = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => void openShare(action.id)}
              aria-label={`Share on ${action.label}`}
              className="inline-flex items-center gap-2 rounded-full border border-blue-wardrobe-light/25 bg-white/80 px-3.5 py-2 text-xs font-medium tracking-wide text-blue-wardrobe-dark transition-all duration-300 hover:border-blue-wardrobe-light hover:bg-blue-wardrobe-dark hover:text-white dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-blue-luxury-400 dark:hover:bg-blue-luxury-500 sm:px-4 sm:text-sm"
            >
              <Icon className="text-sm sm:text-base" />
              <span>{action.label}</span>
            </button>
          )
        })}
      </div>
      {message && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
          {message}
        </p>
      )}
    </div>
  )

  if (variant === 'product') {
    return (
      <div className="mt-6 max-w-xs sm:max-w-md">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-blue-wardrobe-light/40 bg-transparent px-6 py-3 text-sm font-medium tracking-[0.12em] uppercase text-blue-wardrobe-dark transition-all duration-300 hover:border-blue-wardrobe-dark hover:bg-blue-wardrobe-dark hover:text-white dark:border-slate-500 dark:text-slate-100 dark:hover:border-blue-luxury-400 dark:hover:bg-blue-luxury-500"
        >
          <FaShareNodes className="text-base" />
          {open ? 'Hide share options' : 'Share this look'}
        </button>
        {open && (
          <div className="mt-4 rounded-2xl border border-blue-wardrobe-light/15 bg-white/70 p-4 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/60">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-slate-400">
              Share with friends
            </p>
            {panel}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-blue-wardrobe-light/10 bg-white p-5 luxury-shadow dark:border-slate-700 dark:bg-slate-900/70">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-blue-wardrobe-light">
        Share
      </p>
      {panel}
    </div>
  )
}
