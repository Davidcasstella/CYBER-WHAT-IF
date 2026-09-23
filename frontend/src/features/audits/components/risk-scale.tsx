import { cn } from '@/lib/utils'
import { RISK_BG, RISK_LABEL, RISK_LEVELS } from '../risk'
import type { NivelRiesgo } from '@/types/api'

interface RiskScaleProps {
  /** Nivel a resaltar; sin él, se muestra la escala completa como leyenda. */
  value?: NivelRiesgo
  inverted?: boolean
  className?: string
}

/** La escala de riesgo del producto: cuatro tramos, el activo a opacidad completa. */
export function RiskScale({ value, inverted, className }: RiskScaleProps) {
  return (
    <figure className={cn('space-y-2', className)}>
      <div className="flex gap-1" role="img" aria-label={value ? `Riesgo ${RISK_LABEL[value]}` : 'Escala de riesgo'}>
        {RISK_LEVELS.map((level) => (
          <span
            key={level}
            className={cn(
              'h-2 flex-1 first:rounded-l-sm last:rounded-r-sm',
              RISK_BG[level],
              value && value !== level && 'opacity-20',
            )}
          />
        ))}
      </div>
      <figcaption
        className={cn(
          'flex justify-between text-xs',
          inverted ? 'text-primary-foreground/70' : 'text-muted-foreground',
        )}
      >
        {RISK_LEVELS.map((level) => (
          <span key={level} className={cn(value === level && 'text-foreground font-semibold')}>
            {RISK_LABEL[level]}
          </span>
        ))}
      </figcaption>
    </figure>
  )
}
