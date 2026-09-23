import type { ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

/** Estados de carga y error uniformes para cualquier consulta de TanStack Query. */
export function QueryState({
  isPending,
  error,
  children,
}: {
  isPending: boolean
  error: Error | null
  children: ReactNode
}) {
  if (isPending) {
    return (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No se pudo cargar la información</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }
  return children
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border-border rounded-lg border border-dashed px-6 py-12 text-center">
      <p className="font-heading text-xl">{title}</p>
      {children && <div className="text-muted-foreground mx-auto mt-2 max-w-md space-y-4">{children}</div>}
    </div>
  )
}
