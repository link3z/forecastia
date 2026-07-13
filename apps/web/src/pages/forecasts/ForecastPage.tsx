import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';

import { useSelectedBusiness } from '../../features/businesses/SelectedBusinessContext';
import { generateForecast, type Forecast } from '../../services/forecastService';
import { extractApiErrorMessage } from '../../services/apiClient';
import { WEATHER_OPTIONS } from '../../types/api';
import {
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  Input,
  Label,
  PageHeader,
  Select,
} from '../../components/ui';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function ForecastPage() {
  const { selectedBusiness } = useSelectedBusiness();
  const queryClient = useQueryClient();

  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [weather, setWeather] = useState('');
  const [tempMax, setTempMax] = useState('');
  const [tempMin, setTempMin] = useState('');
  const [rain, setRain] = useState('');
  const [wind, setWind] = useState('');
  const [event, setEvent] = useState('');
  const [campaign, setCampaign] = useState('');
  const [observations, setObservations] = useState('');
  const [result, setResult] = useState<Forecast | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (input: Parameters<typeof generateForecast>[1]) =>
      generateForecast(selectedBusiness!.id, input),
    onSuccess: (forecast) => {
      setResult(forecast);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['forecasts', selectedBusiness!.id] });
    },
    onError: (err) => {
      setError(extractApiErrorMessage(err, 'No se ha podido generar la predicción.'));
    },
  });

  if (!selectedBusiness) {
    return <EmptyState title="Selecciona un negocio" />;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setResult(null);
    mutation.mutate({
      targetDate,
      weather: weather || null,
      tempMax: tempMax !== '' ? Number(tempMax) : null,
      tempMin: tempMin !== '' ? Number(tempMin) : null,
      rain: rain || null,
      wind: wind || null,
      event: event || null,
      campaign: campaign || null,
      observations: observations || null,
    });
  }

  const targetDayName = targetDate
    ? DAY_NAMES[new Date(targetDate + 'T00:00:00Z').getUTCDay()] ?? ''
    : '';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Generar predicción"
        description={`Negocio: ${selectedBusiness.name} (CU-009 / CU-010).`}
      />

      <Card>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Fecha objetivo{targetDayName ? ` — ${targetDayName}` : ''}</Label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Clima previsto</Label>
            <Select value={weather} onChange={(e) => setWeather(e.target.value)}>
              <option value="">—</option>
              {WEATHER_OPTIONS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Lluvia prevista (descripción)</Label>
            <Input
              placeholder="ej. ligera, fuerte, sin lluvia…"
              value={rain}
              onChange={(e) => setRain(e.target.value)}
            />
          </div>

          <div>
            <Label>Temp. máxima prevista (°C)</Label>
            <Input
              type="number"
              step="0.5"
              value={tempMax}
              onChange={(e) => setTempMax(e.target.value)}
            />
          </div>

          <div>
            <Label>Temp. mínima prevista (°C)</Label>
            <Input
              type="number"
              step="0.5"
              value={tempMin}
              onChange={(e) => setTempMin(e.target.value)}
            />
          </div>

          <div>
            <Label>Viento previsto</Label>
            <Input
              placeholder="ej. calma, moderado, fuerte…"
              value={wind}
              onChange={(e) => setWind(e.target.value)}
            />
          </div>

          <div>
            <Label>Evento previsto</Label>
            <Input
              placeholder="ej. Feria local, Regata…"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
            />
          </div>

          <div>
            <Label>Campaña prevista</Label>
            <Input
              placeholder="ej. Menú verano, 2×1…"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <Label>Observaciones</Label>
            <Input value={observations} onChange={(e) => setObservations(e.target.value)} />
          </div>

          <div className="col-span-2 flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Calculando…' : 'Generar predicción'}
            </Button>
          </div>
        </form>
      </Card>

      <ErrorBanner message={error} />

      {result && <ForecastResultCard forecast={result} />}
    </div>
  );
}

// ── Componente resultado ───────────────────────────────────────────────────────

function ForecastResultCard({ forecast }: { forecast: Forecast }) {
  const fmt = (v: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);

  return (
    <Card className="space-y-5">
      <h2 className="text-lg font-semibold text-slate-800">Resultado de la predicción</h2>

      {/* Escenarios */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <ScenarioBox label="Pesimista" value={fmt(forecast.pessimisticScenario)} color="red" />
        <ScenarioBox label="Esperado" value={fmt(forecast.expectedRevenue)} color="blue" />
        <ScenarioBox label="Optimista" value={fmt(forecast.optimisticScenario)} color="emerald" />
      </div>

      <p className="text-center text-xs text-slate-500">
        Intervalo: {fmt(forecast.minRevenue)} – {fmt(forecast.maxRevenue)}
      </p>

      {/* Probabilidades */}
      {Object.keys(forecast.probabilities).length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-600">
            Probabilidad de superar umbrales
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {Object.entries(forecast.probabilities).map(([threshold, prob]) => (
              <div
                key={threshold}
                className="rounded-md border border-slate-200 p-2 text-center text-xs"
              >
                <div className="font-semibold text-slate-700">{fmt(Number(threshold))}</div>
                <div
                  className={`mt-0.5 font-bold ${
                    Number(prob) >= 0.7
                      ? 'text-emerald-600'
                      : Number(prob) >= 0.4
                        ? 'text-amber-600'
                        : 'text-red-600'
                  }`}
                >
                  {(Number(prob) * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Factores influyentes */}
      {forecast.influencingFactors.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-600">Factores considerados</h3>
          <ul className="space-y-1">
            {forecast.influencingFactors.map((f, idx) => (
              <li key={idx} className="text-xs text-slate-600">
                <span className="font-medium capitalize">{f.factor.replace('_', ' ')}</span>
                {f.effect !== 0 && (
                  <span
                    className={`ml-1 font-semibold ${f.effect > 0 ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    ({f.effect > 0 ? '+' : ''}
                    {(f.effect * 100).toFixed(0)}%)
                  </span>
                )}{' '}
                — {f.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Explicación IA (disponible en Fase 5) */}
      {forecast.aiExplanation && (
        <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
          <span className="font-semibold">Análisis IA: </span>
          {forecast.aiExplanation}
        </div>
      )}
    </Card>
  );
}

function ScenarioBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: 'red' | 'blue' | 'emerald';
}) {
  const colorClasses: Record<string, string> = {
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };
  return (
    <div className={`rounded-lg border p-3 ${colorClasses[color]}`}>
      <div className="text-xs font-medium opacity-75">{label}</div>
      <div className="mt-1 text-base font-bold">{value}</div>
    </div>
  );
}
