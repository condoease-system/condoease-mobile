'use client'

import { useEffect } from 'react'
import { Logo } from './Logo'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2200)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1a2847 0%, #243660 60%, #2d4a8a 100%)' }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
        style={{ background: '#FF8A1C', transform: 'translate(40%, -40%)' }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
        style={{ background: '#243B6B', transform: 'translate(-40%, 40%)' }} />

      {/* Logo */}
      <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-700">
        <Logo size="lg" variant="icon" />
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl font-bold text-white tracking-tight">
            Condo<span style={{ color: '#FF8A1C' }}>Ease</span>
          </span>
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Tenant Portal
          </span>
        </div>
      </div>

      {/* Tagline */}
      <p className="mt-8 text-center text-sm font-medium animate-in fade-in duration-1000 delay-500"
        style={{ color: 'rgba(255,255,255,0.5)' }}>
        Your home, simplified.
      </p>

      {/* Loading dots */}
      <div className="absolute bottom-16 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full animate-pulse"
            style={{
              backgroundColor: '#FF8A1C',
              opacity: 0.7,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
