/**
 * Tipos que reflejan los esquemas Pydantic del backend (app/modules/<modulo>/schemas.py).
 * Si cambia un esquema allá, se actualiza aquí. Swagger en /docs muestra la fuente de verdad.
 */

export type Rol = 'ADMIN' | 'ANALISTA' | 'CLIENTE'
export type NivelRiesgo = 'BAJO' | 'MEDIO' | 'ALTO' | 'URGENTE'
export type Criticidad = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'
export type EstadoAuditoria = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA'
export type EstadoInforme = 'BORRADOR' | 'VALIDADO'
export type TipoPlan = 'INDIVIDUAL' | 'COMPLETO'

/** Los montos llegan como string (Decimal serializado) para no perder precisión. */
export type Decimal = string

export interface Usuario {
  id: number
  nombre: string
  correo: string
  rol: Rol
  empresa_cliente_id: number | null
  activo: boolean
}

export interface EmpresaCliente {
  id: number
  razon_social: string
  nit: string | null
  sector: string | null
  cantidad_empleados: number | null
  dominio_principal: string | null
  correo_contacto: string | null
  pais: string | null
  ciudad: string | null
  fecha_registro: string
}

export interface Ataque {
  id: number
  nombre: string
  tipo?: string | null
  tecnica_mitre_principal: string | null
}

export interface Plan {
  id: number
  nombre: string
  tipo: TipoPlan
  precio: Decimal
  duracion_dias: number | null
  descripcion: string | null
  ataques: Ataque[]
}

export interface ContratacionCreada {
  contratacion: { id: number; plan_id: number; estado_pago: string; fecha: string }
  whatsapp_url: string
}

export interface ResultadoImpacto {
  impacto_tecnico: Decimal | null
  impacto_operacional: Decimal | null
  impacto_financiero: Decimal | null
  moneda: string
  nivel_riesgo: NivelRiesgo
  probabilidad_ocurrencia: Decimal | null
  tiempo_recuperacion_horas: number | null
}

export interface Ejecucion {
  id: number
  ataque: Ataque
  estado_ejecucion: 'PENDIENTE' | 'EJECUTADO' | 'FALLIDO'
  fecha_ejecucion: string | null
  resultado: ResultadoImpacto | null
}

export interface Auditoria {
  id: number
  contratacion_id: number
  empresa_simulada_id: number
  analista_usuario_id: number | null
  estado: EstadoAuditoria
  fecha_inicio: string | null
  fecha_fin: string | null
  ejecuciones: Ejecucion[]
}

export interface Recomendacion {
  id: number
  descripcion: string
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA'
}

export interface Vulnerabilidad {
  id: number
  descripcion: string
  criticidad: Criticidad
  objetivo_descripcion: string | null
  recomendaciones: Recomendacion[]
}

export interface Informe {
  id: number
  auditoria_id: number
  estado: EstadoInforme
  formato: 'PDF' | 'HTML'
  fecha_generacion: string
  fecha_validacion: string | null
  vulnerabilidades: Vulnerabilidad[]
}

export interface Dashboard {
  auditoria_id: number
  impacto_financiero_total: Decimal
  moneda: string
  riesgo_maximo: NivelRiesgo
  por_ataque: {
    ataque: string
    nivel_riesgo: NivelRiesgo
    impacto_tecnico: Decimal
    impacto_operacional: Decimal
    impacto_financiero: Decimal
    vulnerabilidades: number
  }[]
}
