import { ArrowRight, Building2, CircleCheck, Clock, FileText, Laptop, type LucideIcon, Mail, UserRound } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format'
import type { Resumen } from '@/types/api'
import { CRITICIDAD, ESTADO_HALLAZGO, NIVEL_RIESGO } from '../labels'
import { LevelDot, Panel } from './panel'

export function CompanyStatus({ resumen }: { resumen: Resumen }) {
  const { empresa, auditoria_actual: actual, auditorias_en_revision: enRevision } = resumen
  if (!empresa) return null

  return (
    <section className="bg-card border-border flex flex-wrap items-center gap-x-6 gap-y-4 rounded-xl border p-5 sm:p-6">
      <span className="bg-teal-soft text-primary flex size-14 shrink-0 items-center justify-center rounded-full">
        <Building2 className="size-6" strokeWidth={1.8} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-xl">Empresa auditada: {empresa.razon_social}</h2>
        <p className="text-muted-foreground text-sm">
          {[
            empresa.sector && `Sector: ${empresa.sector}`,
            empresa.cantidad_empleados && `Tamaño: ${empresa.cantidad_empleados.toLocaleString('es-CO')} empleados`,
          ]
            .filter(Boolean)
            .join('  |  ') || 'Completa los datos de tu empresa para una réplica más fiel.'}
        </p>
      </div>
      <div className="space-y-1.5 text-sm">
        {actual && (
          <>
            <p className="bg-risk-bajo/12 text-risk-bajo inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold">
              <CircleCheck className="size-4" aria-hidden />
              Auditoría validada
            </p>
            <p className="text-muted-foreground">Última actualización: {formatDateTime(actual.fecha_actualizacion)}</p>
          </>
        )}
        {enRevision > 0 && (
          <p className="text-muted-foreground inline-flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden />
            {enRevision === 1 ? '1 auditoría en proceso' : `${enRevision} auditorías en proceso`}
          </p>
        )}
      </div>
    </section>
  )
}

function scenarioIcon(name: string): LucideIcon {
  const n = name.toLowerCase()
  if (n.includes('phishing')) return Mail
  if (n.includes('ransomware')) return Laptop
  return UserRound
}

export function ScenariosPanel({ resumen, auditoriaId }: { resumen: Resumen; auditoriaId: number }) {
  return (
    <Panel
      title="Escenarios simulados"
      description="Resultados de los escenarios evaluados en la última auditoría."
      action={{ to: `/app/auditorias/${auditoriaId}`, label: 'Ver todos' }}
    >
      <ul className="space-y-3">
        {resumen.escenarios.map((e) => {
          const Icon = scenarioIcon(e.ataque)
          return (
            <li key={e.ataque} className="border-border flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border p-3.5">
              <Icon className="text-foreground size-6 shrink-0" strokeWidth={1.6} aria-hidden />
              <div className="min-w-0 flex-1 basis-40">
                <p className="font-semibold">{e.ataque}</p>
                {e.descripcion && <p className="text-muted-foreground truncate text-xs">{e.descripcion}</p>}
              </div>
              {e.estado_ejecucion === 'EJECUTADO' ? (
                <span className="bg-risk-bajo/12 text-risk-bajo inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-semibold">
                  <CircleCheck className="size-4" aria-hidden />
                  Evaluado
                </span>
              ) : (
                <span className="text-muted-foreground text-sm">Pendiente</span>
              )}
              <span className="min-w-20">
                {e.nivel_riesgo && <LevelDot dot={NIVEL_RIESGO[e.nivel_riesgo].dot} label={NIVEL_RIESGO[e.nivel_riesgo].label} />}
              </span>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

export function FindingsPanel({ resumen, auditoriaId }: { resumen: Resumen; auditoriaId: number }) {
  return (
    <Panel
      title="Hallazgos prioritarios"
      description="Los hallazgos más críticos de la auditoría más reciente."
      action={{ to: `/app/auditorias/${auditoriaId}#informe`, label: 'Ver todos' }}
    >
      {resumen.hallazgos.length === 0 ? (
        <p className="text-muted-foreground text-sm">La auditoría no encontró vulnerabilidades.</p>
      ) : (
        <div className="border-border overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[36rem] text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-semibold">Hallazgo</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Escenario</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Nivel</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {resumen.hallazgos.map((h) => (
                <tr key={h.id}>
                  <td className="px-4 py-3">{h.descripcion}</td>
                  <td className="text-muted-foreground px-4 py-3">{h.escenario}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <LevelDot dot={CRITICIDAD[h.criticidad].dot} label={CRITICIDAD[h.criticidad].label} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-teal-soft text-primary rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap">
                      {ESTADO_HALLAZGO[h.estado]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}

const REPORT_SECTIONS = ['Resumen de impacto', 'Hallazgos detallados', 'Recomendaciones prácticas']

export function ReportPanel({ auditoriaId }: { auditoriaId: number }) {
  return (
    <Panel title="Informe de auditoría" className="@container">
      <div className="grid gap-6 @xl:grid-cols-[1fr_auto]">
        <div className="flex gap-4">
          <span className="bg-muted flex size-16 shrink-0 items-center justify-center rounded-xl">
            <FileText className="size-8" strokeWidth={1.5} aria-hidden />
          </span>
          <div className="space-y-3">
            <div>
              <p className="font-semibold">Revisado por un analista</p>
              <p className="text-muted-foreground text-sm">
                Nuestro equipo validó los resultados y preparó recomendaciones para tu empresa.
              </p>
            </div>
            <Button asChild>
              <Link to={`/app/auditorias/${auditoriaId}#informe`}>
                Ver informe
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
        <ul className="@xl:border-border grid gap-2.5 text-sm @xl:border-l @xl:pl-6">
          {REPORT_SECTIONS.map((s) => (
            <li key={s} className="text-muted-foreground flex items-center gap-2">
              <CircleCheck className="text-risk-bajo size-4" aria-hidden />
              {s}
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  )
}
