import { cn } from '@/lib/utils'
import { BENEFITS, FEATURES, type Feature } from '../content'

const TONE: Record<Feature['tone'], { tile: string; icon: string }> = {
  mist: { tile: 'bg-brand-100', icon: 'text-brand-600' },
  bronze: { tile: 'bg-brand-bronze-50', icon: 'text-brand-ink' },
  teal: { tile: 'bg-[#e1eeee]', icon: 'text-brand-600' },
}

/** Las 3 propuestas de valor + la franja de beneficios, justo debajo del hero. */
export function FeatureHighlights() {
  return (
    <section aria-label="Qué incluye" className="mx-auto max-w-7xl space-y-6 px-4 pb-20 sm:px-6">
      <ul className="grid gap-5 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text, tone }) => (
          <li key={title} className="border-brand-100 flex gap-5 rounded-2xl border bg-white p-6 shadow-[0_10px_30px_-24px_rgba(16,34,43,0.35)]">
            <span className={cn('flex size-16 shrink-0 items-center justify-center rounded-full', TONE[tone].tile)}>
              <Icon className={cn('size-8', TONE[tone].icon)} strokeWidth={1.8} aria-hidden />
            </span>
            <div className="space-y-1.5">
              <h2 className="font-brand text-brand-ink text-xl font-bold tracking-tight">{title}</h2>
              <p className="text-brand-slate leading-relaxed">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      <ul className="border-brand-100 grid divide-y rounded-2xl border bg-white md:grid-cols-3 md:divide-x md:divide-y-0">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="border-brand-100 flex items-center gap-5 px-8 py-6">
            <Icon
              className={cn('size-10 shrink-0', title.includes('WhatsApp') ? 'text-[#25d366]' : 'text-brand-600')}
              strokeWidth={1.8}
              aria-hidden
            />
            <div>
              <p className="text-brand-ink font-semibold">{title}</p>
              <p className="text-brand-slate text-sm">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
