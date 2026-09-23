import { z } from 'zod'

export const loginSchema = z.object({
  correo: z.email('Escribe un correo válido'),
  contrasena: z.string().min(1, 'Escribe tu contraseña'),
})
export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  nombre: z.string().trim().min(2, 'Escribe tu nombre completo'),
  correo: z.email('Escribe un correo válido'),
  // Mismas reglas que UsuarioCreate en el backend.
  contrasena: z.string().min(8, 'Usa al menos 8 caracteres').max(128),
})
export type RegisterValues = z.infer<typeof registerSchema>
