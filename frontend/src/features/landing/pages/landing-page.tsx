import { FeatureHighlights } from '../components/feature-highlights'
import { Hero } from '../components/hero'
import { LandingHeader } from '../components/landing-header'
import { AttacksSection, ContactSection, HowItWorks, LandingFooter, PlansSection } from '../components/sections'

/**
 * Landing pública. Usa la paleta de marca (tokens brand-*) y siempre se ve en claro,
 * independiente del tema de la app interna.
 */
export function LandingPage() {
  return (
    <div className="font-brand text-brand-ink min-h-svh bg-[#f8f7f4]">
      <LandingHeader />
      <main>
        <div className="bg-linear-to-b from-white to-[#f8f7f4]">
          <Hero />
          <FeatureHighlights />
        </div>
        <HowItWorks />
        <AttacksSection />
        <PlansSection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  )
}
