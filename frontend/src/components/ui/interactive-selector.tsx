import React, { useEffect, useState } from 'react'
import { Award, Gem, Scissors, Shirt, Sparkles, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AtelierSlide = {
  id: number
  title: string
  description: string
  image_url: string | null
  icon_key: string
  sort_order: number
}

const ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  scissors: Scissors,
  shirt: Shirt,
  gem: Gem,
  award: Award,
}

function SlideIcon({ iconKey }: { iconKey: string }) {
  const Ic = ICON_MAP[iconKey] ?? Sparkles
  return <Ic className="text-white" size={22} strokeWidth={1.75} aria-hidden />
}

export type InteractiveSelectorProps = {
  slides: AtelierSlide[]
  introTitle?: string
  introSubtitle?: string
  className?: string
}

/**
 * Horizontal accordion gallery for “The Atelier” — brand colours (blue-wardrobe / footer tone).
 * Mobile: large active preview + thumbnail strip; desktop: flex accordion.
 */
export default function InteractiveSelector({
  slides,
  introTitle = 'Stories from the atelier',
  introSubtitle = 'Craftsmanship, rare fabrics, and timeless design — tap or click a story to explore.',
  className,
}: InteractiveSelectorProps) {
  const validSlides = slides.filter((s) => s.image_url)
  const [activeIndex, setActiveIndex] = useState(0)
  const [animated, setAnimated] = useState<number[]>([])

  useEffect(() => {
    if (validSlides.length === 0) return
    setActiveIndex(0)
  }, [validSlides.length])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    validSlides.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setAnimated((prev) => (prev.includes(i) ? prev : [...prev, i]))
        }, 160 * i)
      )
    })
    return () => timers.forEach(clearTimeout)
  }, [validSlides.length])

  if (validSlides.length === 0) return null

  const active = validSlides[Math.min(activeIndex, validSlides.length - 1)]

  return (
    <div
      className={cn(
        'relative w-full rounded-2xl border border-blue-wardrobe-dark/20 bg-gradient-to-br from-blue-wardrobe-dark via-[#1a2744] to-blue-wardrobe-dark text-white shadow-xl overflow-hidden',
        className
      )}
    >
      <div className="px-4 pt-8 pb-4 md:px-8 md:pt-10 md:pb-6 text-center max-w-3xl mx-auto">
        <h3 className="text-2xl md:text-3xl font-serif font-semibold text-white mb-2 animate-tbw-fade-in-top tbw-delay-300">
          {introTitle}
        </h3>
        <p className="text-sm md:text-base text-blue-100/90 font-medium max-w-2xl mx-auto animate-tbw-fade-in-top tbw-delay-600">
          {introSubtitle}
        </p>
      </div>

      {/* Mobile */}
      <div className="md:hidden px-3 pb-8">
        <div
          className="relative w-full min-h-[260px] max-h-[min(52vh,420px)] rounded-xl overflow-hidden border-2 border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
          style={{
            backgroundImage: active?.image_url ? `url('${active.image_url}')` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundColor: '#0f172a',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              boxShadow:
                'inset 0 -100px 80px -40px rgba(0,0,0,0.85), inset 0 -40px 40px -20px rgba(0,0,0,0.5)',
            }}
          />
          <div className="absolute left-0 right-0 bottom-0 p-4 flex items-end gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-black/45 backdrop-blur-md">
              <SlideIcon iconKey={active?.icon_key ?? 'sparkles'} />
            </div>
            <div className="min-w-0 pb-0.5">
              <div className="font-serif font-semibold text-lg text-white leading-tight">{active?.title}</div>
              <div className="text-sm text-blue-100/90 mt-0.5 line-clamp-2">{active?.description}</div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 snap-x snap-mandatory">
          {validSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative shrink-0 snap-center rounded-lg overflow-hidden border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/60',
                activeIndex === index
                  ? 'w-[72px] h-[96px] border-white ring-2 ring-white/40'
                  : 'w-14 h-[72px] border-white/20 opacity-80 hover:opacity-100'
              )}
              style={{
                backgroundImage: slide.image_url ? `url('${slide.image_url}')` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
              }}
              aria-label={slide.title}
            >
              <span className="sr-only">{slide.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop accordion */}
      <div className="hidden md:block px-4 lg:px-8 pb-10">
        <div className="flex w-full max-w-[920px] mx-auto min-h-[380px] lg:min-h-[420px] h-[min(42vh,440px)] items-stretch overflow-hidden relative rounded-lg">
          {validSlides.map((option, index) => (
            <button
              key={option.id}
              type="button"
              onClick={() => index !== activeIndex && setActiveIndex(index)}
              className={cn(
                'relative flex flex-col justify-end overflow-hidden transition-all duration-700 ease-in-out text-left',
                activeIndex === index ? 'z-10' : 'z-[1]'
              )}
              style={{
                backgroundImage: option.image_url ? `url('${option.image_url}')` : undefined,
                backgroundSize: activeIndex === index ? 'auto 100%' : 'auto 115%',
                backgroundPosition: 'center top',
                backfaceVisibility: 'hidden',
                opacity: animated.includes(index) ? 1 : 0,
                transform: animated.includes(index) ? 'translateX(0)' : 'translateX(-40px)',
                minWidth: '56px',
                minHeight: '120px',
                margin: 0,
                borderRadius: 4,
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: activeIndex === index ? 'rgba(255,255,255,0.95)' : 'rgba(30,58,138,0.5)',
                cursor: 'pointer',
                backgroundColor: '#0f172a',
                boxShadow:
                  activeIndex === index
                    ? '0 24px 60px rgba(0,0,0,0.45)'
                    : '0 10px 28px rgba(0,0,0,0.28)',
                flex: activeIndex === index ? '7 1 0%' : '1 1 0%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                willChange: 'flex-grow, box-shadow, background-size',
              }}
            >
              <div
                className="absolute left-0 right-0 pointer-events-none transition-all duration-700 ease-in-out"
                style={{
                  bottom: activeIndex === index ? '0' : '-36px',
                  height: '120px',
                  boxShadow:
                    activeIndex === index
                      ? 'inset 0 -120px 120px -120px #000, inset 0 -100px 80px -80px #000'
                      : 'inset 0 -120px 0 -120px #000, inset 0 -80px 0 -80px #000',
                }}
              />
              <div className="label absolute left-0 right-0 bottom-5 flex items-center justify-start min-h-[52px] z-[2] pointer-events-none px-3 lg:px-4 gap-3 w-full">
                <div className="icon min-w-[44px] max-w-[44px] h-[44px] flex items-center justify-center rounded-full bg-black/55 backdrop-blur-md shadow-md border-2 border-white/25 flex-shrink-0">
                  <SlideIcon iconKey={option.icon_key} />
                </div>
                <div className="info text-white min-w-0 relative">
                  <div
                    className="main font-serif font-semibold text-base lg:text-lg transition-all duration-700 ease-in-out"
                    style={{
                      opacity: activeIndex === index ? 1 : 0,
                      transform: activeIndex === index ? 'translateX(0)' : 'translateX(18px)',
                    }}
                  >
                    {option.title}
                  </div>
                  <div
                    className="sub text-sm text-blue-100/90 transition-all duration-700 ease-in-out line-clamp-2"
                    style={{
                      opacity: activeIndex === index ? 1 : 0,
                      transform: activeIndex === index ? 'translateX(0)' : 'translateX(18px)',
                    }}
                  >
                    {option.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
