import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

/** Tarjeta base del panel: título serif, descripción y un enlace opcional a la derecha. */
export function Panel({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string
  description?: string
  action?: { to: string; label: string }
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn('bg-card border-border min-w-0 rounded-xl border p-5 sm:p-6', className)}>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div>
          <h2 className="text-2xl">{title}</h2>
          {description && <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>}
        </div>
        {action && (
          <Link
            to={action.to}
            className="text-primary inline-flex items-center gap-1.5 text-sm font-semibold hover:underline hover:underline-offset-4"
          >
            {action.label}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </header>
      {children}
    </section>
  )
}

/** Punto de color + texto (nivel de riesgo o criticidad). */
export function LevelDot({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span aria-hidden className={cn('size-2.5 shrink-0 rounded-full', dot)} />
      {label}
    </span>
  )
}
