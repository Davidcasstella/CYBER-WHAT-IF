import { env } from '@/config/env'
import { tokenStorage } from '@/lib/token-storage'

/** Error HTTP con el mensaje `detail` que envía FastAPI. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type Json = Record<string, unknown> | unknown[]

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: Json | URLSearchParams
  signal?: AbortSignal
}

/** Se dispara cuando el backend responde 401: la sesión expiró. */
export const UNAUTHORIZED_EVENT = 'cyberwhatif:unauthorized'

export async function api<T>(path: string, { method = 'GET', body, signal }: RequestOptions = {}): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' })
  const token = tokenStorage.get()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let payload: BodyInit | undefined
  if (body instanceof URLSearchParams) {
    payload = body // application/x-www-form-urlencoded (login OAuth2)
  } else if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
    payload = JSON.stringify(body)
  }

  const response = await fetch(`${env.apiUrl}${path}`, { method, headers, body: payload, signal })

  if (response.status === 401 && token) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }
  if (!response.ok) {
    throw new ApiError(response.status, await readDetail(response))
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
}

async function readDetail(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json()
    const detail = (data as { detail?: unknown }).detail
    if (typeof detail === 'string') return detail
    // Errores de validación de FastAPI: lista de { loc, msg }.
    if (Array.isArray(detail)) return detail.map((d: { msg?: string }) => d.msg).join('. ')
  } catch {
    /* respuesta sin JSON */
  }
  return `Error ${response.status}`
}
