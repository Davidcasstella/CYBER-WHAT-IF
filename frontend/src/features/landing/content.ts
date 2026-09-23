import {
  Biohazard,
  Brain,
  Building2,
  ClipboardCheck,
  CreditCard,
  FileText,
  type LucideIcon,
  Mail,
  MessageCircle,
  ServerCog,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import { env } from '@/config/env'

/** Textos de la landing en un solo lugar: se editan sin tocar el maquetado. */

export const NAV_LINKS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'como-funciona', label: 'Cómo funciona' },
  { id: 'ataques', label: 'Ataques' },
  { id: 'planes', label: 'Planes' },
  { id: 'contacto', label: 'Contacto' },
] as const

export interface Feature {
  icon: LucideIcon
  title: string
  text: string
  tone: 'mist' | 'bronze' | 'teal'
}

export const FEATURES: Feature[] = [
  {
    icon: Brain,
    title: 'Réplica con IA',
    text: 'Creamos un gemelo virtual de tu empresa con base en tus procesos, usuarios y tecnología.',
    tone: 'mist',
  },
  {
    icon: ShieldCheck,
    title: 'Ataques en entorno aislado',
    text: 'Simulamos phishing, ransomware y robo de credenciales sin afectar tus sistemas.',
    tone: 'bronze',
  },
  {
    icon: FileText,
    title: 'Informe y recomendaciones',
    text: 'Recibes un informe revisado con hallazgos, impacto en el negocio y pasos concretos para reducir tus riesgos.',
    tone: 'teal',
  },
]

export const BENEFITS = [
  { icon: Users, title: 'Para pequeñas y medianas empresas', text: 'Ciberseguridad profesional, accesible y práctica.' },
  { icon: CreditCard, title: 'Planes flexibles', text: 'Elige el plan que se adapta a tu negocio.' },
  { icon: MessageCircle, title: 'Asesoría por WhatsApp', text: 'Resuelve tus dudas de forma rápida y directa.' },
]

/** Proceso real del MVP (Anexo A del documento de dominio): es una secuencia, por eso va numerado. */
export const STEPS = [
  { icon: Building2, title: 'Registra tu empresa', text: 'Nos cuentas tu sector, cuántos empleados tienes y tu dominio. Nada más.' },
  { icon: Brain, title: 'Creamos la réplica', text: 'Un agente de IA genera una versión simulada de tu organización con sus servidores, cuentas y equipos.' },
  { icon: ServerCog, title: 'Ejecutamos los ataques', text: 'Lanzamos los ataques de tu plan sobre la réplica, en una red aislada que no toca tus sistemas.' },
  { icon: ClipboardCheck, title: 'Recibes el informe', text: 'Un analista valida los resultados y te entrega el impacto y cómo mitigarlo.' },
]

export const ATTACKS = [
  {
    icon: Mail,
    name: 'Phishing',
    mitre: 'T1566',
    question: '¿Cuántos de tus empleados abrirían un correo fraudulento?',
    measures: 'Mide la exposición de tu equipo y la protección de tu dominio de correo.',
  },
  {
    icon: Biohazard,
    name: 'Ransomware',
    mitre: 'T1486',
    question: '¿Qué pasaría si cifraran tus servidores mañana?',
    measures: 'Mide cuántos activos críticos caerían, cuánto tiempo estarías detenido y cuánto te costaría.',
  },
  {
    icon: UserRound,
    name: 'Robo de credenciales',
    mitre: 'T1110',
    question: '¿Qué tan fácil es entrar con una contraseña robada?',
    measures: 'Mide la fortaleza de tus accesos y si tienes autenticación multifactor donde importa.',
  },
]

export const WHATSAPP_URL = `https://wa.me/${env.whatsappNumber}?text=${encodeURIComponent(
  'Hola, quiero saber más sobre las auditorías de CyberWhat-If.',
)}`
