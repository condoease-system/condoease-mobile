'use client'

import { CondoEaseApp } from './CondoEaseApp'

export function MobileFrame() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center py-8 px-4"
      style={{ background: 'linear-gradient(135deg, #0f1a30 0%, #1a2847 50%, #0f1a30 100%)' }}
    >
      {/* Desktop label */}
      <div className="hidden md:flex flex-col items-center gap-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Interactive Preview
          </p>
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            CondoEase Tenant App
          </p>
        </div>

        {/* Phone frame */}
        <div
          className="relative flex-shrink-0"
          style={{
            width: 390,
          }}
        >
          {/* Phone shell */}
          <div
            className="relative rounded-[48px] overflow-hidden"
            style={{
              background: '#1a1a1a',
              padding: '12px',
              boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            {/* Screen bezel */}
            <div
              className="relative rounded-[38px] overflow-hidden"
              style={{ background: '#000', height: 780 }}
            >
              {/* App content */}
              <div className="absolute inset-0 flex flex-col" style={{ borderRadius: 38 }}>
                <CondoEaseApp />
              </div>
            </div>
          </div>

          {/* Side buttons */}
          <div
            className="absolute rounded-full"
            style={{ left: -3, top: 110, width: 4, height: 36, backgroundColor: '#2a2a2a' }}
          />
          <div
            className="absolute rounded-full"
            style={{ left: -3, top: 158, width: 4, height: 64, backgroundColor: '#2a2a2a' }}
          />
          <div
            className="absolute rounded-full"
            style={{ left: -3, top: 232, width: 4, height: 64, backgroundColor: '#2a2a2a' }}
          />
          <div
            className="absolute rounded-full"
            style={{ right: -3, top: 168, width: 4, height: 80, backgroundColor: '#2a2a2a' }}
          />
        </div>

        {/* Bottom label */}
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          All screens are fully interactive — tap to navigate
        </p>
      </div>

      {/* Mobile: full screen */}
      <div className="md:hidden w-full h-screen fixed inset-0 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <CondoEaseApp />
        </div>
      </div>
    </div>
  )
}
