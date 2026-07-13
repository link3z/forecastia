import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSelectedBusiness } from '../../features/businesses/SelectedBusinessContext';
import { createBusiness } from '../../services/businessService';
import { extractApiErrorMessage } from '../../services/apiClient';
import { BUSINESS_TYPE_OPTIONS, DEFAULT_THRESHOLDS } from '../../types/api';
import { Button, Card, ErrorBanner, Input, Label, PageHeader, Select } from '../../components/ui';

export function CreateBusinessPage() {
  const navigate = useNavigate();
  const { refetch, selectBusiness } = useSelectedBusiness();

  const [name, setName] = useState('');
  const [type, setType] = useState<string>(BUSINESS_TYPE_OPTIONS[0]);
  const [location, setLocation] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isSeasonal, setIsSeasonal] = useState(false);
  const [seasonStart, setSeasonStart] = useState('');
  const [seasonEnd, setSeasonEnd] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { business } = await createBusiness({
        name,
        type,
        location,
        currency,
        startDate,
        isSeasonal,
        seasonStart: isSeasonal && seasonStart ? seasonStart : null,
        seasonEnd: isSeasonal && seasonEnd ? seasonEnd : null,
        thresholds: DEFAULT_THRESHOLDS,
      });
      await refetch();
      selectBusiness(business.id);
      navigate('/businesses');
    } catch (err) {
      setError(extractApiErrorMessage(err, 'No se ha podido crear el negocio.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Crear negocio" description="Define los datos básicos de tu negocio (CU-001)." />

      <Card>
        <ErrorBanner message={error} />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo de negocio</Label>
              <Select id="type" value={type} onChange={(e) => setType(e.target.value)}>
                {BUSINESS_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">Moneda</Label>
              <Input
                id="currency"
                required
                maxLength={3}
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="startDate">Fecha de inicio</Label>
            <Input
              id="startDate"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isSeasonal}
              onChange={(e) => setIsSeasonal(e.target.checked)}
            />
            Negocio estacional
          </label>

          {isSeasonal && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seasonStart">Inicio de temporada</Label>
                <Input
                  id="seasonStart"
                  type="date"
                  value={seasonStart}
                  onChange={(e) => setSeasonStart(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="seasonEnd">Fin de temporada</Label>
                <Input
                  id="seasonEnd"
                  type="date"
                  value={seasonEnd}
                  onChange={(e) => setSeasonEnd(e.target.value)}
                />
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400">
            Umbrales de predicción por defecto: {DEFAULT_THRESHOLDS.join(', ')} {currency}.
          </p>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear negocio'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
