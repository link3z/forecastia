import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../features/auth/AuthContext';
import { useSelectedBusiness } from '../features/businesses/SelectedBusinessContext';

const navSections = [
  {
    title: 'General',
    links: [
      { to: '/', label: 'Dashboard' },
      { to: '/businesses', label: 'Negocios' },
    ],
  },
  {
    title: 'Negocio actual',
    links: [
      { to: '/daily-records', label: 'Cierres diarios' },
      { to: '/daily-records/import', label: 'Importar CSV' },
      { to: '/dashboard/evolution', label: 'Evolución de caja' },
      { to: '/dashboard/metrics', label: 'Métricas principales' },
      { to: '/dashboard/comparisons', label: 'Comparativas' },
      { to: '/forecasts', label: 'Generar predicción' },
      { to: '/forecasts/history', label: 'Histórico de predicciones' },
      { to: '/exports', label: 'Exportaciones' },
    ],
  },
];

export function Layout() {
  const { user, logout } = useAuth();
  const { businesses, selectedBusiness, selectBusiness } = useSelectedBusiness();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-lg font-semibold text-sky-700">ForecastIA</p>
          <p className="text-xs text-slate-400">Predicción de ingresos</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {section.title}
              </p>
              <div className="flex flex-col gap-1">
                {section.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${
                        isActive
                          ? 'bg-sky-50 text-sky-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200 px-4 py-3">
          <p className="truncate text-sm font-medium text-slate-700">{user?.name}</p>
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="text-sm text-slate-500">Negocio activo</div>
          <select
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            value={selectedBusiness?.id ?? ''}
            onChange={(e) => selectBusiness(e.target.value)}
          >
            {businesses.length === 0 && <option value="">Sin negocios</option>}
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
