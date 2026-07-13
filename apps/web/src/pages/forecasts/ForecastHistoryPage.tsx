import { useQuery } from '@tanstack/react-query';

import { useSelectedBusiness } from '../../features/businesses/SelectedBusinessContext';
import { listForecasts, type Forecast } from '../../services/forecastService';
import { Card, EmptyState, PageHeader } from '../../components/ui';

export function ForecastHistoryPage() {
  const { selectedBusiness } = useSelectedBusiness();

  const { data: forecasts, isLoading } = useQuery({
    queryKey: ['forecasts', selectedBusiness?.id],
    queryFn: () => listForecasts(selectedBusiness!.id),
    enabled: !!selectedBusiness,
  });

  if (!selectedBusiness) {
    return <EmptyState title="Selecciona un negocio" />;
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Cargando predicciones…</div>;
  }

  if (!forecasts || forecasts.length === 0) {
    return (
      <div>
        <PageHeader title="Histórico de predicciones" description={`Negocio: ${selectedBusiness.name}.`} />
        <EmptyState
          title="Sin predicciones todavía"
          description="Usa la pantalla «Generar predicción» para crear la primera."
        />
      </div>
    );
  }

  const fmt = (v: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);

  return (
    <div>
      <PageHeader
        title="Histórico de predicciones"
        description={`${forecasts.length} predicción(es) — ${selectedBusiness.name}.`}
      />

      <div className="space-y-3">
        {forecasts.map((f) => (
          <ForecastRow key={f.id} forecast={f} fmt={fmt} />
        ))}
      </div>
    </div>
  );
}

function ForecastRow({ forecast, fmt }: { forecast: Forecast; fmt: (v: number) => string }) {
  const date = new Date(forecast.targetDate).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const createdAt = new Date(forecast.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium capitalize text-slate-800">{date}</p>
        <p className="text-xs text-slate-500">Generada el {createdAt}</p>
      </div>
      <div className="flex gap-4 text-sm">
        <Scenario label="Pés." value={fmt(forecast.pessimisticScenario)} color="text-red-600" />
        <Scenario label="Esp." value={fmt(forecast.expectedRevenue)} color="text-blue-700 font-semibold" />
        <Scenario label="Opt." value={fmt(forecast.optimisticScenario)} color="text-emerald-600" />
      </div>
    </Card>
  );
}

function Scenario({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`text-sm ${color}`}>{value}</div>
    </div>
  );
}
