import { useEffect, useState } from 'react'

/** Devuelve el id de la sección visible, para marcar el link activo del menú. */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length) setActive(visible[0].target.id)
      },
      // Una sección cuenta como activa cuando cruza la franja superior del viewport.
      { rootMargin: '-30% 0px -60% 0px' },
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [ids])

  return active
}
