import { useParams } from 'react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { QueryState } from '@/components/query-state'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/features/auth/auth-context'
import { ReportSection } from '@/features/reports/components/report-section'
import { formatDateTime } from '@/lib/format'
import { useAudit, useRunAudit, useTakeAudit } from '../api'
import { ImpactGrid } from '../components/impact-grid'
import { RiskScale } from '../components/risk-scale'

export function AuditDetailPage() {
  const id = Number(useParams().id)
  const { user } = useAuth()
  const audit = useAudit(id)
  const run = useRunAudit()
  const take = useTakeAudit()

  const canOperate = user?.rol === 'ANALISTA' || user?.rol === 'ADMIN'
  const a = audit.data

  return (
    <QueryState isPending={audit.isPending} error={audit.error}>
      {a && (
        <article>
          <PageHeader
            title={`Auditoría #${a.id}`}
            description={
              a.estado === 'COMPLETADA'
                ? `Ejecutada sobre la empresa simulada #${a.empresa_simulada_id}, finalizó el ${formatDateTime(a.fecha_fin)}`
                : 'Los ataques aún no se han ejecutado sobre la empresa simulada.'
            }
            actions={
              canOperate &&
              a.estado === 'PENDIENTE' && (
                <>
                  {user?.rol === 'ANALISTA' && a.analista_usuario_id !== user.id && (
                    <Button variant="outline" disabled={take.isPending} onClick={() => take.mutate(a.id)}>
                      Asignarme esta auditoría
                    </Button>
                  )}
                  <Button
                    disabled={run.isPending}
                    onClick={() =>
                      run.mutate(a.id, {
                        onSuccess: () => toast.success('Auditoría ejecutada. El informe quedó en borrador.'),
                        onError: (e) => toast.error(e.message),
                      })
                    }
                  >
                    {run.isPending ? 'Ejecutando ataques…' : 'Ejecutar auditoría'}
                  </Button>
                </>
              )
            }
          />

          <div className="space-y-10">
            {a.ejecuciones.map((e) => (
              <section key={e.id} aria-labelledby={`ataque-${e.id}`} className="space-y-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 id={`ataque-${e.id}`} className="text-2xl">
                    {e.ataque.nombre}
                  </h2>
                  {e.ataque.tecnica_mitre_principal && (
                    <span className="text-muted-foreground text-sm">MITRE ATT&CK {e.ataque.tecnica_mitre_principal}</span>
                  )}
                </div>
                {e.resultado ? (
                  <>
                    <RiskScale value={e.resultado.nivel_riesgo} className="max-w-md" />
                    <ImpactGrid resultado={e.resultado} />
                  </>
                ) : (
                  <p className="text-muted-foreground">Sin resultados todavía.</p>
                )}
                <Separator />
              </section>
            ))}
          </div>

          {a.estado === 'COMPLETADA' && <ReportSection auditoriaId={a.id} />}
        </article>
      )}
    </QueryState>
  )
}
