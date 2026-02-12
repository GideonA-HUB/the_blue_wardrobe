import React, { useEffect, useRef, useState } from 'react'

export default function ParallaxHero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset
      setScrollY(scrolled)
      
      if (heroRef.current) {
        const parallax = scrolled * 0.3
        heroRef.current.style.transform = `translateY(${parallax}px) scale(1.05)`
      }
      
      if (contentRef.current) {
        const contentParallax = scrolled * 0.15
        contentRef.current.style.transform = `translateY(${contentParallax}px)`
        const opacity = Math.max(0, 1 - scrolled / 500)
        contentRef.current.style.opacity = opacity.toString()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative h-[70vh] md:h-[85vh] overflow-hidden -mt-8">
      {/* Luxury gradient background with parallax */}
      <div 
        ref={heroRef}
        className="absolute inset-0 parallax"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #3b82f6 50%, #60a5fa 75%, #93c5fd 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 20s ease infinite',
          willChange: 'transform',
        }}
      />
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      
      {/* Animated floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 rounded-full bg-white/10 blur-xl"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              animation: `float ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
      `}</style>
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/95" />
      
      {/* Content with parallax */}
      <div 
        ref={contentRef}
        className="relative z-10 flex items-center justify-center h-full px-4"
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="text-center max-w-4xl animate-fade-in">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white drop-shadow-2xl mb-6 tracking-tight animate-scale-in">
            THE BLUE WARDROBE
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-white/95 font-light tracking-wide mb-4 animate-slide-left" style={{ animationDelay: '0.2s' }}>
            Rare fabrics. Timeless design.
          </p>
          <p className="text-base md:text-lg text-white/90 font-light animate-slide-right" style={{ animationDelay: '0.4s' }}>
            Global luxury.
          </p>
        </div>
      </div>
    </section>
  )
}
