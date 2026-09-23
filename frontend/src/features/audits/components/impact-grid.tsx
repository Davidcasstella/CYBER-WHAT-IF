import { formatMoney, formatPercent } from '@/lib/format'
import type { ResultadoImpacto } from '@/types/api'

/** Las 4 dimensiones de impacto del SRS (RF-06) para un ataque. */
export function ImpactGrid({ resultado }: { resultado: ResultadoImpacto }) {
  const items = [
    { label: 'Técnico', value: formatPercent(resultado.impacto_tecnico), note: 'de la infraestructura afectada' },
    { label: 'Operacional', value: formatPercent(resultado.impacto_operacional), note: 'de la operación interrumpida' },
    { label: 'Financiero', value: formatMoney(resultado.impacto_financiero), note: 'pérdida estimada' },
    {
      label: 'Recuperación',
      value: resultado.tiempo_recuperacion_horas == null ? '—' : `${resultado.tiempo_recuperacion_horas} h`,
      note: `probabilidad ${formatPercent(resultado.probabilidad_ocurrencia)}`,
    },
  ]

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="border-border border-l pl-3">
          <dt className="text-muted-foreground text-sm">{item.label}</dt>
          <dd className="font-heading text-2xl">{item.value}</dd>
          <dd className="text-muted-foreground text-xs">{item.note}</dd>
        </div>
      ))}
    </dl>
  )
}
