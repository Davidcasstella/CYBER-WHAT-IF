import { cn } from '@/lib/utils'

/** Escudo con red de nodos + wordmark serif "CyberWhat-If". */
export function BrandLogo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <ShieldMark className={compact ? 'h-9 w-8' : 'h-11 w-10'} />
      <span className={cn('font-heading text-brand-ink font-bold tracking-tight', compact ? 'text-2xl' : 'text-[1.75rem]')}>
        Cyber<span className="text-brand-600">What-If</span>
      </span>
    </span>
  )
}

export function ShieldMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 44" className={cn('shrink-0', className)} aria-hidden="true">
      <path
        d="M20 2 36 8v13c0 10.5-6.8 18.3-16 21C10.8 39.3 4 31.5 4 21V8Z"
        fill="#fff"
        stroke="#10222b"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <g stroke="#0f4c5c" strokeWidth="1.5" strokeLinecap="round">
        <path d="M20 21 13.5 15M20 21l6.5-6M20 21v8M20 21l-6.5 4M20 21l6.5 4" />
      </g>
      <circle cx="20" cy="21" r="3.2" fill="#0f4c5c" />
      <g fill="#a8742e">
        <circle cx="13.5" cy="15" r="2" />
        <circle cx="26.5" cy="15" r="2" />
        <circle cx="20" cy="29" r="2" />
        <circle cx="13.5" cy="25" r="2" />
        <circle cx="26.5" cy="25" r="2" />
      </g>
    </svg>
  )
}
