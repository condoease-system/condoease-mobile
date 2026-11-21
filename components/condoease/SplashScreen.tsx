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
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute right-0 top-0 h-48 w-48 translate-x-[40%] -translate-y-[40%] rounded-full bg-primary/5" />
      <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-[40%] translate-y-[40%] rounded-full bg-primary/5" />

      {/* Logo */}
      <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-700">
        <Logo size="lg" variant="icon" />
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl font-semibold tracking-tight text-primary">
            Condo<span className="text-accent">Ease</span>
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            Tenant Portal
          </span>
        </div>
      </div>

      {/* Tagline */}
      <p className="mt-8 text-center text-sm font-medium text-muted-foreground/80 animate-in fade-in duration-1000 delay-500">
        Your home, simplified.
      </p>

      {/* Loading dots */}
      <div className="absolute bottom-16 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 animate-pulse rounded-full bg-primary/60"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
