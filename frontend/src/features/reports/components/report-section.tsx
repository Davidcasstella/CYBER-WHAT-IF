import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { toast } from 'sonner'
import { EmptyState } from '@/components/query-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDashboard, useReport, useValidateReport } from '@/features/audits/api'
import { RiskBadge } from '@/features/audits/components/risk-badge'
import { useAuth } from '@/features/auth/auth-context'
import { ApiError } from '@/lib/api-client'
import { formatDateTime, formatMoney } from '@/lib/format'

const CRITICIDAD_LABEL = { BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta', CRITICA: 'Crítica' } as const

/** Informe de vulnerabilidades (RF-07) + validación del Analista (RF-09) + dashboard (RF-08). */
export function ReportSection({ auditoriaId }: { auditoriaId: number }) {
  const { user } = useAuth()
  const report = useReport(auditoriaId, true)
  const dashboard = useDashboard(auditoriaId, true)
  const validate = useValidateReport()
  const { hash } = useLocation()

  // Los enlaces "Ver informe" llegan con #informe: bajar hasta aquí cuando el informe cargue.
  useEffect(() => {
    if (hash === '#informe' && report.data) {
      document.getElementById('informe')?.scrollIntoView({ block: 'start' })
    }
  }, [hash, report.data])

  // RN-04: para el Cliente, un 404 significa "todavía en revisión", no un error.
  if (report.error instanceof ApiError && report.error.status === 404) {
    return (
      <section className="pt-12">
        <EmptyState title="Tu informe está en revisión">
          <p>Un analista está validando los resultados. Te avisaremos cuando esté listo.</p>
        </EmptyState>
      </section>
    )
  }
  const informe = report.data
  if (!informe) return null

  return (
    <section aria-labelledby="informe" className="scroll-mt-24 space-y-8 pt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 id="informe" className="text-3xl">
            Informe de vulnerabilidades
          </h2>
          <p className="text-muted-foreground text-sm">
            Generado el {formatDateTime(informe.fecha_generacion)}
            {informe.fecha_validacion && `, validado el ${formatDateTime(informe.fecha_validacion)}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={informe.estado === 'VALIDADO' ? 'default' : 'outline'}>
            {informe.estado === 'VALIDADO' ? 'Validado' : 'Borrador'}
          </Badge>
          {user?.rol === 'ANALISTA' && informe.estado === 'BORRADOR' && (
            <Button
              disabled={validate.isPending}
              onClick={() =>
                validate.mutate(auditoriaId, {
                  onSuccess: () => toast.success('Informe validado. El cliente ya puede verlo.'),
                  onError: (e) => toast.error(e.message),
                })
              }
            >
              Validar informe
            </Button>
          )}
        </div>
      </div>

      {/* RN-03: el backend solo entrega el dashboard si el plan es COMPLETO. */}
      {dashboard.data && (
        <div className="bg-card border-border grid gap-6 rounded-lg border p-6 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm">Impacto financiero total estimado</p>
            <p className="font-heading text-4xl">{formatMoney(dashboard.data.impacto_financiero_total)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Riesgo más alto encontrado</p>
            <RiskBadge level={dashboard.data.riesgo_maximo} className="text-lg" />
          </div>
        </div>
      )}

      <ol className="space-y-6">
        {informe.vulnerabilidades.map((v) => (
          <li key={v.id} className="border-border space-y-3 border-l-2 pl-5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="font-medium">{v.descripcion}</p>
              <span className="text-muted-foreground text-sm">Criticidad {CRITICIDAD_LABEL[v.criticidad].toLowerCase()}</span>
            </div>
            {v.objetivo_descripcion && <p className="text-muted-foreground text-sm">Afectados: {v.objetivo_descripcion}</p>}
            {v.recomendaciones.length > 0 && (
              <div>
                <p className="text-sm font-semibold">Cómo mitigarlo</p>
                <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                  {v.recomendaciones.map((r) => (
                    <li key={r.id}>{r.descripcion}</li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
