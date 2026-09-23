import { api } from '@/lib/api-client'
import type { Usuario } from '@/types/api'

export const authKeys = {
  me: ['auth', 'me'] as const,
}

export function login(correo: string, contrasena: string) {
  // OAuth2PasswordRequestForm espera form-urlencoded con `username`.
  const form = new URLSearchParams({ username: correo, password: contrasena })
  return api<{ access_token: string }>('/auth/login', { method: 'POST', body: form })
}

export function register(data: { nombre: string; correo: string; contrasena: string }) {
  return api<Usuario>('/auth/registro', { method: 'POST', body: data })
}

export function fetchMe() {
  return api<Usuario>('/auth/me')
}
