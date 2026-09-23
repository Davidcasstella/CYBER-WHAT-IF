import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/page-header'
import { QueryState } from '@/components/query-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api-client'
import type { Rol, Usuario } from '@/types/api'

const ROL_LABEL: Record<Rol, string> = { ADMIN: 'Administrador', ANALISTA: 'Analista', CLIENTE: 'Cliente' }

/** RF-12. TODO: formulario para crear analistas (POST /admin/usuarios). */
export function UsersPage() {
  const users = useQuery({ queryKey: ['admin', 'usuarios'], queryFn: () => api<Usuario[]>('/admin/usuarios') })

  return (
    <>
      <PageHeader title="Usuarios" description="Personas con acceso a la plataforma y su rol." />
      <QueryState isPending={users.isPending} error={users.error}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.data?.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nombre}</TableCell>
                <TableCell>{u.correo}</TableCell>
                <TableCell>{ROL_LABEL[u.rol]}</TableCell>
                <TableCell>{u.activo ? 'Activo' : 'Desactivado'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </QueryState>
    </>
  )
}
