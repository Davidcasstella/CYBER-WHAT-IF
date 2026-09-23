import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { QueryState } from '@/components/query-state'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Plan } from '@/types/api'
import { useCreateContract, usePlans } from '../api'

export function PlansPage() {
  const { user } = useAuth()
  const plans = usePlans()
  const hasCompany = user?.empresa_cliente_id != null

  return (
    <>
      <PageHeader
        title="Elige qué quieres auditar"
        description="Al contratar te llevamos a WhatsApp para confirmar el pago. La auditoría empieza en cuanto lo recibimos."
      />
      {!hasCompany && (
        <Alert className="mb-8">
          <AlertDescription>
            Antes de contratar, <Link to="/app/empresa" className="font-medium underline underline-offset-4">registra tu empresa</Link>.
          </AlertDescription>
        </Alert>
      )}
      <QueryState isPending={plans.isPending} error={plans.error}>
        {/* Dos planes de peso distinto: el completo ocupa más espacio porque incluye más. */}
        <div className="grid items-start gap-6 lg:grid-cols-[2fr_3fr]">
          {plans.data?.map((plan) => (
            <PlanCard key={plan.id} plan={plan} disabled={!hasCompany} />
          ))}
        </div>
      </QueryState>
    </>
  )
}

function PlanCard({ plan, disabled }: { plan: Plan; disabled: boolean }) {
  const isIndividual = plan.tipo === 'INDIVIDUAL'
  const [ataqueId, setAtaqueId] = useState<number | undefined>(isIndividual ? plan.ataques[0]?.id : undefined)
  const contract = useCreateContract()

  const onContract = () =>
    contract.mutate(
      { plan_id: plan.id, ataque_id: ataqueId },
      {
        onSuccess: ({ whatsapp_url }) => {
          // RF-10: la contratación se formaliza por WhatsApp.
          window.open(whatsapp_url, '_blank', 'noopener,noreferrer')
          toast.success('Contratación registrada. Termina el pago en WhatsApp.')
        },
        onError: (e) => toast.error(e.message),
      },
    )

  return (
    <article
      className={cn(
        'bg-card space-y-6 rounded-lg border p-6',
        isIndividual ? 'border-border' : 'border-primary border-2 lg:p-8',
      )}
    >
      <div className="space-y-2">
        <h2 className="text-2xl">{plan.nombre}</h2>
        <p className="text-muted-foreground">{plan.descripcion}</p>
      </div>
      <p className="font-heading text-4xl">{formatMoney(plan.precio)}</p>

      {isIndividual ? (
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-semibold">¿Qué ataque quieres simular?</legend>
          {plan.ataques.map((a) => (
            <label key={a.id} className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="radio"
                name={`ataque-${plan.id}`}
                value={a.id}
                checked={ataqueId === a.id}
                onChange={() => setAtaqueId(a.id)}
                className="accent-primary size-4"
              />
              {a.nombre}
            </label>
          ))}
        </fieldset>
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {plan.ataques.map((a) => (
            <li key={a.id}>{a.nombre}</li>
          ))}
          <li>Dashboard con el impacto consolidado</li>
        </ul>
      )}

      <Button
        className="w-full"
        variant={isIndividual ? 'outline' : 'default'}
        disabled={disabled || contract.isPending}
        onClick={onContract}
      >
        {contract.isPending ? 'Registrando…' : `Contratar ${plan.nombre.toLowerCase()}`}
      </Button>
    </article>
  )
}
