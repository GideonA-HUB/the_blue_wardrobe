import { useState, useEffect } from 'react'

export function useLoading() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  return { loading, setLoading }
}

