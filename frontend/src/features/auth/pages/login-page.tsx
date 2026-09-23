import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { FormField } from '@/components/form-field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api-client'
import { useAuth } from '../auth-context'
import { AuthLayout } from '../components/auth-layout'
import { type LoginValues, loginSchema } from '../schemas'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/app'
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })
  const { errors, isSubmitting } = form.formState

  const onSubmit = form.handleSubmit(async ({ correo, contrasena }) => {
    setError(null)
    try {
      await signIn(correo, contrasena)
      navigate(from, { replace: true })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No pudimos conectar con el servidor. Intenta de nuevo.')
    }
  })

  return (
    <AuthLayout title="Inicia sesión">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormField label="Correo" type="email" autoComplete="email" error={errors.correo?.message} {...form.register('correo')} />
        <FormField
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.contrasena?.message}
          {...form.register('contrasena')}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </Button>
      </form>
      <p className="text-muted-foreground text-sm">
        ¿Tu empresa aún no tiene cuenta?{' '}
        <Link to="/registro" className="text-foreground font-medium underline underline-offset-4">
          Crear cuenta
        </Link>
      </p>
    </AuthLayout>
  )
}
