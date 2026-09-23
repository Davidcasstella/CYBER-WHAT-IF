import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/app-shell'
import { RequireAuth } from '@/features/auth/require-auth'
import { HomeRedirect } from './home-redirect'
import { PageLoading } from './page-loading'

/*
 * Cada página se carga bajo demanda (code-splitting): quien solo abre el login no
 * descarga el código del panel ni de administración.
 * `handle.crumb` alimenta la ruta de navegación de la barra superior (AppShell).
 */
export const router = createBrowserRouter([
  {
    // Ruta raíz sin UI: da un fallback mientras carga la primera página lazy.
    hydrateFallbackElement: <PageLoading />,
    children: [
      {
        path: '/',
        lazy: () => import('@/features/landing/pages/landing-page').then((m) => ({ Component: m.LandingPage })),
      },
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
              { index: true, element: <HomeRedirect /> },
              {
                path: 'auditorias',
                handle: { crumb: 'Auditorías' },
                lazy: () => import('@/features/audits/pages/audits-page').then((m) => ({ Component: m.AuditsPage })),
              },
              {
                path: 'auditorias/:id',
                handle: { crumb: 'Detalle de auditoría' },
                lazy: () =>
                  import('@/features/audits/pages/audit-detail-page').then((m) => ({ Component: m.AuditDetailPage })),
              },
              {
                path: 'informes',
                handle: { crumb: 'Informes' },
                lazy: () => import('@/features/reports/pages/reports-page').then((m) => ({ Component: m.ReportsPage })),
              },
              {
                path: 'configuracion',
                handle: { crumb: 'Configuración' },
                lazy: () =>
                  import('@/features/settings/pages/settings-page').then((m) => ({ Component: m.SettingsPage })),
              },
              {
                element: <RequireAuth roles={['CLIENTE']} />,
                children: [
                  {
                    path: 'resumen',
                    handle: { crumb: 'Resumen' },
                    lazy: () =>
                      import('@/features/overview/pages/overview-page').then((m) => ({ Component: m.OverviewPage })),
                  },
                  {
                    path: 'empresa',
                    handle: { crumb: 'Mi empresa' },
                    lazy: () =>
                      import('@/features/companies/pages/company-page').then((m) => ({ Component: m.CompanyPage })),
                  },
                  {
                    path: 'planes',
                    handle: { crumb: 'Planes' },
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
                    handle: { crumb: 'Usuarios' },
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
    ],
  },
])
