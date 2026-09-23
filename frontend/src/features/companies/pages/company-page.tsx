import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { FormField } from '@/components/form-field'
import { PageHeader } from '@/components/page-header'
import { QueryState } from '@/components/query-state'
import { Button } from '@/components/ui/button'
import { useMyCompany, useRegisterCompany } from '../api'
import { type CompanyInput, type CompanyValues, companySchema } from '../schemas'

export function CompanyPage() {
  const company = useMyCompany(true)

  return (
    <QueryState isPending={company.isPending} error={company.error}>
      {company.data ? (
        <>
          <PageHeader
            title={company.data.razon_social}
            description="Estos datos alimentan la réplica simulada sobre la que se ejecutan los ataques."
            actions={
              <Button asChild>
                <Link to="/app/planes">Contratar una auditoría</Link>
              </Button>
            }
          />
          <dl className="grid max-w-2xl gap-x-8 gap-y-5 sm:grid-cols-2">
            <Detail label="NIT" value={company.data.nit} />
            <Detail label="Sector" value={company.data.sector} />
            <Detail label="Empleados" value={company.data.cantidad_empleados?.toLocaleString('es-CO')} />
            <Detail label="Dominio principal" value={company.data.dominio_principal} />
            <Detail label="Correo de contacto" value={company.data.correo_contacto} />
            <Detail
              label="Ubicación"
              value={[company.data.ciudad, company.data.pais].filter(Boolean).join(', ') || null}
            />
          </dl>
        </>
      ) : (
        <RegisterCompanyForm />
      )}
    </QueryState>
  )
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="font-medium">{value || '—'}</dd>
    </div>
  )
}

function RegisterCompanyForm() {
  const registerCompany = useRegisterCompany()
  const form = useForm<CompanyInput, unknown, CompanyValues>({ resolver: zodResolver(companySchema) })
  const { errors } = form.formState

  const onSubmit = form.handleSubmit((values) =>
    registerCompany.mutate(values, {
      onSuccess: () => toast.success('Empresa registrada.'),
      onError: (e) => toast.error(e.message),
    }),
  )

  return (
    <>
      <PageHeader
        title="Registra tu empresa"
        description="Con estos datos generamos una réplica simulada de tu organización. Nunca tocamos tu infraestructura real."
      />
      <form onSubmit={onSubmit} noValidate className="grid max-w-2xl gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField label="Razón social" error={errors.razon_social?.message} {...form.register('razon_social')} />
        </div>
        <FormField label="NIT" error={errors.nit?.message} {...form.register('nit')} />
        <FormField label="Sector" hint="Por ejemplo: salud, retail, manufactura." error={errors.sector?.message} {...form.register('sector')} />
        <FormField
          label="Cantidad de empleados"
          type="number"
          inputMode="numeric"
          min={1}
          error={errors.cantidad_empleados?.message}
          {...form.register('cantidad_empleados')}
        />
        <FormField
          label="Dominio principal"
          placeholder="empresa.com.co"
          error={errors.dominio_principal?.message}
          {...form.register('dominio_principal')}
        />
        <FormField label="Correo de contacto" type="email" error={errors.correo_contacto?.message} {...form.register('correo_contacto')} />
        <FormField label="Ciudad" error={errors.ciudad?.message} {...form.register('ciudad')} />
        <div className="sm:col-span-2">
          <Button type="submit" disabled={registerCompany.isPending}>
            {registerCompany.isPending ? 'Registrando…' : 'Registrar empresa'}
          </Button>
        </div>
      </form>
    </>
  )
}
