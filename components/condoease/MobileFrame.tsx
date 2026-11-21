'use client'

import { useSyncExternalStore } from 'react'
import { Capacitor } from '@capacitor/core'
import { CondoEaseApp } from './CondoEaseApp'

const subscribeNoop = () => () => {}

// Inside the Android app the phone-frame preview must never show, even on tablets.
function useIsNativeApp() {
  return useSyncExternalStore(subscribeNoop, () => Capacitor.isNativePlatform(), () => false)
}

/*
 * Mount a single CondoEaseApp: full screen on phones, inside the phone frame on desktop.
 * Two instances (one CSS-hidden) would double every API call and race on the payment-return
 * query string, which the first instance strips before the visible one can read it.
 */
export function MobileFrame() {
  const isNativeApp = useIsNativeApp()
  // Dropping the md: classes keeps the same element tree, so CondoEaseApp is not remounted.
  const frame = (classes: string) => (isNativeApp ? classes.split(' ').filter(name => !name.startsWith('md:')).join(' ') : classes)

  return (
    <div className={frame("fixed inset-0 flex flex-col bg-background md:static md:min-h-screen md:w-full md:items-center md:justify-center md:gap-8 md:bg-muted md:px-4 md:py-8")}>
      {/* Desktop label */}
      <div className={frame("hidden text-center md:block")}>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
          Interactive Preview
        </p>
        <p className="text-sm font-medium tracking-tight text-foreground">
          CondoEase Tenant App
        </p>
      </div>

      {/* Phone frame (desktop) / full screen (mobile) */}
      <div className={frame("relative flex min-h-0 flex-1 flex-col md:w-[390px] md:flex-none md:shrink-0")}>
        {/* Phone shell */}
        <div className={frame("relative flex min-h-0 flex-1 flex-col md:overflow-hidden md:rounded-[48px] md:bg-neutral-900 md:p-3 md:shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)] md:ring-1 md:ring-black/10")}>
          {/* Screen bezel */}
          <div className={frame("relative min-h-0 flex-1 overflow-hidden bg-background md:h-[780px] md:flex-none md:rounded-[38px]")}>
            {/* App content */}
            <div className={frame("absolute inset-0 flex flex-col md:rounded-[38px]")}>
              <CondoEaseApp />
            </div>
          </div>
        </div>

        {/* Side buttons */}
        <div className={frame("absolute -left-[3px] top-[110px] hidden h-9 w-1 rounded-full bg-neutral-800 md:block")} />
        <div className={frame("absolute -left-[3px] top-[158px] hidden h-16 w-1 rounded-full bg-neutral-800 md:block")} />
        <div className={frame("absolute -left-[3px] top-[232px] hidden h-16 w-1 rounded-full bg-neutral-800 md:block")} />
        <div className={frame("absolute -right-[3px] top-[168px] hidden h-20 w-1 rounded-full bg-neutral-800 md:block")} />
      </div>

      {/* Bottom label */}
      <p className={frame("hidden text-xs text-muted-foreground md:block")}>
        All screens are fully interactive — tap to navigate
      </p>
    </div>
  )
}
