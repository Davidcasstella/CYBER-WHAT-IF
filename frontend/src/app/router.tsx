import { Navigate, createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/app-shell'
import { RequireAuth } from '@/features/auth/require-auth'

/*
 * Cada página se carga bajo demanda (code-splitting): quien solo abre el login no
 * descarga el código del dashboard ni de administración.
 */
export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/app" replace /> },
  {
    path: '/login',
    lazy: () => import('@/features/auth/pages/login-page').then((m) => ({ Component: m.LoginPage })),
  },
  {
    path: '/registro',
    lazy: () => import('@/features/auth/pages/register-page').then((m) => ({ Component: m.RegisterPage })),
  },
  {
    path: '/app',
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="auditorias" replace /> },
          {
            path: 'auditorias',
            lazy: () => import('@/features/audits/pages/audits-page').then((m) => ({ Component: m.AuditsPage })),
          },
          {
            path: 'auditorias/:id',
            lazy: () =>
              import('@/features/audits/pages/audit-detail-page').then((m) => ({ Component: m.AuditDetailPage })),
          },
          {
            element: <RequireAuth roles={['CLIENTE']} />,
            children: [
              {
                path: 'empresa',
                lazy: () =>
                  import('@/features/companies/pages/company-page').then((m) => ({ Component: m.CompanyPage })),
              },
              {
                path: 'planes',
                lazy: () =>
                  import('@/features/commercial/pages/plans-page').then((m) => ({ Component: m.PlansPage })),
              },
            ],
          },
          {
            path: 'admin',
            element: <RequireAuth roles={['ADMIN']} />,
            children: [
              {
                path: 'usuarios',
                lazy: () => import('@/features/admin/pages/users-page').then((m) => ({ Component: m.UsersPage })),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    lazy: () => import('./not-found-page').then((m) => ({ Component: m.NotFoundPage })),
  },
])
