import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { FormField } from '@/components/form-field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api-client'
import { register } from '../api'
import { useAuth } from '../auth-context'
import { AuthLayout } from '../components/auth-layout'
import { type RegisterValues, registerSchema } from '../schemas'

export function RegisterPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })
  const { errors, isSubmitting } = form.formState

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null)
    try {
      await register(values)
      await signIn(values.correo, values.contrasena)
      // RNF-03: el siguiente paso natural es registrar la empresa.
      navigate('/app/empresa', { replace: true })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No pudimos crear la cuenta. Intenta de nuevo.')
    }
  })

  return (
    <AuthLayout title="Crea la cuenta de tu empresa">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormField label="Tu nombre" autoComplete="name" error={errors.nombre?.message} {...form.register('nombre')} />
        <FormField
          label="Correo de trabajo"
          type="email"
          autoComplete="email"
          error={errors.correo?.message}
          {...form.register('correo')}
        />
        <FormField
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          hint="Mínimo 8 caracteres."
          error={errors.contrasena?.message}
          {...form.register('contrasena')}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
      <p className="text-muted-foreground text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-foreground font-medium underline underline-offset-4">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
