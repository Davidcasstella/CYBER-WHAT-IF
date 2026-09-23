import { ArrowRight, Play } from 'lucide-react'
import { Link } from 'react-router'
import { HeroIllustration } from './hero-illustration'

export function Hero() {
  return (
    <section id="inicio" aria-labelledby="hero-title" className="scroll-mt-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-12 pb-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
        <div className="max-w-2xl">
          <p className="text-brand-600 mb-5 text-xs font-bold tracking-[0.3em] uppercase sm:text-sm">
            Ciberseguridad inteligente para tu empresa
          </p>
          <h1
            id="hero-title"
            className="font-heading text-brand-ink text-[2.8rem] leading-[1.02] font-semibold tracking-[-0.02em] sm:text-[4rem] lg:text-[3.6rem] xl:text-[4.4rem]"
          >
            {/* Tres líneas fijas desde sm, como en el diseño; en móvil el texto fluye. */}
            <span className="sm:block">Conoce tus riesgos</span>{' '}
            <span className="sm:block sm:whitespace-nowrap">
              <em className="text-brand-500 font-medium">antes de que ocurra</em>
            </span>{' '}
            <span className="sm:block">un ataque</span>
          </h1>
          <p className="text-brand-slate mt-6 max-w-xl text-lg leading-relaxed sm:text-xl">
            Simulamos tu empresa con IA y evaluamos el impacto de posibles ataques en un entorno seguro.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <Link
              to="/registro"
              className="bg-brand-600 shadow-brand-600/25 hover:bg-brand-500 group inline-flex h-14 items-center gap-3 rounded-xl px-8 text-lg font-semibold text-white shadow-xl transition-colors"
            >
              Comenzar auditoría
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <a href="#como-funciona" className="text-brand-ink group inline-flex items-center gap-3 font-semibold">
              <span className="border-brand-bronze group-hover:bg-brand-bronze-50 flex size-14 items-center justify-center rounded-full border-2 transition-colors">
                <Play className="text-brand-ink size-5 translate-x-px fill-current" aria-hidden />
              </span>
              Conoce cómo funciona
            </a>
          </div>
        </div>

        <HeroIllustration className="mx-auto max-w-2xl lg:max-w-none" />
      </div>
    </section>
  )
}
