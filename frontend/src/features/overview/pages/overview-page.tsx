import { Info, LayoutDashboard, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { PageHeader } from '@/components/page-header'
import { EmptyState, QueryState } from '@/components/query-state'
import { Button } from '@/components/ui/button'
import { useSummary } from '../api'
import { CompanyStatus, FindingsPanel, ReportPanel, ScenariosPanel } from '../components/detail-panels'
import { ImpactPanel } from '../components/impact-panel'
import { KpiCards } from '../components/kpi-cards'

/** Panel del Cliente: estado de su seguridad según su auditoría validada más reciente. */
export function OverviewPage() {
  const summary = useSummary()
  const r = summary.data

  return (
    <>
      <PageHeader
        title="Tu seguridad, en perspectiva"
        description="Consulta el estado de tus auditorías y sus hallazgos."
        actions={
          <Button asChild size="lg">
            <Link to="/app/planes">
              <Plus aria-hidden />
              Nueva auditoría
            </Link>
          </Button>
        }
      />

      <QueryState isPending={summary.isPending} error={summary.error}>
        {r && !r.empresa ? (
          <EmptyState title="Registra tu empresa para empezar">
            <p>Con unos pocos datos generamos la réplica simulada sobre la que corren los ataques.</p>
            <Button asChild>
              <Link to="/app/empresa">Registrar empresa</Link>
            </Button>
          </EmptyState>
        ) : r ? (
          <div className="space-y-5">
            <CompanyStatus resumen={r} />

            {!r.auditoria_actual ? (
              <EmptyState
                title={r.auditorias_en_revision > 0 ? 'Tu primera auditoría está en proceso' : 'Aún no tienes auditorías'}
              >
                {r.auditorias_en_revision > 0 ? (
                  <p>Un analista está revisando los resultados. Tu panel se completará cuando valide el informe.</p>
                ) : (
                  <>
                    <p>Contrata un plan y verás aquí el impacto de cada ataque sobre tu empresa.</p>
                    <Button asChild>
                      <Link to="/app/planes">Ver planes</Link>
                    </Button>
                  </>
                )}
              </EmptyState>
            ) : (
              <>
                {r.incluye_dashboard ? (
                  <>
                    <KpiCards historial={r.historial} />
                    <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
                      <ImpactPanel
                        actual={r.historial.at(-1)!.dimensiones}
                        anterior={r.historial.at(-2)?.dimensiones}
                        auditoriaId={r.auditoria_actual.id}
                      />
                      <ScenariosPanel resumen={r} auditoriaId={r.auditoria_actual.id} />
                    </div>
                  </>
                ) : (
                  <>
                    {/* RN-03: el dashboard de impacto es del paquete completo. */}
                    <section className="bg-bronze-soft/60 border-border flex flex-wrap items-center gap-4 rounded-xl border p-5">
                      <LayoutDashboard className="text-bronze size-6" aria-hidden />
                      <p className="min-w-0 flex-1">
                        Tu plan incluye el informe de tu auditoría. Los indicadores y el impacto por dimensión vienen con el
                        paquete completo.
                      </p>
                      <Button asChild variant="outline">
                        <Link to="/app/planes">Ver paquete completo</Link>
                      </Button>
                    </section>
                    <ScenariosPanel resumen={r} auditoriaId={r.auditoria_actual.id} />
                  </>
                )}
                <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
                  <FindingsPanel resumen={r} auditoriaId={r.auditoria_actual.id} />
                  <ReportPanel auditoriaId={r.auditoria_actual.id} />
                </div>
              </>
            )}

            <p className="bg-teal-soft/70 text-foreground flex items-center gap-3 rounded-xl px-5 py-4 text-sm">
              <Info className="text-primary size-5 shrink-0" aria-hidden />
              Las pruebas se realizan sobre una réplica aislada; tus sistemas reales no se ven afectados.
            </p>
          </div>
        ) : null}
      </QueryState>
    </>
  )
}
