import { Navigate, Outlet, useLocation } from 'react-router'
import { Skeleton } from '@/components/ui/skeleton'
import type { Rol } from '@/types/api'
import { useAuth } from './auth-context'

/**
 * Protege un grupo de rutas. Sin `roles`, basta con haber iniciado sesión.
 * Es solo UX: la autorización real la hace el backend en cada endpoint (RNF-02).
 */
export function RequireAuth({ roles }: { roles?: Rol[] }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-8" aria-busy="true">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/app" replace />
  }
  return <Outlet />
}
