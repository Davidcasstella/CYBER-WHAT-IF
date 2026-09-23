import { FileText } from 'lucide-react'
import { Link } from 'react-router'
import { PageHeader } from '@/components/page-header'
import { EmptyState, QueryState } from '@/components/query-state'
import { Button } from '@/components/ui/button'
import { useAudits } from '@/features/audits/api'
import { useAuth } from '@/features/auth/auth-context'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Informes de las auditorías ejecutadas (RF-07, RF-11). */
export function ReportsPage() {
  const { user } = useAuth()
  const audits = useAudits()
  const isClient = user?.rol === 'CLIENTE'
  // RN-04: el Cliente solo ve informes validados; el equipo ve también los borradores.
  const withReport = (audits.data ?? []).filter((a) => a.informe && (!isClient || a.informe.estado === 'VALIDADO'))
  const inReview = isClient ? (audits.data ?? []).filter((a) => a.informe?.estado === 'BORRADOR').length : 0

  return (
    <>
      <PageHeader
        title="Informes"
        description={
          isClient
            ? 'Los informes de tus auditorías, validados por un analista.'
            : 'Informes de todas las auditorías ejecutadas. Los borradores esperan validación.'
        }
      />
      <QueryState isPending={audits.isPending} error={audits.error}>
        {inReview > 0 && (
          <p className="text-muted-foreground mb-4 text-sm">
            {inReview === 1 ? 'Tienes 1 informe en revisión.' : `Tienes ${inReview} informes en revisión.`}
          </p>
        )}
        {withReport.length === 0 ? (
          <EmptyState title="Aún no hay informes">
            <p>Cada auditoría genera un informe cuando termina de ejecutarse.</p>
            {isClient && (
              <Button asChild>
                <Link to="/app/planes">Contratar una auditoría</Link>
              </Button>
            )}
          </EmptyState>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {withReport.map((a) => (
              <li key={a.id} className="bg-card border-border flex flex-col gap-4 rounded-xl border p-5">
                <div className="flex items-start gap-4">
                  <span className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-lg">
                    <FileText className="size-6" strokeWidth={1.5} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl">Informe de la auditoría #{a.id}</h2>
                    <p className="text-muted-foreground text-sm">{a.ejecuciones.map((e) => e.ataque.nombre).join(', ')}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded-md px-2 py-0.5 text-xs font-semibold',
                      a.informe?.estado === 'VALIDADO' ? 'bg-teal-soft text-primary' : 'bg-bronze-soft text-bronze',
                    )}
                  >
                    {a.informe?.estado === 'VALIDADO' ? 'Validado' : 'Borrador'}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {a.informe?.fecha_validacion
                    ? `Validado el ${formatDateTime(a.informe.fecha_validacion)}`
                    : `Ejecutada el ${formatDateTime(a.fecha_fin)}`}
                </p>
                <Button asChild variant="outline" className="mt-auto self-start">
                  <Link to={`/app/auditorias/${a.id}#informe`}>Abrir informe</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </QueryState>
    </>
  )
}
