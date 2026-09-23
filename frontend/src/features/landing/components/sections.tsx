import { ArrowRight, MessageCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { usePlans } from '@/features/commercial/api'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ATTACKS, STEPS, WHATSAPP_URL } from '../content'
import { BrandLogo } from './brand-logo'

function Section({
  id,
  title,
  intro,
  tinted,
  children,
}: {
  id: string
  title: string
  intro: string
  tinted?: boolean
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('scroll-mt-20 py-20 sm:py-24', tinted && 'bg-white')}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <h2 id={`${id}-title`} className="font-heading text-brand-ink text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h2>
          <p className="text-brand-slate mt-3 text-lg leading-relaxed">{intro}</p>
        </div>
        {children}
      </div>
    </section>
  )
}

export function HowItWorks() {
  return (
    <Section
      id="como-funciona"
      tinted
      title="Cómo funciona"
      intro="De tus datos básicos a un informe con el impacto real en tu negocio, sin instalar nada en tu infraestructura."
    >
      <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="relative">
            <div className="mb-5 flex items-center gap-4">
              <span className="bg-brand-600 flex size-12 items-center justify-center rounded-full text-lg font-bold text-white">
                {i + 1}
              </span>
              {i < STEPS.length - 1 && <span aria-hidden className="bg-brand-bronze/35 hidden h-px flex-1 lg:block" />}
            </div>
            <Icon className="text-brand-bronze mb-3 size-7" strokeWidth={1.8} aria-hidden />
            <h3 className="font-brand text-brand-ink text-lg font-bold">{title}</h3>
            <p className="text-brand-slate mt-1.5 leading-relaxed">{text}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

export function AttacksSection() {
  return (
    <Section
      id="ataques"
      title="Los ataques que simulamos"
      intro="Tres de los ataques más frecuentes contra empresas, modelados con el marco MITRE ATT&CK."
    >
      <ul className="grid gap-6 md:grid-cols-3">
        {ATTACKS.map(({ icon: Icon, name, mitre, question, measures }) => (
          <li key={name} className="border-brand-100 rounded-2xl border bg-white p-7 shadow-[0_12px_32px_-20px_rgba(10,23,51,0.25)]">
            <div className="mb-6 flex items-center justify-between">
              <span className="flex size-12 items-center justify-center rounded-xl bg-brand-bronze-50">
                <Icon className="text-brand-bronze size-6" aria-hidden />
              </span>
              <span className="text-brand-slate text-sm">MITRE {mitre}</span>
            </div>
            <h3 className="font-heading text-brand-ink text-2xl font-semibold">{name}</h3>
            <p className="text-brand-ink mt-3 font-medium">{question}</p>
            <p className="text-brand-slate mt-2 leading-relaxed">{measures}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}

export function PlansSection() {
  const plans = usePlans()

  return (
    <Section
      id="planes"
      tinted
      title="Planes"
      intro="Paga solo por lo que necesitas. Confirmamos la contratación contigo por WhatsApp."
    >
      {plans.isPending ? (
        <div className="grid gap-6 md:grid-cols-2" aria-busy="true">
          <div className="bg-brand-100 h-64 animate-pulse rounded-2xl" />
          <div className="bg-brand-100 h-64 animate-pulse rounded-2xl" />
        </div>
      ) : plans.error || !plans.data?.length ? (
        <p className="text-brand-slate">
          No pudimos cargar los planes en este momento.{' '}
          <a href={WHATSAPP_URL} className="text-brand-600 font-semibold underline underline-offset-4">
            Pregúntanos por WhatsApp
          </a>
          .
        </p>
      ) : (
        <ul className="grid items-stretch gap-6 md:grid-cols-2">
          {plans.data.map((plan) => {
            const featured = plan.tipo === 'COMPLETO'
            return (
              <li
                key={plan.id}
                className={cn(
                  'flex flex-col rounded-2xl bg-white p-8',
                  featured ? 'ring-brand-600 shadow-brand-600/15 shadow-2xl ring-2' : 'border-brand-100 border',
                )}
              >
                {featured && (
                  <span className="bg-brand-600 mb-4 self-start rounded-full px-3 py-1 text-xs font-semibold text-white">
                    Incluye dashboard
                  </span>
                )}
                <h3 className="font-heading text-brand-ink text-3xl font-semibold">{plan.nombre}</h3>
                <p className="text-brand-slate mt-2">{plan.descripcion}</p>
                <p className="font-heading text-brand-ink mt-6 text-5xl font-semibold tracking-tight">
                  {formatMoney(plan.precio)}
                  <span className="text-brand-slate ml-2 text-base font-medium">COP</span>
                </p>
                <ul className="text-brand-ink mt-6 mb-8 flex-1 space-y-2">
                  {(featured ? plan.ataques.map((a) => a.nombre) : ['Un ataque a elección']).map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="text-brand-600">✓</span>
                      {item}
                    </li>
                  ))}
                  <li className="flex gap-2">
                    <span aria-hidden className="text-brand-600">✓</span>
                    {featured ? 'Informe completo y dashboard de impacto' : 'Informe con recomendaciones'}
                  </li>
                </ul>
                <Link
                  to="/registro"
                  className={cn(
                    'inline-flex h-12 items-center justify-center rounded-lg font-semibold transition',
                    featured
                      ? 'bg-brand-600 text-white hover:bg-brand-500'
                      : 'border-brand-600 text-brand-ink hover:bg-brand-50 border-2',
                  )}
                >
                  Elegir {plan.nombre.toLowerCase()}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}

export function ContactSection() {
  return (
    <section id="contacto" aria-labelledby="contacto-title" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24">
      <div className="from-brand-700 to-brand-600 mx-auto flex max-w-7xl flex-col items-start gap-8 rounded-3xl bg-linear-to-br px-8 py-12 text-white sm:px-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h2 id="contacto-title" className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            ¿Tienes dudas antes de empezar?
          </h2>
          <p className="mt-3 text-lg text-white/80">
            Escríbenos por WhatsApp y te ayudamos a elegir el plan adecuado para tu empresa.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-ink inline-flex h-14 items-center gap-3 rounded-xl bg-white px-7 font-semibold transition hover:bg-white/90"
          >
            <MessageCircle className="size-5 text-[#25d366]" aria-hidden />
            Escribir por WhatsApp
          </a>
          <Link
            to="/registro"
            className="inline-flex h-14 items-center gap-2 rounded-xl border-2 border-white/40 px-7 font-semibold transition hover:bg-white/10"
          >
            Comenzar auditoría
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}

export function LandingFooter() {
  return (
    <footer className="border-brand-100 border-t">
      <div className="text-brand-slate mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <BrandLogo compact />
        <p>Auditorías de ciberseguridad sobre réplicas simuladas. Nunca tocamos tu infraestructura real.</p>
        <p>© {new Date().getFullYear()} CyberWhat-If</p>
      </div>
    </footer>
  )
}
