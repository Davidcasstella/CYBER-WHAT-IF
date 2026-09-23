import { Link } from 'react-router'
import { PageHeader } from '@/components/page-header'
import { EmptyState, QueryState } from '@/components/query-state'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/auth-context'
import { formatDateTime } from '@/lib/format'
import type { Auditoria, NivelRiesgo } from '@/types/api'
import { useAudits } from '../api'
import { RiskBadge } from '../components/risk-badge'
import { RISK_LEVELS } from '../risk'

const ESTADO_LABEL: Record<Auditoria['estado'], string> = {
  PENDIENTE: 'Pendiente de ejecución',
  EN_PROCESO: 'En ejecución',
  COMPLETADA: 'Completada',
}

function highestRisk(auditoria: Auditoria): NivelRiesgo | null {
  const levels = auditoria.ejecuciones.flatMap((e) => (e.resultado ? [e.resultado.nivel_riesgo] : []))
  return levels.length ? levels.reduce((a, b) => (RISK_LEVELS.indexOf(b) > RISK_LEVELS.indexOf(a) ? b : a)) : null
}

export function AuditsPage() {
  const { user } = useAuth()
  const audits = useAudits()
  const isClient = user?.rol === 'CLIENTE'

  return (
    <>
      <PageHeader
        title={isClient ? 'Tus auditorías' : 'Auditorías'}
        description={
          isClient
            ? 'Cada auditoría ejecuta los ataques de tu plan sobre una réplica simulada de tu empresa.'
            : 'Todas las auditorías de la plataforma. Ejecuta las pendientes y valida sus informes.'
        }
      />
      <QueryState isPending={audits.isPending} error={audits.error}>
        {audits.data?.length === 0 ? (
          <EmptyState title="Aún no hay auditorías">
            {isClient && (
              <>
                <p>Tu primera auditoría empieza cuando contratas un plan y confirmamos el pago.</p>
                <Button asChild>
                  <Link to="/app/planes">Ver planes</Link>
                </Button>
              </>
            )}
          </EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Auditoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ataques</TableHead>
                <TableHead>Riesgo máximo</TableHead>
                <TableHead>Finalizó</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.data?.map((a) => {
                const risk = highestRisk(a)
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link to={`/app/auditorias/${a.id}`} className="font-medium underline-offset-4 hover:underline">
                        Auditoría #{a.id}
                      </Link>
                    </TableCell>
                    <TableCell>{ESTADO_LABEL[a.estado]}</TableCell>
                    <TableCell>{a.ejecuciones.map((e) => e.ataque.nombre).join(', ')}</TableCell>
                    <TableCell>{risk ? <RiskBadge level={risk} /> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>{formatDateTime(a.fecha_fin)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </QueryState>
    </>
  )
}
