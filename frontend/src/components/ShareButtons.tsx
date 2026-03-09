import React, { useState } from 'react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaLink, FaThreads, FaWhatsapp, FaXTwitter } from 'react-icons/fa6'

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const [message, setMessage] = useState('')

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const openShare = async (platform: string) => {
    const shareUrls: Record<string, string | null> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      threads: null,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      copy: null,
      instagram: null,
    }

    if (platform === 'copy' || platform === 'instagram' || platform === 'threads') {
      try {
        await navigator.clipboard.writeText(url)
        if (platform === 'instagram') {
          setMessage('Link copied. Paste it into Instagram to share.')
        } else if (platform === 'threads') {
          setMessage('Link copied. Paste it into Threads to share.')
        } else {
          setMessage('Link copied to clipboard.')
        }
      } catch {
        setMessage('Unable to copy the link automatically.')
      }
      if (platform === 'instagram') {
        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
      }
      if (platform === 'threads') {
        window.open('https://www.threads.net/', '_blank', 'noopener,noreferrer')
      }
      return
    }

    const target = shareUrls[platform]
    if (target) {
      window.open(target, '_blank', 'noopener,noreferrer,width=640,height=720')
      setMessage(`Opened ${platform} share.`)
    }
  }

  const actions = [
    { id: 'facebook', label: 'Facebook', icon: FaFacebookF },
    { id: 'twitter', label: 'X', icon: FaXTwitter },
    { id: 'threads', label: 'Threads', icon: FaThreads },
    { id: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp },
    { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedinIn },
    { id: 'instagram', label: 'Instagram', icon: FaInstagram },
    { id: 'copy', label: 'Copy Link', icon: FaLink },
  ]

  return (
    <div className="rounded-2xl border border-blue-wardrobe-light/10 bg-white p-5 luxury-shadow">
      <div className="flex flex-wrap items-center gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => void openShare(action.id)}
              className="inline-flex items-center gap-2 rounded-full border border-blue-wardrobe-light/20 px-4 py-2 text-sm font-medium text-blue-wardrobe-dark transition-colors hover:bg-blue-wardrobe-light hover:text-white"
            >
              <Icon />
              {action.label}
            </button>
          )
        })}
      </div>
      {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
    </div>
  )
}
