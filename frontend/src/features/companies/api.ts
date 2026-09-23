import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authKeys } from '@/features/auth/api'
import { ApiError, api } from '@/lib/api-client'
import type { EmpresaCliente } from '@/types/api'
import type { CompanyValues } from './schemas'

export const companyKeys = { mine: ['empresas', 'mia'] as const }

export function useMyCompany(enabled: boolean) {
  return useQuery({
    queryKey: companyKeys.mine,
    queryFn: async () => {
      try {
        return await api<EmpresaCliente>('/empresas/mia')
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null // aún no registrada
        throw e
      }
    },
    enabled,
  })
}

export function useRegisterCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CompanyValues) => api<EmpresaCliente>('/empresas', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.mine })
      queryClient.invalidateQueries({ queryKey: authKeys.me }) // empresa_cliente_id cambió
    },
  })
}
