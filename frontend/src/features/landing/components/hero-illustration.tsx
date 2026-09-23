import { Biohazard, ChartColumn, Database, type LucideIcon, Mail, Settings, TriangleAlert, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

/*
 * Ilustración del hero: empresa simulada bajo una cúpula (entorno aislado), atacada por
 * los 3 ataques del MVP, con el análisis de impacto en 4 dimensiones al lado.
 *
 * El SVG usa viewBox 460x360 y el contenedor tiene la misma proporción, así que las
 * etiquetas HTML se posicionan en % y siempre caen sobre el mismo punto del dibujo.
 * Los tamaños de texto usan unidades cqw (container queries) para escalar con él.
 */

type P = readonly [number, number]
const pts = (...points: P[]) => points.map((p) => p.join(',')).join(' ')

/** Caja isométrica: (cx, by) es el vértice inferior frontal; w/d = ancho hacia izquierda/derecha. */
function isoBox(cx: number, by: number, w: number, d: number, h: number) {
  const F: P = [cx, by]
  const L: P = [cx - w, by - w / 2]
  const R: P = [cx + d, by - d / 2]
  const B: P = [cx - w + d, by - w / 2 - d / 2]
  const up = ([x, y]: P): P => [x, y - h]
  return { F, L, R, B, Ft: up(F), Lt: up(L), Rt: up(R), Bt: up(B), h }
}

interface BoxColors {
  left: string
  right: string
  top: string
}

function Box({ box, colors }: { box: ReturnType<typeof isoBox>; colors: BoxColors }) {
  const { F, L, R, Ft, Lt, Rt, Bt } = box
  return (
    <g stroke="#ffffff" strokeOpacity={0.5} strokeWidth={0.6} strokeLinejoin="round">
      <polygon points={pts(L, F, Ft, Lt)} fill={colors.left} />
      <polygon points={pts(F, R, Rt, Ft)} fill={colors.right} />
      <polygon points={pts(Lt, Ft, Rt, Bt)} fill={colors.top} />
    </g>
  )
}

/** Ventanas en la cara que va de `a` a `b` (esquinas inferiores), con altura h. */
function Windows({ a, b, h, rows, cols, fill }: { a: P; b: P; h: number; rows: number; cols: number; fill: string }) {
  const at = (u: number, v: number): P => [a[0] + u * (b[0] - a[0]), a[1] + u * (b[1] - a[1]) - v * h]
  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u0 = (c + 0.18) / cols
      const u1 = (c + 0.82) / cols
      const v0 = 0.06 + (r * 0.9) / rows + 0.02
      const v1 = 0.06 + ((r + 1) * 0.9) / rows - 0.03
      cells.push(<polygon key={`${r}-${c}`} points={pts(at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1))} fill={fill} />)
    }
  }
  return <g>{cells}</g>
}

function Tree({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y - 10} stroke="#7a5a3c" strokeWidth={2} />
      <circle cx={x} cy={y - 16} r={9} fill="#4fae6a" />
      <circle cx={x - 3} cy={y - 19} r={4} fill="#7fd08f" />
    </g>
  )
}

const OFFICE: BoxColors = { left: '#9fb0ba', right: '#cbd5da', top: '#eef1f2' }
const OFFICE_SMALL: BoxColors = { left: '#b3c0c7', right: '#d8dfe2', top: '#f3f5f5' }
const SERVER: BoxColors = { left: '#2f3d45', right: '#4b5c65', top: '#8e9ca3' }

const tower = isoBox(200, 262, 60, 60, 140)
const towerTop = isoBox(200, 107, 30, 30, 20)

function Scene() {
  return (
    <svg viewBox="0 0 460 360" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id="hero-dome" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.08} />
          <stop offset="0.72" stopColor="#e3eef1" stopOpacity={0.3} />
          <stop offset="1" stopColor="#b9d2d9" stopOpacity={0.6} />
        </radialGradient>
        <linearGradient id="hero-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbfbfa" />
          <stop offset="1" stopColor="#e3e8ea" />
        </linearGradient>
        <linearGradient id="hero-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d7dde0" />
          <stop offset="1" stopColor="#a9b5ba" />
        </linearGradient>
        <linearGradient id="hero-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a7d8c" />
          <stop offset="1" stopColor="#0f4c5c" />
        </linearGradient>
        <filter id="hero-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="hero-halo" x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <pattern id="hero-hex" width="24" height="41.57" patternUnits="userSpaceOnUse">
          <path
            d="M12 0 24 6.93v13.86L12 27.71 0 20.79V6.93Zm0 27.71V41.57"
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.55}
            strokeWidth={0.8}
          />
        </pattern>
        <clipPath id="hero-above-platform">
          <rect x="0" y="-40" width="400" height="312" />
        </clipPath>
        <clipPath id="hero-platform-clip">
          <ellipse cx="200" cy="272" rx="185" ry="50" />
        </clipPath>
      </defs>

      <g transform="translate(10 20)">
        {/* Halo y plataforma */}
        <ellipse cx="200" cy="290" rx="205" ry="62" fill="#cfdde2" opacity={0.7} filter="url(#hero-halo)" />
        <path d="M15 272v18a185 50 0 0 0 370 0v-18a185 50 0 0 1-370 0Z" fill="url(#hero-side)" />
        <ellipse cx="200" cy="290" rx="185" ry="50" fill="none" stroke="#bfe3f0" strokeWidth={2} filter="url(#hero-glow)" />
        <ellipse cx="200" cy="272" rx="185" ry="50" fill="url(#hero-top)" stroke="#ffffff" strokeWidth={2} />

        {/* Retícula isométrica y circuitos luminosos */}
        <g clipPath="url(#hero-platform-clip)" stroke="#c3d3d8" strokeOpacity={0.7} strokeWidth={0.8}>
          {Array.from({ length: 25 }, (_, i) => (i - 12) * 18).map((c) => (
            <g key={c}>
              <line x1="0" y1={272 - 100 + c} x2="400" y2={272 + 100 + c} />
              <line x1="0" y1={272 + 100 + c} x2="400" y2={272 - 100 + c} />
            </g>
          ))}
        </g>
        <g stroke="#8fd3e6" strokeWidth={2} fill="none" strokeLinecap="round" filter="url(#hero-glow)">
          <path d="M200 262 150 287 104 264" />
          <path d="M200 262 256 290 318 259" />
          <path d="M200 262v44l-40 12" />
          <path d="M200 306l48 12" />
        </g>
        <g fill="#bdeaf5" filter="url(#hero-glow)">
          <circle cx="104" cy="264" r="3" />
          <circle cx="318" cy="259" r="3" />
          <circle cx="160" cy="318" r="3" />
          <circle cx="248" cy="318" r="3" />
        </g>

        {/* Edificios de fondo */}
        <Tree x={62} y={268} />
        <Box box={isoBox(96, 262, 22, 22, 46)} colors={OFFICE_SMALL} />
        <Box box={isoBox(302, 258, 24, 24, 78)} colors={OFFICE_SMALL} />
        <Windows a={[278, 246]} b={[302, 258]} h={78} rows={6} cols={2} fill="#6f8794" />
        <Tree x={338} y={262} />

        {/* Torre principal */}
        <Box box={tower} colors={OFFICE} />
        <Windows a={tower.L} b={tower.F} h={tower.h} rows={9} cols={4} fill="#3f5866" />
        <Windows a={tower.F} b={tower.R} h={tower.h} rows={9} cols={4} fill="#6d8795" />
        <Box box={towerTop} colors={OFFICE_SMALL} />
        <line x1="212" y1="80" x2="212" y2="58" stroke="#8e9ca3" strokeWidth={2} />
        <circle cx="212" cy="57" r="2.5" fill="#8fd3e6" filter="url(#hero-glow)" />

        {/* Escudo: entorno protegido */}
        <g filter="url(#hero-glow)">
          <path
            d="M200 170l28 11v21c0 19-12.5 31.5-28 38-15.5-6.5-28-19-28-38v-21Z"
            fill="url(#hero-shield)"
            stroke="#ffffff"
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <path d="m188 203 8.5 8.5 16-18" fill="none" stroke="#ffffff" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Edificios y servidores del frente */}
        <Box box={isoBox(128, 288, 30, 30, 60)} colors={OFFICE} />
        <Windows a={[98, 273]} b={[128, 288]} h={60} rows={5} cols={3} fill="#4a6270" />
        <Box box={isoBox(284, 292, 32, 32, 48)} colors={OFFICE} />
        <Windows a={[284, 292]} b={[316, 276]} h={48} rows={4} cols={3} fill="#768f9c" />
        <Box box={isoBox(78, 300, 12, 12, 34)} colors={SERVER} />
        <Box box={isoBox(94, 308, 12, 12, 34)} colors={SERVER} />
        <Box box={isoBox(330, 302, 12, 12, 32)} colors={SERVER} />
        <Box box={isoBox(346, 294, 12, 12, 32)} colors={SERVER} />
        <g stroke="#8fd3e6" strokeWidth={1.2} filter="url(#hero-glow)">
          <path d="M70 280h4M70 286h4M86 288h4M86 294h4M334 278h4M334 284h4M350 270h4M350 276h4" />
        </g>
        <Tree x={170} y={322} />
        <Tree x={236} y={326} />

        {/* Cúpula: el entorno aislado */}
        <g clipPath="url(#hero-above-platform)">
          <circle cx="200" cy="180" r="182" fill="url(#hero-dome)" />
          <circle cx="200" cy="180" r="182" fill="url(#hero-hex)" opacity={0.7} />
          <circle cx="200" cy="180" r="182" fill="none" stroke="#ffffff" strokeWidth={2.5} strokeOpacity={0.9} />
          <path d="M52 150a150 150 0 0 1 98-128" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.65} />
        </g>
      </g>

      {/* Conectores de ataque (coordenadas del viewBox completo) */}
      <g stroke="#a8742e" strokeWidth={1.8} strokeDasharray="2 5" fill="none" strokeLinecap="round">
        <path d="M84 60q20 55 78 88" />
        <path d="M388 58q-30 30-72 62" />
        <path d="M112 226q30 0 58 8" />
      </g>
      <g fill="#a8742e">
        <circle cx="84" cy="60" r="3.5" />
        <circle cx="162" cy="148" r="3.5" />
        <circle cx="316" cy="120" r="3.5" />
        <circle cx="170" cy="234" r="3.5" />
      </g>
    </svg>
  )
}

function AttackChip({ icon: Icon, label, className }: { icon: LucideIcon; label: string; className: string }) {
  return (
    <div
      className={cn(
        'animate-float absolute flex items-center gap-[1.6cqw] rounded-[1.6cqw] border border-white bg-white/95 px-[2.2cqw] py-[1.6cqw] shadow-[0_10px_28px_-10px_rgba(16,34,43,0.35)]',
        className,
      )}
    >
      <Icon className="size-[4.4cqw] shrink-0 text-[#8a5a1e]" strokeWidth={2.2} />
      <span className="text-brand-ink text-[2.9cqw] leading-tight font-semibold">{label}</span>
    </div>
  )
}

const IMPACT_ROWS: { icon: LucideIcon; label: string; value: number; bar: string }[] = [
  { icon: ChartColumn, label: 'Técnico', value: 78, bar: 'from-brand-600 to-[#3f8f9a]' },
  { icon: Settings, label: 'Operacional', value: 66, bar: 'from-brand-600 to-[#3f8f9a]' },
  { icon: Database, label: 'Financiero', value: 72, bar: 'from-brand-600 to-[#3f8f9a]' },
  { icon: TriangleAlert, label: 'Riesgo', value: 55, bar: 'from-brand-600 to-[#3f8f9a]' },
]

function ImpactCard() {
  return (
    <div className="absolute top-[38%] right-0 w-[31%] rounded-[2cqw] border border-white bg-white/90 p-[2.6cqw] shadow-[0_18px_40px_-16px_rgba(16,34,43,0.3)] backdrop-blur">
      <p className="text-brand-ink mb-[2cqw] text-[2.3cqw] leading-tight font-semibold">Análisis de impacto en tu negocio</p>
      <ul className="space-y-[2cqw]">
        {IMPACT_ROWS.map(({ icon: Icon, label, value, bar }) => (
          <li key={label} className="flex items-center gap-[1.8cqw]">
            <Icon className="text-brand-ink size-[3.6cqw] shrink-0" />
            <div className="flex-1 space-y-[0.8cqw]">
              <p className="text-brand-ink text-[2.1cqw] leading-none">{label}</p>
              <div className="bg-brand-100 h-[1.2cqw] rounded-full">
                <div className={cn('h-full rounded-full bg-linear-to-r', bar)} style={{ width: `${value}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function HeroIllustration({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Empresa simulada dentro de un entorno aislado, expuesta a phishing, ransomware y robo de credenciales, con su análisis de impacto técnico, operacional, financiero y de riesgo."
      className={cn('@container relative aspect-[460/360] w-full select-none', className)}
    >
      <Scene />
      <div aria-hidden="true">
        <span className="text-brand-ink absolute top-[15%] left-[45.6%] -translate-x-1/2 rounded-[1.4cqw] border border-white bg-white/90 px-[2.4cqw] py-[1.1cqw] text-[2.8cqw] font-semibold whitespace-nowrap shadow-md">
          Empresa simulada
        </span>
        <AttackChip icon={Mail} label="Phishing" className="top-[6%] left-[5%]" />
        <AttackChip icon={Biohazard} label="Ransomware" className="top-[2%] right-0 [animation-delay:-2s]" />
        <AttackChip icon={UserRound} label={'Robo de\ncredenciales'} className="top-[55%] left-0 whitespace-pre-line [animation-delay:-4s]" />
        <ImpactCard />
      </div>
    </div>
  )
}
