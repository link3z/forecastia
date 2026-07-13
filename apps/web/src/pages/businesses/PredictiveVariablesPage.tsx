import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getBusiness, getPredictiveVariables, updatePredictiveVariables } from '../../services/businessService';
import { extractApiErrorMessage } from '../../services/apiClient';
import type { PredictiveVariableConfig } from '../../types/api';
import { Button, Card, ErrorBanner, PageHeader, SuccessBanner } from '../../components/ui';

const VARIABLE_LABELS: { key: keyof PredictiveVariableConfig; label: string }[] = [
  { key: 'useWeather', label: 'Clima' },
  { key: 'useTemperature', label: 'Temperatura (máx./mín.)' },
  { key: 'useRain', label: 'Lluvia' },
  { key: 'useWind', label: 'Viento' },
  { key: 'useEvents', label: 'Eventos' },
  { key: 'useCampaigns', label: 'Campañas/promociones' },
  { key: 'useSocialFollowers', label: 'Seguidores en redes sociales' },
  { key: 'useObservations', label: 'Observaciones manuales' },
];

export function PredictiveVariablesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const businessId = id!;

  const { data: business } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => getBusiness(businessId).then((r) => r.business),
  });

  const { data: currentConfig, isLoading } = useQuery({
    queryKey: ['predictive-variables', businessId],
    queryFn: () => getPredictiveVariables(businessId).then((r) => r.predictiveVariableConfig),
  });

  const [config, setConfig] = useState<Record<string, boolean> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentConfig) {
      setConfig({
        useWeather: currentConfig.useWeather,
        useTemperature: currentConfig.useTemperature,
        useRain: currentConfig.useRain,
        useWind: currentConfig.useWind,
        useEvents: currentConfig.useEvents,
        useCampaigns: currentConfig.useCampaigns,
        useSocialFollowers: currentConfig.useSocialFollowers,
        useObservations: currentConfig.useObservations,
      });
    }
  }, [currentConfig]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!config) return;
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      await updatePredictiveVariables(businessId, config);
      setSuccess('Variables predictivas guardadas correctamente.');
    } catch (err) {
      setError(extractApiErrorMessage(err, 'No se han podido guardar las variables.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !config) {
    return <p className="text-sm text-slate-500">Cargando...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={`Variables predictivas — ${business?.name ?? ''}`}
        description="Elige qué variables se usarán en el modelo predictivo (CU-002)."
      />

      <Card>
        <ErrorBanner message={error} />
        <SuccessBanner message={success} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {VARIABLE_LABELS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(config[key])}
                onChange={(e) => setConfig({ ...config, [key]: e.target.checked })}
              />
              {label}
            </label>
          ))}

          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/businesses')}>
              Volver
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
