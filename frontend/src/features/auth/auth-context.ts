import { createContext, useContext } from 'react'
import type { Usuario } from '@/types/api'

export interface AuthState {
  user: Usuario | null
  isLoading: boolean
  signIn: (correo: string, contrasena: string) => Promise<Usuario>
  signOut: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
