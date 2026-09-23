import type { ReactNode } from 'react'

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pb-8">
      <div className="max-w-2xl space-y-1">
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </header>
  )
}
