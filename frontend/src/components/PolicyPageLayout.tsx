import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export type PolicySection = {
  id: string
  title: string
  content: React.ReactNode
}

type PolicyPageLayoutProps = {
  title: string
  subtitle: string
  lastUpdated: string
  sections: PolicySection[]
  documentTitle: string
}

export default function PolicyPageLayout({
  title,
  subtitle,
  lastUpdated,
  sections,
  documentTitle,
}: PolicyPageLayoutProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    document.title = documentTitle
  }, [documentTitle])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5] }
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sections])

  return (
    <div className="mx-auto max-w-6xl pb-16">
      {/* Hero */}
      <section className="relative mb-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-wardrobe-dark via-blue-wardrobe-light to-blue-wardrobe-dark px-6 py-12 text-white shadow-xl sm:px-10 sm:py-14 md:mb-14">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-blue-luxury-300/20 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-100">
            THE BLUE WARDROBE
          </p>
          <h1 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-blue-50/95 sm:text-lg">
            {subtitle}
          </p>
          <p className="mt-6 text-sm text-blue-100/90">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px,1fr]">
        {/* Table of contents — desktop */}
        <aside className="hidden lg:block">
          <nav
            className="sticky top-28 rounded-2xl border border-blue-wardrobe-light/10 bg-white p-5 luxury-shadow dark:border-slate-700 dark:bg-slate-900"
            aria-label="On this page"
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-wardrobe-dark dark:text-blue-luxury-200">
              On this page
            </p>
            <ul className="space-y-1">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      activeId === section.id
                        ? 'bg-blue-wardrobe-dark font-medium text-white dark:bg-blue-luxury-600'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-wardrobe-dark dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <span className="mr-2 text-xs opacity-60">{index + 1}.</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-gray-100 pt-5 dark:border-slate-700">
              <Link
                to="/contact"
                className="text-sm font-medium text-blue-wardrobe-dark transition-colors hover:text-blue-wardrobe-light dark:text-blue-luxury-300 dark:hover:text-blue-luxury-200"
              >
                Questions? Contact us →
              </Link>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <article className="min-w-0 space-y-6">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 rounded-2xl border border-blue-wardrobe-light/10 bg-white p-6 luxury-shadow transition-shadow hover:luxury-shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:p-8"
            >
              <div className="mb-5 flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-wardrobe-dark to-blue-wardrobe-light text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h2 className="pt-1 font-serif text-xl font-semibold text-blue-wardrobe-dark dark:text-blue-luxury-200 sm:text-2xl">
                  {section.title}
                </h2>
              </div>
              <div className="policy-prose pl-0 sm:pl-[52px]">{section.content}</div>
            </section>
          ))}

          {/* Contact card */}
          <div className="rounded-2xl border border-blue-wardrobe-light/20 bg-gradient-to-br from-blue-50 to-white p-6 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800 sm:p-8">
            <h3 className="font-serif text-xl font-semibold text-blue-wardrobe-dark dark:text-blue-luxury-200">
              Need help?
            </h3>
            <p className="mt-2 text-gray-600 dark:text-slate-300">
              Our atelier team is here to assist with orders, sizing, delivery, and policy questions.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <a
                href="mailto:tbw.outfits@gmail.com"
                className="font-medium text-blue-wardrobe-dark underline-offset-4 hover:underline dark:text-blue-luxury-300"
              >
                tbw.outfits@gmail.com
              </a>
              <a
                href="https://wa.me/2348163931106"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-wardrobe-dark underline-offset-4 hover:underline dark:text-blue-luxury-300"
              >
                WhatsApp: +234 816 393 1106
              </a>
              <Link
                to="/contact"
                className="font-medium text-blue-wardrobe-dark underline-offset-4 hover:underline dark:text-blue-luxury-300"
              >
                Contact form
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
