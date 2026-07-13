import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useSelectedBusiness } from '../../features/businesses/SelectedBusinessContext';
import { listDailyRecords } from '../../services/dailyRecordService';
import { computeMetrics } from '../../features/dashboard/metrics';
import { Card, EmptyState, PageHeader } from '../../components/ui';
import type { DailyRecord } from '../../types/api';

function correlation(records: DailyRecord[], valueFn: (r: DailyRecord) => number | null): number | null {
  const pairs = records
    .map((r) => ({ x: valueFn(r), y: r.revenue }))
    .filter((p): p is { x: number; y: number } => p.x != null);
  if (pairs.length < 2) return null;

  const n = pairs.length;
  const meanX = pairs.reduce((s, p) => s + p.x, 0) / n;
  const meanY = pairs.reduce((s, p) => s + p.y, 0) / n;
  const cov = pairs.reduce((s, p) => s + (p.x - meanX) * (p.y - meanY), 0);
  const stdX = Math.sqrt(pairs.reduce((s, p) => s + (p.x - meanX) ** 2, 0));
  const stdY = Math.sqrt(pairs.reduce((s, p) => s + (p.y - meanY) ** 2, 0));
  if (stdX === 0 || stdY === 0) return null;
  return cov / (stdX * stdY);
}

export function ComparisonsPage() {
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

  const records = data?.records ?? [];
  const metrics = computeMetrics(records);

  if (isLoading) return <p className="text-sm text-slate-500">Cargando...</p>;

  if (records.length === 0) {
    return <EmptyState title="Sin datos" description="Registra cierres diarios para ver comparativas." />;
  }

  const withEvent = records.filter((r) => r.event).reduce((s, r) => s + r.revenue, 0) / Math.max(1, records.filter((r) => r.event).length);
  const withoutEvent = records.filter((r) => !r.event).reduce((s, r) => s + r.revenue, 0) / Math.max(1, records.filter((r) => !r.event).length);
  const withCampaign = records.filter((r) => r.campaign).reduce((s, r) => s + r.revenue, 0) / Math.max(1, records.filter((r) => r.campaign).length);
  const withoutCampaign = records.filter((r) => !r.campaign).reduce((s, r) => s + r.revenue, 0) / Math.max(1, records.filter((r) => !r.campaign).length);

  const correlations = [
    { label: 'Caja vs temperatura máxima', value: correlation(records, (r) => r.tempMax) },
    { label: 'Caja vs tickets', value: correlation(records, (r) => r.tickets) },
    { label: 'Caja vs ticket medio', value: correlation(records, (r) => r.averageTicket) },
    {
      label: 'Caja vs seguidores en redes',
      value: correlation(records, (r) => r.socialFollowers),
    },
  ];

  return (
    <div>
      <PageHeader title="Comparativas" description={`Negocio: ${selectedBusiness.name} (CU-008).`} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <p className="mb-3 text-sm font-medium text-slate-700">Caja vs día de la semana</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={metrics.averageByDayOfWeek}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="average" fill="#0284c7" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <p className="mb-3 text-sm font-medium text-slate-700">Caja vs clima</p>
          {metrics.averageByWeather.length === 0 ? (
            <p className="text-sm text-slate-400">Sin datos de clima registrados.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={metrics.averageByWeather}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="average" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <p className="mb-3 text-sm font-medium text-slate-700">Caja vs eventos / campañas</p>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between border-b border-slate-100 py-1">
              <span>Con evento</span>
              <span className="font-medium">{withEvent.toFixed(2)} {selectedBusiness.currency}</span>
            </li>
            <li className="flex justify-between border-b border-slate-100 py-1">
              <span>Sin evento</span>
              <span className="font-medium">{withoutEvent.toFixed(2)} {selectedBusiness.currency}</span>
            </li>
            <li className="flex justify-between border-b border-slate-100 py-1">
              <span>Con campaña</span>
              <span className="font-medium">{withCampaign.toFixed(2)} {selectedBusiness.currency}</span>
            </li>
            <li className="flex justify-between border-b border-slate-100 py-1">
              <span>Sin campaña</span>
              <span className="font-medium">{withoutCampaign.toFixed(2)} {selectedBusiness.currency}</span>
            </li>
          </ul>
        </Card>

        <Card>
          <p className="mb-3 text-sm font-medium text-slate-700">Correlaciones simples (Pearson)</p>
          <ul className="space-y-2 text-sm">
            {correlations.map((c) => (
              <li key={c.label} className="flex justify-between border-b border-slate-100 py-1">
                <span>{c.label}</span>
                <span className="font-medium">{c.value == null ? 'sin datos suficientes' : c.value.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
