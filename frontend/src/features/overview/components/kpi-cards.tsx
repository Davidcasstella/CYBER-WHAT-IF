import { ArrowDown, ArrowUp, Bug, Coins, type LucideIcon, Minus, Network, Shield } from 'lucide-react'
import { formatDateTime, formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { PuntoHistorial } from '@/types/api'

type Metric = 'riesgo_general' | 'vulnerabilidades' | 'impacto_financiero' | 'ataques_evaluados'

interface KpiDef {
  metric: Metric
  label: string
  icon: LucideIcon
  tile: string
  /** true = que baje es bueno (riesgo, pérdidas); false = neutral. */
  lowerIsBetter: boolean
  format: (v: number) => string
  suffix?: string
  trend: 'line' | 'bars'
}

const KPIS: KpiDef[] = [
  {
    metric: 'riesgo_general',
    label: 'Riesgo general',
    icon: Shield,
    tile: 'bg-rose-soft text-destructive',
    lowerIsBetter: true,
    format: String,
    suffix: '/ 100',
    trend: 'line',
  },
  {
    metric: 'vulnerabilidades',
    label: 'Vulnerabilidades',
    icon: Bug,
    tile: 'bg-bronze-soft text-bronze',
    lowerIsBetter: true,
    format: String,
    trend: 'bars',
  },
  {
    metric: 'impacto_financiero',
    label: 'Impacto financiero',
    icon: Coins,
    tile: 'bg-bronze-soft text-bronze',
    lowerIsBetter: true,
    format: (v) => formatMoney(v),
    trend: 'bars',
  },
  {
    metric: 'ataques_evaluados',
    label: 'Ataques evaluados',
    icon: Network,
    tile: 'bg-rose-soft text-destructive',
    lowerIsBetter: false,
    format: String,
    trend: 'bars',
  },
]

const value = (p: PuntoHistorial, m: Metric) => Number(p[m])

export function KpiCards({ historial }: { historial: PuntoHistorial[] }) {
  const current = historial.at(-1)
  const previous = historial.at(-2)
  if (!current) return null

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {KPIS.map((kpi) => (
        <KpiCard key={kpi.metric} kpi={kpi} current={current} previous={previous} historial={historial} />
      ))}
    </ul>
  )
}

function KpiCard({
  kpi,
  current,
  previous,
  historial,
}: {
  kpi: KpiDef
  current: PuntoHistorial
  previous?: PuntoHistorial
  historial: PuntoHistorial[]
}) {
  const Icon = kpi.icon
  const now = value(current, kpi.metric)
  const before = previous ? value(previous, kpi.metric) : undefined

  return (
    <li className="bg-card border-border flex min-w-0 gap-4 rounded-xl border p-5">
      <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-full', kpi.tile)}>
        <Icon className="size-6" strokeWidth={1.8} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium whitespace-nowrap">{kpi.label}</p>
        <p className="mt-1 text-[1.7rem] leading-tight font-semibold tracking-tight whitespace-nowrap">
          {kpi.format(now)}
          {kpi.suffix && <span className="text-muted-foreground ml-1.5 text-lg font-normal">{kpi.suffix}</span>}
        </p>
        <Delta now={now} before={before} lowerIsBetter={kpi.lowerIsBetter} />
      </div>
      {historial.length > 1 && (
        <div className="hidden w-14 shrink-0 self-end sm:block">
          {kpi.trend === 'line' ? (
            <Sparkline points={historial} metric={kpi.metric} format={kpi.format} />
          ) : (
            <MiniBars points={historial} metric={kpi.metric} format={kpi.format} />
          )}
        </div>
      )}
    </li>
  )
}

function Delta({ now, before, lowerIsBetter }: { now: number; before?: number; lowerIsBetter: boolean }) {
  if (before === undefined) {
    return <p className="text-muted-foreground mt-1 text-sm">Primera auditoría</p>
  }
  const pct = before === 0 ? 0 : Math.round(((now - before) / before) * 100)
  const Icon = pct < 0 ? ArrowDown : pct > 0 ? ArrowUp : Minus
  // Mejora = baja en una métrica donde menos es mejor. Flecha + texto: nunca solo color.
  const tone =
    pct === 0 || !lowerIsBetter ? 'text-muted-foreground' : pct < 0 ? 'text-risk-bajo' : 'text-risk-urgente'

  return (
    <div className="mt-1 text-sm">
      <p className={cn('inline-flex items-center gap-1 font-semibold', tone)}>
        <Icon className="size-4" aria-hidden />
        {pct > 0 ? '+' : ''}
        {pct}%
      </p>
      <p className="text-muted-foreground text-xs whitespace-nowrap">vs. auditoría anterior</p>
    </div>
  )
}

/** Tendencia en línea (2px) con el último punto marcado. Cada punto tiene tooltip nativo. */
function Sparkline({ points, metric, format }: { points: PuntoHistorial[]; metric: Metric; format: (v: number) => string }) {
  const values = points.map((p) => value(p, metric))
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const x = (i: number) => (i / (values.length - 1)) * 76 + 2
  const y = (v: number) => 38 - ((v - min) / (max - min || 1)) * 32
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i)} ${y(v)}`).join(' ')

  return (
    <svg viewBox="0 0 80 42" className="h-10 w-full overflow-visible" role="img" aria-label="Tendencia por auditoría">
      <path d={d} fill="none" stroke="var(--chart-current)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle
          key={points[i].auditoria_id}
          cx={x(i)}
          cy={y(v)}
          r={i === values.length - 1 ? 3.5 : 6}
          fill={i === values.length - 1 ? 'var(--chart-current)' : 'transparent'}
        >
          <title>{`Auditoría #${points[i].auditoria_id} · ${formatDateTime(points[i].fecha)}: ${format(v)}`}</title>
        </circle>
      ))}
    </svg>
  )
}

/** Barras mínimas: las anteriores atenuadas, la actual en color pleno. */
function MiniBars({ points, metric, format }: { points: PuntoHistorial[]; metric: Metric; format: (v: number) => string }) {
  const values = points.map((p) => value(p, metric))
  const max = Math.max(...values, 1)
  return (
    <div className="flex h-10 items-end justify-end gap-1" role="img" aria-label="Historial por auditoría">
      {values.map((v, i) => (
        <span
          key={points[i].auditoria_id}
          title={`Auditoría #${points[i].auditoria_id}: ${format(v)}`}
          className={cn('max-w-2.5 flex-1 rounded-t-[3px]', i === values.length - 1 ? 'bg-chart-current' : 'bg-chart-current/30')}
          style={{ height: `${Math.max((v / max) * 100, 6)}%` }}
        />
      ))}
    </div>
  )
}
