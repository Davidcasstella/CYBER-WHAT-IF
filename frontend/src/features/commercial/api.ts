import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { ContratacionCreada, Plan } from '@/types/api'

export function usePlans() {
  return useQuery({ queryKey: ['planes'], queryFn: () => api<Plan[]>('/planes'), staleTime: 10 * 60_000 })
}

export function useCreateContract() {
  return useMutation({
    mutationFn: (data: { plan_id: number; ataque_id?: number }) =>
      api<ContratacionCreada>('/contrataciones', { method: 'POST', body: data }),
  })
}
