import { LogOut, Moon, Sun } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/auth-context'
import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'
import type { Rol } from '@/types/api'

interface NavItem {
  to: string
  label: string
  roles: Rol[]
}

/** Qué ve cada rol en la navegación (sección 4.3 del documento de Aterrizaje). */
const NAV: NavItem[] = [
  { to: '/app/auditorias', label: 'Auditorías', roles: ['ADMIN', 'ANALISTA', 'CLIENTE'] },
  { to: '/app/empresa', label: 'Mi empresa', roles: ['CLIENTE'] },
  { to: '/app/planes', label: 'Planes', roles: ['CLIENTE'] },
  { to: '/app/admin/usuarios', label: 'Usuarios', roles: ['ADMIN'] },
]

export function AppShell() {
  const { user, signOut } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  if (!user) return null

  return (
    <div className="min-h-svh">
      <a href="#contenido" className="bg-primary text-primary-foreground sr-only z-50 p-2 focus:not-sr-only focus:fixed">
        Saltar al contenido
      </a>
      <header className="border-border bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-1 px-4 py-2 sm:h-16 sm:flex-nowrap sm:px-6 sm:py-0">
          <NavLink to="/app" className="font-heading shrink-0 text-xl">
            CyberWhat-If
          </NavLink>
          {/* En móvil la navegación baja a su propia fila para no recortar etiquetas. */}
          <nav aria-label="Principal" className="order-last -mx-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:mx-0 sm:w-auto sm:flex-1">
            {NAV.filter((item) => item.roles.includes(user.rol)).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors',
                    isActive ? 'bg-secondary font-semibold' : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="ml-auto shrink-0">
                {user.nombre.split(' ')[0]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="font-medium">{user.nombre}</p>
                <p className="text-muted-foreground truncate text-xs">{user.correo}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
                {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
                {resolvedTheme === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={signOut}>
                <LogOut />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main id="contenido" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
