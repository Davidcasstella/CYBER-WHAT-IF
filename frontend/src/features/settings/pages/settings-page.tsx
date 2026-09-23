import { LogOut, Monitor, Moon, Sun } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'
import { type Theme, useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'
import type { Rol } from '@/types/api'

const ROL_LABEL: Record<Rol, string> = { ADMIN: 'Administrador', ANALISTA: 'Analista', CLIENTE: 'Cliente' }

const THEMES: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Según el sistema', icon: Monitor },
]

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  if (!user) return null

  return (
    <>
      <PageHeader title="Configuración" description="Tu cuenta y tus preferencias de visualización." />
      <div className="grid max-w-3xl gap-5">
        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="mb-4 text-2xl">Tu cuenta</h2>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground text-sm">Nombre</dt>
              <dd className="font-medium">{user.nombre}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Correo</dt>
              <dd className="font-medium break-all">{user.correo}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Rol</dt>
              <dd className="font-medium">{ROL_LABEL[user.rol]}</dd>
            </div>
          </dl>
        </section>

        <section className="bg-card border-border rounded-xl border p-6">
          <fieldset>
            <legend className="font-heading mb-4 text-2xl font-semibold">Apariencia</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {THEMES.map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors',
                    theme === value ? 'border-primary bg-teal-soft' : 'border-border hover:bg-muted',
                  )}
                >
                  <input
                    type="radio"
                    name="tema"
                    value={value}
                    checked={theme === value}
                    onChange={() => setTheme(value)}
                    className="accent-primary"
                  />
                  <Icon className="size-4" aria-hidden />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="bg-card border-border flex flex-wrap items-center justify-between gap-4 rounded-xl border p-6">
          <p className="text-muted-foreground">Cierra tu sesión en este navegador.</p>
          <Button variant="outline" onClick={signOut}>
            <LogOut aria-hidden />
            Cerrar sesión
          </Button>
        </section>
      </div>
    </>
  )
}
