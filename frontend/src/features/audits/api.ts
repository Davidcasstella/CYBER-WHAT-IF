import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Auditoria, Dashboard, Informe } from '@/types/api'

/** Claves de caché centralizadas: invalidar una auditoría refresca todo lo que depende de ella. */
export const auditKeys = {
  all: ['auditorias'] as const,
  detail: (id: number) => [...auditKeys.all, id] as const,
  report: (id: number) => [...auditKeys.detail(id), 'informe'] as const,
  dashboard: (id: number) => [...auditKeys.detail(id), 'dashboard'] as const,
}

export function useAudits() {
  return useQuery({ queryKey: auditKeys.all, queryFn: () => api<Auditoria[]>('/auditorias') })
}

export function useAudit(id: number) {
  return useQuery({ queryKey: auditKeys.detail(id), queryFn: () => api<Auditoria>(`/auditorias/${id}`) })
}

export function useReport(id: number, enabled: boolean) {
  return useQuery({
    queryKey: auditKeys.report(id),
    queryFn: () => api<Informe>(`/auditorias/${id}/informe`),
    enabled,
    retry: false, // 404 = aún en revisión; no reintentar
  })
}

export function useDashboard(id: number, enabled: boolean) {
  return useQuery({
    queryKey: auditKeys.dashboard(id),
    queryFn: () => api<Dashboard>(`/auditorias/${id}/dashboard`),
    enabled,
    retry: false,
  })
}

function useAuditAction(path: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api<unknown>(`/auditorias/${id}/${path}`, { method: 'POST' }),
    onSuccess: (_, id) => queryClient.invalidateQueries({ queryKey: auditKeys.detail(id) }),
  })
}

export const useTakeAudit = () => useAuditAction('tomar')
export const useRunAudit = () => useAuditAction('ejecutar')
export const useValidateReport = () => useAuditAction('informe/validar')
