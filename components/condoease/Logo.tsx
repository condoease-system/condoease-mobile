'use client'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'icon'
  className?: string
}

export function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 36, text: 'text-lg', gap: 'gap-2.5' },
    md: { icon: 44, text: 'text-xl', gap: 'gap-2.5' },
    lg: { icon: 64, text: 'text-3xl', gap: 'gap-4' },
  }
  const s = sizes[size]

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <div
        className="rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{
          width: s.icon,
          height: s.icon,
          backgroundColor: '#243B6B',
          color: '#FFFFFF',
        }}
      >
        <svg
          width={s.icon * 0.72}
          height={s.icon * 0.72}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 32V13.5c0-1.1.9-2 2-2h8v20.5"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 32V7.5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2V32"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M7.5 32h25" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M14 16h2M14 21h2M14 26h2M24 10h2M24 15h2M24 20h2M24 25h2"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.68"
          />
          <path d="M17.5 32v-5.5h5V32" fill="currentColor" />
          <path d="M29.25 5.5h4.25v4.25" stroke="#FF8A1C" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>

      {variant === 'full' && (
        <span
          className={`${s.text} font-bold tracking-tight`}
          style={{ color: '#243660', fontFamily: 'Inter, sans-serif' }}
        >
          Condo<span style={{ color: '#FF8A1C' }}>Ease</span>
        </span>
      )}
    </div>
  )
}
