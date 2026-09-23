import type { ReactNode } from 'react'

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pb-6">
      <div className="max-w-3xl space-y-1">
        <h1 className="text-4xl leading-tight sm:text-5xl">{title}</h1>
        {description && <p className="text-muted-foreground text-lg">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </header>
  )
}
