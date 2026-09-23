/**
 * Guarda el JWT en sessionStorage: se borra al cerrar la pestaña.
 *
 * Trade-off conocido: cualquier script inyectado (XSS) podría leerlo. Para producción
 * conviene migrar a una cookie httpOnly emitida por el backend (RN-05 / RNF-02).
 */
const KEY = 'cyberwhatif.token'

export const tokenStorage = {
  get(): string | null {
    try {
      return sessionStorage.getItem(KEY)
    } catch {
      return null
    }
  },
  set(token: string): void {
    try {
      sessionStorage.setItem(KEY, token)
    } catch {
      /* almacenamiento bloqueado: la sesión dura lo que la pestaña en memoria */
    }
  },
  clear(): void {
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      /* noop */
    }
  },
}
