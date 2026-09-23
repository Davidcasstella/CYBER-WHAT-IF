import { cn } from '@/lib/utils'
import type { NivelRiesgo } from '@/types/api'
import { RISK_BG, RISK_LABEL, RISK_TEXT } from '../risk'

/** Punto de color + texto: el color nunca es el único portador del significado. */
export function RiskBadge({ level, className }: { level: NivelRiesgo; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm font-semibold', RISK_TEXT[level], className)}>
      <span aria-hidden className={cn('size-2 rounded-full', RISK_BG[level])} />
      Riesgo {RISK_LABEL[level].toLowerCase()}
    </span>
  )
}
