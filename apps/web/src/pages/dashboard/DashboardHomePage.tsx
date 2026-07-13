import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { useSelectedBusiness } from '../../features/businesses/SelectedBusinessContext';
import { listDailyRecords } from '../../services/dailyRecordService';
import { computeMetrics } from '../../features/dashboard/metrics';
import { Button, Card, EmptyState, PageHeader } from '../../components/ui';

export function DashboardHomePage() {
  const { selectedBusiness, businesses, isLoading: isLoadingBusinesses } = useSelectedBusiness();
  const businessId = selectedBusiness?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['daily-records', businessId],
    queryFn: () => listDailyRecords(businessId!),
    enabled: Boolean(businessId),
  });

  if (!isLoadingBusinesses && businesses.length === 0) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Bienvenido a ForecastIA." />
        <EmptyState
          title="Empieza creando tu primer negocio"
          description="Necesitas al menos un negocio para registrar cierres y generar predicciones."
        />
        <div className="mt-4">
          <Link to="/businesses/new">
            <Button>Crear negocio</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedBusiness) {
    return <p className="text-sm text-slate-500">Cargando...</p>;
  }

  const metrics = computeMetrics(data?.records ?? []);
  const currency = selectedBusiness.currency;

  return (
    <div>
      <PageHeader
        title={`Dashboard — ${selectedBusiness.name}`}
        description="Resumen general del negocio activo."
      />

      {isLoading && <p className="text-sm text-slate-500">Cargando...</p>}

      {!isLoading && metrics.recordsCount === 0 && (
        <EmptyState
          title="Aún no hay cierres registrados"
          description="Registra cierres diarios o importa un CSV para ver el resumen."
        />
      )}

      {metrics.recordsCount > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-400">Caja acumulada</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {metrics.totalRevenue.toFixed(2)} {currency}
            </p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-400">Caja media diaria</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {metrics.averageDailyRevenue.toFixed(2)} {currency}
            </p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-400">Total tickets</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{metrics.totalTickets}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-400">Cierres registrados</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{metrics.recordsCount}</p>
          </Card>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/daily-records"><Button variant="secondary">Registrar cierre</Button></Link>
        <Link to="/dashboard/evolution"><Button variant="secondary">Ver evolución</Button></Link>
        <Link to="/forecasts"><Button variant="secondary">Generar predicción</Button></Link>
      </div>
    </div>
  );
}
