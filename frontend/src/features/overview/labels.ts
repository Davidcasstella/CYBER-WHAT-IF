import type { Criticidad, NivelRiesgo, Resumen } from '@/types/api'

/** Etiquetas y colores de nivel. El color siempre va junto a su texto, nunca solo. */

export const CRITICIDAD: Record<Criticidad, { label: string; dot: string }> = {
  BAJA: { label: 'Baja', dot: 'bg-risk-bajo' },
  MEDIA: { label: 'Media', dot: 'bg-risk-medio' },
  ALTA: { label: 'Alta', dot: 'bg-risk-alto' },
  CRITICA: { label: 'Crítica', dot: 'bg-risk-urgente' },
}

export const NIVEL_RIESGO: Record<NivelRiesgo, { label: string; dot: string }> = {
  BAJO: { label: 'Bajo', dot: 'bg-risk-bajo' },
  MEDIO: { label: 'Medio', dot: 'bg-risk-medio' },
  ALTO: { label: 'Alto', dot: 'bg-risk-alto' },
  URGENTE: { label: 'Urgente', dot: 'bg-risk-urgente' },
}

export const ESTADO_HALLAZGO: Record<Resumen['hallazgos'][number]['estado'], string> = {
  ABIERTA: 'Abierto',
  EN_REMEDIACION: 'En progreso',
  CERRADA: 'Cerrado',
}

export const DIMENSIONES = [
  { key: 'tecnico', label: 'Técnico' },
  { key: 'operacional', label: 'Operacional' },
  { key: 'financiero', label: 'Financiero' },
  { key: 'riesgo', label: 'Riesgo' },
] as const
