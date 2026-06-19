import React from 'react'

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[15px] leading-7 text-gray-700 dark:text-slate-300 last:mb-0">
      {children}
    </p>
  )
}

export function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mb-4 list-none space-y-2.5 pl-0 last:mb-0">
      {children}
    </ul>
  )
}

export function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-[15px] leading-7 text-gray-700 dark:text-slate-300">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-wardrobe-light dark:bg-blue-luxury-400" />
      <span>{children}</span>
    </li>
  )
}

export function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-blue-wardrobe-dark dark:text-slate-100">{children}</strong>
}

export function EmailLink() {
  return (
    <a
      href="mailto:tbw.outfits@gmail.com"
      className="font-medium text-blue-wardrobe-dark underline decoration-blue-wardrobe-light/40 underline-offset-2 hover:text-blue-wardrobe-light dark:text-blue-luxury-300"
    >
      tbw.outfits@gmail.com
    </a>
  )
}

export function WhatsAppLink() {
  return (
    <a
      href="https://wa.me/2348163931106"
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-blue-wardrobe-dark underline decoration-blue-wardrobe-light/40 underline-offset-2 hover:text-blue-wardrobe-light dark:text-blue-luxury-300"
    >
      +234 816 393 1106
    </a>
  )
}
