import { z } from 'zod'

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || undefined)
    .optional()

/** Refleja EmpresaClienteCreate del backend (RF-01). */
export const companySchema = z.object({
  razon_social: z.string().trim().min(2, 'Escribe la razón social').max(200),
  nit: optionalText(30),
  sector: optionalText(100),
  cantidad_empleados: z.coerce
    .number({ error: 'Escribe un número' })
    .int()
    .min(1, 'Debe ser al menos 1')
    .max(1_000_000),
  dominio_principal: z
    .string()
    .trim()
    .regex(/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/, 'Escribe un dominio como empresa.com.co')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  correo_contacto: z.email('Escribe un correo válido').optional().or(z.literal('').transform(() => undefined)),
  pais: optionalText(80),
  ciudad: optionalText(80),
})

export type CompanyInput = z.input<typeof companySchema>
export type CompanyValues = z.output<typeof companySchema>
