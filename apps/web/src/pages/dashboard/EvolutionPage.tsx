import { useQuery } from '@tanstack/react-query';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useSelectedBusiness } from '../../features/businesses/SelectedBusinessContext';
import { listDailyRecords } from '../../services/dailyRecordService';
import { buildEvolutionSeries } from '../../features/dashboard/metrics';
import { Card, EmptyState, PageHeader } from '../../components/ui';

export function EvolutionPage() {
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

  const series = buildEvolutionSeries(data?.records ?? []);

  return (
    <div>
      <PageHeader
        title="Evolución de caja"
        description={`Negocio: ${selectedBusiness.name} (CU-006).`}
      />

      {isLoading && <p className="text-sm text-slate-500">Cargando...</p>}

      {!isLoading && series.length === 0 && (
        <EmptyState title="Sin datos" description="Registra cierres diarios para ver su evolución." />
      )}

      {series.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <p className="mb-3 text-sm font-medium text-slate-700">Caja diaria</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#0284c7" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <p className="mb-3 text-sm font-medium text-slate-700">Caja acumulada</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="cumulative" stroke="#16a34a" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <p className="mb-3 text-sm font-medium text-slate-700">Tickets diarios</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="tickets" stroke="#d97706" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <p className="mb-3 text-sm font-medium text-slate-700">Ticket medio</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="averageTicket" stroke="#7c3aed" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
}
