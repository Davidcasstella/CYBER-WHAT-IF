import { Navigate } from 'react-router'
import { useAuth } from '@/features/auth/auth-context'

/** /app lleva al Cliente a su Resumen y al equipo (Admin/Analista) a las auditorías. */
export function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={user?.rol === 'CLIENTE' ? 'resumen' : 'auditorias'} replace />
}
