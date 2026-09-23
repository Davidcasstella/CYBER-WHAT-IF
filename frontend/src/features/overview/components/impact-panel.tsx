import { ChartColumn, Cog, Coins, type LucideIcon, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Dimensiones } from '@/types/api'
import { DIMENSIONES } from '../labels'
import { Panel } from './panel'

const ICONS: Record<keyof Dimensiones, LucideIcon> = {
  tecnico: ChartColumn,
  operacional: Cog,
  financiero: Coins,
  riesgo: TriangleAlert,
}

/**
 * Impacto por dimensión (RF-06). Las 4 dimensiones son una misma medida 0..100, así que
 * las barras usan un solo tono; el gráfico de la derecha compara con la auditoría anterior.
 */
export function ImpactPanel({
  actual,
  anterior,
  auditoriaId,
}: {
  actual: Dimensiones
  anterior?: Dimensiones
  auditoriaId: number
}) {
  return (
    <Panel
      title="Impacto en tu negocio"
      description="Evaluación por dimensión (0 = bajo impacto, 100 = alto impacto)."
      action={{ to: `/app/auditorias/${auditoriaId}`, label: 'Ver detalle' }}
    >
      <div className="grid gap-8 md:grid-cols-[1fr_1fr] md:gap-6">
        <ul className="space-y-5 self-center">
          {DIMENSIONES.map(({ key, label }) => {
            const Icon = ICONS[key]
            return (
              <li key={key} className="grid grid-cols-[1.5rem_6.5rem_1fr_2rem] items-center gap-3">
                <Icon className="text-muted-foreground size-5" strokeWidth={1.8} aria-hidden />
                <span className="font-medium">{label}</span>
                <span className="bg-muted h-3 overflow-hidden rounded-full" aria-hidden>
                  <span className="bg-chart-current block h-full rounded-full" style={{ width: `${actual[key]}%` }} />
                </span>
                <span className="text-right font-semibold">{actual[key]}</span>
              </li>
            )
          })}
        </ul>
        <ComparisonChart actual={actual} anterior={anterior} />
      </div>
    </Panel>
  )
}

const TICKS = [100, 75, 50, 25, 0]

function ComparisonChart({ actual, anterior }: { actual: Dimensiones; anterior?: Dimensiones }) {
  const [hover, setHover] = useState<{ key: keyof Dimensiones; serie: 'actual' | 'anterior' } | null>(null)
  const series = anterior
    ? ([
        { id: 'actual', label: 'Esta auditoría', data: actual, fill: 'bg-chart-current' },
        { id: 'anterior', label: 'Auditoría anterior', data: anterior, fill: 'bg-chart-previous' },
      ] as const)
    : ([{ id: 'actual', label: 'Esta auditoría', data: actual, fill: 'bg-chart-current' }] as const)

  return (
    <figure className="md:border-border md:border-l md:pl-6">
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-medium">{anterior ? 'Comparativa con la auditoría anterior' : 'Comparativa de impacto'}</span>
        {series.length > 1 && (
          <span className="text-muted-foreground flex gap-4">
            {series.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-1.5">
                <span aria-hidden className={cn('size-2.5 rounded-sm', s.fill)} />
                {s.label}
              </span>
            ))}
          </span>
        )}
      </figcaption>

      <div className="relative grid grid-cols-[2rem_1fr] gap-2">
        {/* Eje Y */}
        <div className="text-muted-foreground relative h-44 text-xs" aria-hidden>
          {TICKS.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${100 - t}%` }}>
              {t}
            </span>
          ))}
        </div>
        <div className="relative">
          {/* Rejilla recesiva */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44" aria-hidden>
            {TICKS.map((t) => (
              <span key={t} className="border-border absolute inset-x-0 border-t" style={{ top: `${100 - t}%` }} />
            ))}
          </div>
          <ul className="relative grid h-44 grid-cols-4 gap-3">
            {DIMENSIONES.map(({ key, label }) => (
              <li key={key} className="flex items-end justify-center gap-0.5">
                {series.map((s) => {
                  const v = s.data[key]
                  const active = hover?.key === key && hover.serie === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-label={`${label}, ${s.label}: ${v} de 100`}
                      onMouseEnter={() => setHover({ key, serie: s.id })}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover({ key, serie: s.id })}
                      onBlur={() => setHover(null)}
                      className="group relative flex h-full max-w-9 flex-1 items-end focus-visible:outline-none"
                    >
                      <span
                        className={cn(
                          'relative block w-full rounded-t-[4px] transition-opacity',
                          s.fill,
                          hover && !active && 'opacity-45',
                          'group-focus-visible:ring-ring group-focus-visible:ring-2',
                        )}
                        style={{ height: `${Math.max(v, 1)}%` }}
                      >
                        {/* Etiqueta directa solo en la serie actual */}
                        {s.id === 'actual' && (
                          <span className="text-foreground absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-semibold">
                            {v}
                          </span>
                        )}
                        {active && (
                          <span
                            role="tooltip"
                            className="bg-popover text-popover-foreground border-border absolute bottom-full left-1/2 z-10 mb-7 -translate-x-1/2 rounded-md border px-2.5 py-1.5 text-xs whitespace-nowrap shadow-md"
                          >
                            <span className="font-semibold">{label}</span> · {s.label}: {v}
                          </span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </li>
            ))}
          </ul>
          <ul className="text-muted-foreground mt-2 grid grid-cols-4 gap-3 text-center text-xs" aria-hidden>
            {DIMENSIONES.map(({ key, label }) => (
              <li key={key}>{label}</li>
            ))}
          </ul>
        </div>
      </div>
      {!anterior && (
        <p className="text-muted-foreground mt-3 text-xs">Con tu próxima auditoría verás aquí la comparación.</p>
      )}
    </figure>
  )
}
