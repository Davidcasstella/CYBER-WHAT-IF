import {
  Building2,
  ChartColumn,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileSearch,
  House,
  LogOut,
  type LucideIcon,
  Menu,
  Moon,
  Settings,
  Sun,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useMatches } from 'react-router'
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
import { useMyCompany } from '@/features/companies/api'
import { ShieldMark } from '@/features/landing/components/brand-logo'
import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'
import type { Rol } from '@/types/api'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  roles: Rol[]
}

/** Qué ve cada rol en la navegación (sección 4.3 del documento de Aterrizaje). */
const NAV: NavItem[] = [
  { to: '/app/resumen', label: 'Resumen', icon: House, roles: ['CLIENTE'] },
  { to: '/app/empresa', label: 'Mi empresa', icon: Building2, roles: ['CLIENTE'] },
  { to: '/app/auditorias', label: 'Auditorías', icon: FileSearch, roles: ['ADMIN', 'ANALISTA', 'CLIENTE'] },
  { to: '/app/informes', label: 'Informes', icon: ChartColumn, roles: ['ADMIN', 'ANALISTA', 'CLIENTE'] },
  { to: '/app/planes', label: 'Planes', icon: CreditCard, roles: ['CLIENTE'] },
  { to: '/app/admin/usuarios', label: 'Usuarios', icon: Users, roles: ['ADMIN'] },
  { to: '/app/configuracion', label: 'Configuración', icon: Settings, roles: ['ADMIN', 'ANALISTA', 'CLIENTE'] },
]

const ROL_LABEL: Record<Rol, string> = { ADMIN: 'Administrador', ANALISTA: 'Analista', CLIENTE: 'Cliente' }

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

export function AppShell() {
  const { user } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (!user) return null

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[17rem_1fr]">
      <a href="#contenido" className="bg-primary text-primary-foreground sr-only z-50 p-2 focus:not-sr-only focus:fixed">
        Saltar al contenido
      </a>

      {/* Barra lateral fija en escritorio */}
      <aside className="bg-sidebar border-sidebar-border hidden border-r lg:block">
        <div className="sticky top-0 flex h-svh flex-col overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      {/* Menú lateral deslizante en móvil */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="bg-sidebar relative flex h-full w-72 flex-col overflow-y-auto shadow-xl">
            <button
              type="button"
              className="absolute top-4 right-4 rounded-md p-1.5"
              aria-label="Cerrar menú"
              onClick={() => setDrawerOpen(false)}
            >
              <X className="size-5" />
            </button>
            {/* Cerrar el menú al elegir un destino. */}
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="min-w-0">
        <TopBar onOpenMenu={() => setDrawerOpen(true)} />
        <main id="contenido" className="mx-auto max-w-[88rem] px-4 pt-6 pb-12 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()
  const company = useMyCompany(user?.rol === 'CLIENTE' && user.empresa_cliente_id != null)
  if (!user) return null

  return (
    <div className="flex h-full flex-col px-4 py-7">
      <Link to="/app" onClick={onNavigate} className="mb-10 flex flex-col items-center gap-2 text-center">
        <ShieldMark className="h-14 w-12" />
        <span className="font-heading text-foreground text-[1.7rem] leading-none font-bold tracking-tight">
          CyberWhat-If
        </span>
        <span className="text-muted-foreground text-[0.7rem] leading-snug tracking-[0.12em]">
          AUDITA HOY.
          <br />
          UN MAÑANA MÁS SEGURO.
        </span>
      </Link>

      <nav aria-label="Principal" className="flex-1">
        <ul className="space-y-1.5">
          {NAV.filter((item) => item.roles.includes(user.rol)).map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3.5 rounded-lg px-4 py-3 text-[15px] transition-colors',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm'
                      : 'text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )
                }
              >
                <Icon className="size-5 shrink-0" strokeWidth={1.8} aria-hidden />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-sidebar-border mt-6 border-t pt-5">
        <Link to="/app/configuracion" onClick={onNavigate} className="hover:bg-sidebar-accent flex items-center gap-3 rounded-lg p-2">
          <span className="bg-foreground text-background flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
            {initials(user.nombre)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{user.nombre}</span>
            <span className="text-muted-foreground block truncate text-sm">
              {company.data?.razon_social ?? ROL_LABEL[user.rol]}
            </span>
          </span>
          <ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden />
        </Link>
        <p className="text-muted-foreground mt-6 px-2 text-xs leading-relaxed">
          Seguridad hoy.
          <br />
          Más oportunidades mañana.
        </p>
      </div>
    </div>
  )
}

function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { user, signOut } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  // Cada ruta declara su migaja en `handle: { crumb }` (ver app/router.tsx).
  const crumb = useMatches()
    .map((m) => (m.handle as { crumb?: string } | undefined)?.crumb)
    .filter(Boolean)
    .at(-1)

  if (!user) return null

  return (
    <header className="border-border bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[88rem] items-center gap-4 px-4 sm:px-8">
        <button type="button" className="-ml-1 rounded-md p-2 lg:hidden" aria-label="Abrir menú" onClick={onOpenMenu}>
          <Menu className="size-5" />
        </button>
        <nav aria-label="Ruta" className="text-muted-foreground min-w-0 flex-1 truncate text-sm">
          <Link to="/app" className="hover:text-foreground">
            Panel
          </Link>
          {crumb && (
            <>
              <span className="mx-2" aria-hidden>
                /
              </span>
              <span className="text-foreground font-medium" aria-current="page">
                {crumb}
              </span>
            </>
          )}
        </nav>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <span className="bg-foreground text-background flex size-7 items-center justify-center rounded-full text-xs font-semibold">
                {initials(user.nombre)}
              </span>
              <span className="hidden sm:inline">Mi cuenta</span>
              <ChevronDown className="size-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="font-normal">
              <p className="font-medium">{user.nombre}</p>
              <p className="text-muted-foreground truncate text-xs">{user.correo}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/app/configuracion">
                <Settings />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
              {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
              {resolvedTheme === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={signOut}>
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
