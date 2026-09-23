const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const dateTime = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

export function formatMoney(value: string | number | null | undefined): string {
  return value == null ? '—' : cop.format(Number(value))
}

export function formatDateTime(value: string | null | undefined): string {
  return value ? dateTime.format(new Date(value)) : '—'
}

export function formatPercent(value: string | number | null | undefined): string {
  return value == null ? '—' : `${Math.round(Number(value))} %`
}
