'use client'

import { CondoEaseApp } from './CondoEaseApp'

export function MobileFrame() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted px-4 py-8">
      {/* Desktop label */}
      <div className="hidden flex-col items-center gap-8 md:flex">
        <div className="text-center">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
            Interactive Preview
          </p>
          <p className="text-sm font-medium tracking-tight text-foreground">
            CondoEase Tenant App
          </p>
        </div>

        {/* Phone frame */}
        <div className="relative w-[390px] shrink-0">
          {/* Phone shell */}
          <div className="relative overflow-hidden rounded-[48px] bg-neutral-900 p-3 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)] ring-1 ring-black/10">
            {/* Screen bezel */}
            <div className="relative h-[780px] overflow-hidden rounded-[38px] bg-background">
              {/* App content */}
              <div className="absolute inset-0 flex flex-col rounded-[38px]">
                <CondoEaseApp />
              </div>
            </div>
          </div>

          {/* Side buttons */}
          <div className="absolute -left-[3px] top-[110px] h-9 w-1 rounded-full bg-neutral-800" />
          <div className="absolute -left-[3px] top-[158px] h-16 w-1 rounded-full bg-neutral-800" />
          <div className="absolute -left-[3px] top-[232px] h-16 w-1 rounded-full bg-neutral-800" />
          <div className="absolute -right-[3px] top-[168px] h-20 w-1 rounded-full bg-neutral-800" />
        </div>

        {/* Bottom label */}
        <p className="text-xs text-muted-foreground">
          All screens are fully interactive — tap to navigate
        </p>
      </div>

      {/* Mobile: full screen */}
      <div className="fixed inset-0 flex h-screen w-full flex-col bg-background md:hidden">
        <div className="flex-1 overflow-hidden">
          <CondoEaseApp />
        </div>
      </div>
    </div>
  )
}
