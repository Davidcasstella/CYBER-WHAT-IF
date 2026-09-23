/** Variables de entorno tipadas. Vite solo expone las que empiezan por VITE_. */
export const env = {
  /** En desarrollo, '/api/v1' pasa por el proxy de Vite hacia FastAPI (vite.config.ts). */
  apiUrl: import.meta.env.VITE_API_URL ?? '/api/v1',
  /** Número del canal comercial (RF-10), formato internacional sin '+'. Debe coincidir con WHATSAPP_NUMBER del backend. */
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? '573000000000',
} as const
