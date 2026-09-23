import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-4xl">Esta página no existe</h1>
      <p className="text-muted-foreground">Revisa la dirección o vuelve a tus auditorías.</p>
      <Button asChild className="self-start">
        <Link to="/app">Ir a mis auditorías</Link>
      </Button>
    </main>
  )
}
