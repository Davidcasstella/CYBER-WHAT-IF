import type { NivelRiesgo } from '@/types/api'

export const RISK_LEVELS: NivelRiesgo[] = ['BAJO', 'MEDIO', 'ALTO', 'URGENTE']

export const RISK_LABEL: Record<NivelRiesgo, string> = {
  BAJO: 'Bajo',
  MEDIO: 'Medio',
  ALTO: 'Alto',
  URGENTE: 'Urgente',
}

/** Clases literales (Tailwind necesita verlas completas en el código fuente). */
export const RISK_BG: Record<NivelRiesgo, string> = {
  BAJO: 'bg-risk-bajo',
  MEDIO: 'bg-risk-medio',
  ALTO: 'bg-risk-alto',
  URGENTE: 'bg-risk-urgente',
}

export const RISK_TEXT: Record<NivelRiesgo, string> = {
  BAJO: 'text-risk-bajo',
  MEDIO: 'text-risk-medio',
  ALTO: 'text-risk-alto',
  URGENTE: 'text-risk-urgente',
}
