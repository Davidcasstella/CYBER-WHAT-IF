import { Lock, Menu, ShieldCheck, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/features/auth/auth-context'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '../content'
import { useActiveSection } from '../use-active-section'
import { BrandLogo } from './brand-logo'

const SECTION_IDS = NAV_LINKS.map((l) => l.id)

export function LandingHeader() {
  const { user } = useAuth()
  const active = useActiveSection(SECTION_IDS)
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Barra superior de confianza */}
      <div className="text-brand-slate hidden bg-[#f3f2ee] text-sm sm:block">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-6">
          <p className="flex items-center gap-2">
            <ShieldCheck className="text-brand-600 size-4" aria-hidden />
            Auditorías simuladas para empresas
          </p>
          <p className="flex items-center gap-2">
            <Lock className="text-brand-600 size-4" aria-hidden />
            Entorno aislado · Sin afectar tus sistemas
          </p>
        </div>
      </div>

      <header className="border-brand-100 sticky top-0 z-50 border-b bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <a href="#inicio" aria-label="CyberWhat-If, ir al inicio" className="shrink-0">
            <BrandLogo />
          </a>

          <nav aria-label="Secciones" className="hidden flex-1 justify-center gap-2 lg:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                aria-current={active === link.id ? 'true' : undefined}
                className={cn(
                  'relative px-4 py-2 text-[15px] font-semibold transition-colors',
                  'text-brand-ink hover:text-brand-600',
                  'after:bg-brand-bronze after:absolute after:inset-x-4 after:-bottom-1 after:h-0.5 after:rounded-full after:transition-opacity',
                  active === link.id ? 'after:opacity-100' : 'after:opacity-0',
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-3 sm:flex lg:ml-0">
            {user ? (
              <PrimaryLink to="/app">Ir a mi panel</PrimaryLink>
            ) : (
              <>
                <Link
                  to="/login"
                  className="border-brand-ink/80 text-brand-ink hover:bg-brand-50 inline-flex h-12 items-center gap-2 rounded-lg border px-5 font-semibold transition-colors"
                >
                  <UserRound className="size-5" aria-hidden />
                  Ingresar
                </Link>
                <PrimaryLink to="/registro">Comenzar auditoría</PrimaryLink>
              </>
            )}
          </div>

          <button
            type="button"
            className="text-brand-ink ml-auto rounded-md p-2 lg:hidden sm:ml-0"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {open && (
          <nav id="menu-movil" aria-label="Secciones" className="border-brand-100 border-t bg-white px-4 pb-6 lg:hidden">
            <ul className="py-2">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={() => setOpen(false)}
                    className="text-brand-ink block rounded-md px-2 py-3 font-semibold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="grid gap-3 sm:hidden">
              {user ? (
                <PrimaryLink to="/app">Ir a mi panel</PrimaryLink>
              ) : (
                <>
                  <Link to="/login" className="border-brand-600 text-brand-ink flex h-12 items-center justify-center rounded-lg border-2 font-semibold">
                    Ingresar
                  </Link>
                  <PrimaryLink to="/registro">Comenzar auditoría</PrimaryLink>
                </>
              )}
            </div>
          </nav>
        )}
      </header>
    </>
  )
}

function PrimaryLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="bg-brand-600 shadow-brand-600/20 hover:bg-brand-500 inline-flex h-12 items-center justify-center rounded-lg px-6 font-semibold text-white shadow-lg transition-colors"
    >
      {children}
    </Link>
  )
}
