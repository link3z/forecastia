import { useQuery } from '@tanstack/react-query';

import { useSelectedBusiness } from '../../features/businesses/SelectedBusinessContext';
import { listDailyRecords } from '../../services/dailyRecordService';
import { computeMetrics } from '../../features/dashboard/metrics';
import { Card, EmptyState, PageHeader } from '../../components/ui';

export function MetricsPage() {
  const { selectedBusiness } = useSelectedBusiness();
  const businessId = selectedBusiness?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['daily-records', businessId],
    queryFn: () => listDailyRecords(businessId!),
    enabled: Boolean(businessId),
  });

  if (!selectedBusiness) {
    return <EmptyState title="Selecciona un negocio" />;
  }

  const metrics = computeMetrics(data?.records ?? []);
  const currency = selectedBusiness.currency;

  if (isLoading) return <p className="text-sm text-slate-500">Cargando...</p>;

  if (metrics.recordsCount === 0) {
    return <EmptyState title="Sin datos" description="Registra cierres diarios para ver sus métricas." />;
  }

  const tiles = [
    { label: 'Caja acumulada', value: `${metrics.totalRevenue.toFixed(2)} ${currency}` },
    { label: 'Caja media diaria', value: `${metrics.averageDailyRevenue.toFixed(2)} ${currency}` },
    { label: 'Total tickets', value: metrics.totalTickets },
    { label: 'Ticket medio global', value: `${metrics.globalAverageTicket.toFixed(2)} ${currency}` },
    {
      label: 'Mejor día',
      value: metrics.bestDay
        ? `${new Date(metrics.bestDay.date).toLocaleDateString()} (${metrics.bestDay.revenue.toFixed(2)} ${currency})`
        : '—',
    },
    {
      label: 'Peor día',
      value: metrics.worstDay
        ? `${new Date(metrics.worstDay.date).toLocaleDateString()} (${metrics.worstDay.revenue.toFixed(2)} ${currency})`
        : '—',
    },
    { label: 'Nº de cierres registrados', value: metrics.recordsCount },
    { label: 'Tendencia reciente', value: `${(metrics.recentTrend * 100).toFixed(1)}%` },
  ];

  return (
    <div>
      <PageHeader title="Métricas principales" description={`Negocio: ${selectedBusiness.name} (CU-007).`} />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <p className="text-xs uppercase tracking-wide text-slate-400">{tile.label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{tile.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <p className="mb-3 text-sm font-medium text-slate-700">Media por día de la semana</p>
          <ul className="space-y-1 text-sm">
            {metrics.averageByDayOfWeek.map((d) => (
              <li key={d.label} className="flex justify-between border-b border-slate-100 py-1">
                <span>{d.label}</span>
                <span className="font-medium">{d.average.toFixed(2)} {currency}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <p className="mb-3 text-sm font-medium text-slate-700">Media por mes</p>
          <ul className="space-y-1 text-sm">
            {metrics.averageByMonth.map((m) => (
              <li key={m.label} className="flex justify-between border-b border-slate-100 py-1">
                <span>{m.label}</span>
                <span className="font-medium">{m.average.toFixed(2)} {currency}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
