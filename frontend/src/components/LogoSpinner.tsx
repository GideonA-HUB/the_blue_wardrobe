import React, { useEffect, useState } from 'react'

export default function LogoSpinner({ src }: { src?: string | null }) {
  const [spinning, setSpinning] = useState(true)

  useEffect(() => {
    const id = setTimeout(() => setSpinning(false), 1200)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className={`w-12 h-12 rounded-full overflow-hidden ${spinning ? 'animate-spin' : ''}`}>
      {src ? <img src={src} alt="logo" className="w-full h-full object-cover" /> : (
        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-900">TB</div>
      )}
    </div>
  )
}
