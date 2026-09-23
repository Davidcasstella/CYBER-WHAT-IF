import { useQuery, useQueryClient } from '@tanstack/react-query'
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { UNAUTHORIZED_EVENT } from '@/lib/api-client'
import { tokenStorage } from '@/lib/token-storage'
import { authKeys, fetchMe, login } from './api'
import { AuthContext, type AuthState } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [hasToken, setHasToken] = useState(() => tokenStorage.get() !== null)

  const me = useQuery({
    queryKey: authKeys.me,
    queryFn: fetchMe,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60_000,
  })

  const signOut = useCallback(() => {
    tokenStorage.clear()
    setHasToken(false)
    queryClient.clear() // no dejar datos de un usuario en caché para el siguiente
  }, [queryClient])

  const signIn = useCallback(
    async (correo: string, contrasena: string) => {
      const { access_token } = await login(correo, contrasena)
      tokenStorage.set(access_token)
      setHasToken(true)
      return queryClient.fetchQuery({ queryKey: authKeys.me, queryFn: fetchMe })
    },
    [queryClient],
  )

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, signOut)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, signOut)
  }, [signOut])

  const value = useMemo<AuthState>(
    () => ({
      user: hasToken ? (me.data ?? null) : null,
      isLoading: hasToken && me.isPending,
      signIn,
      signOut,
    }),
    [hasToken, me.data, me.isPending, signIn, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
