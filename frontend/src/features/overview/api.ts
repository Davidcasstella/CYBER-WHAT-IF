import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Resumen } from '@/types/api'

export const overviewKeys = { summary: ['resumen'] as const }

export function useSummary() {
  return useQuery({ queryKey: overviewKeys.summary, queryFn: () => api<Resumen>('/resumen') })
}
