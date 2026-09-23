import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { RiskScale } from '@/features/audits/components/risk-scale'

/** Marco de las pantallas públicas: marca a la izquierda, formulario a la derecha. */
export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="grid min-h-svh lg:grid-cols-[5fr_4fr]">
      <section className="bg-primary text-primary-foreground hidden flex-col justify-between p-12 lg:flex">
        <Link to="/" className="font-heading self-start text-2xl">
          CyberWhat-If
        </Link>
        <div className="max-w-md space-y-8">
          <h1 className="text-5xl leading-[1.05]">
            Qué le pasaría a tu empresa ante un ataque real, sin arriesgar un solo servidor.
          </h1>
          <p className="text-primary-foreground/75 max-w-sm text-lg leading-relaxed">
            Replicamos tu organización en un entorno aislado, ejecutamos phishing, ransomware y robo de
            credenciales, y medimos el impacto técnico, operacional y financiero.
          </p>
        </div>
        <RiskScale className="max-w-md" inverted />
      </section>

      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <Link to="/" className="font-heading text-xl lg:hidden">
              CyberWhat-If
            </Link>
            <h2 className="text-3xl">{title}</h2>
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}
