import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSelectedBusiness } from '../../features/businesses/SelectedBusinessContext';
import {
  createDailyRecord,
  listDailyRecords,
  updateDailyRecord,
  type CreateDailyRecordInput,
} from '../../services/dailyRecordService';
import { extractApiErrorMessage } from '../../services/apiClient';
import { WEATHER_OPTIONS } from '../../types/api';
import type { DailyRecord } from '../../types/api';
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

const emptyForm: CreateDailyRecordInput = {
  date: new Date().toISOString().slice(0, 10),
  revenue: 0,
  tickets: 0,
  weather: '',
  tempMax: undefined,
  tempMin: undefined,
  rain: '',
  wind: '',
  event: '',
  campaign: '',
  socialFollowers: undefined,
  observations: '',
};

export function DailyRecordsPage() {
  const { selectedBusiness } = useSelectedBusiness();
  const queryClient = useQueryClient();
  const businessId = selectedBusiness?.id;

  const [form, setForm] = useState<CreateDailyRecordInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['daily-records', businessId],
    queryFn: () => listDailyRecords(businessId!),
    enabled: Boolean(businessId),
  });

  const records = [...(data?.records ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: CreateDailyRecordInput = {
        ...form,
        revenue: Number(form.revenue),
        tickets: Number(form.tickets),
        tempMax: form.tempMax != null && form.tempMax !== ('' as never) ? Number(form.tempMax) : null,
        tempMin: form.tempMin != null && form.tempMin !== ('' as never) ? Number(form.tempMin) : null,
        socialFollowers:
          form.socialFollowers != null && form.socialFollowers !== ('' as never)
            ? Number(form.socialFollowers)
            : null,
        weather: form.weather || null,
        rain: form.rain || null,
        wind: form.wind || null,
        event: form.event || null,
        campaign: form.campaign || null,
        observations: form.observations || null,
      };
      if (editingId) {
        return updateDailyRecord(businessId!, editingId, payload);
      }
      return createDailyRecord(businessId!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-records', businessId] });
      setForm(emptyForm);
      setEditingId(null);
      setError(null);
    },
    onError: (err) => setError(extractApiErrorMessage(err, 'No se ha podido guardar el cierre.')),
  });

  function handleEdit(record: DailyRecord) {
    setEditingId(record.id);
    setForm({
      date: record.date.slice(0, 10),
      revenue: record.revenue,
      tickets: record.tickets,
      weather: record.weather ?? '',
      tempMax: record.tempMax ?? undefined,
      tempMin: record.tempMin ?? undefined,
      rain: record.rain ?? '',
      wind: record.wind ?? '',
      event: record.event ?? '',
      campaign: record.campaign ?? '',
      socialFollowers: record.socialFollowers ?? undefined,
      observations: record.observations ?? '',
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    saveMutation.mutate();
  }

  if (!selectedBusiness) {
    return (
      <EmptyState
        title="Selecciona un negocio"
        description="Elige o crea un negocio para registrar sus cierres diarios."
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title="Cierres diarios"
          description={`Negocio: ${selectedBusiness.name} (CU-003 / CU-005).`}
        />
        <Link to="/daily-records/import">
          <Button variant="secondary">Importar CSV</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <ErrorBanner message={error} />
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <Label>Fecha</Label>
            <Input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <Label>Caja total</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              required
              value={form.revenue}
              onChange={(e) => setForm({ ...form, revenue: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Nº tickets</Label>
            <Input
              type="number"
              min={0}
              required
              value={form.tickets}
              onChange={(e) => setForm({ ...form, tickets: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Clima</Label>
            <Select value={form.weather ?? ''} onChange={(e) => setForm({ ...form, weather: e.target.value })}>
              <option value="">—</option>
              {WEATHER_OPTIONS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Temp. máxima (°C)</Label>
            <Input
              type="number"
              value={form.tempMax ?? ''}
              onChange={(e) => setForm({ ...form, tempMax: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div>
            <Label>Temp. mínima (°C)</Label>
            <Input
              type="number"
              value={form.tempMin ?? ''}
              onChange={(e) => setForm({ ...form, tempMin: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div>
            <Label>Lluvia</Label>
            <Input value={form.rain ?? ''} onChange={(e) => setForm({ ...form, rain: e.target.value })} />
          </div>
          <div>
            <Label>Viento</Label>
            <Input value={form.wind ?? ''} onChange={(e) => setForm({ ...form, wind: e.target.value })} />
          </div>
          <div>
            <Label>Evento relevante</Label>
            <Input value={form.event ?? ''} onChange={(e) => setForm({ ...form, event: e.target.value })} />
          </div>
          <div>
            <Label>Campaña/promoción</Label>
            <Input value={form.campaign ?? ''} onChange={(e) => setForm({ ...form, campaign: e.target.value })} />
          </div>
          <div>
            <Label>Seguidores en redes</Label>
            <Input
              type="number"
              value={form.socialFollowers ?? ''}
              onChange={(e) =>
                setForm({ ...form, socialFollowers: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </div>
          <div className="col-span-2 sm:col-span-3">
            <Label>Observaciones</Label>
            <Input
              value={form.observations ?? ''}
              onChange={(e) => setForm({ ...form, observations: e.target.value })}
            />
          </div>

          <div className="col-span-2 flex items-end justify-end gap-2 sm:col-span-3">
            {editingId && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancelar edición
              </Button>
            )}
            <Button type="submit" disabled={saveMutation.isPending}>
              {editingId ? 'Guardar cambios' : 'Registrar cierre'}
            </Button>
          </div>
        </form>
      </Card>

      {isLoading && <p className="text-sm text-slate-500">Cargando cierres...</p>}

      {!isLoading && records.length === 0 && (
        <EmptyState title="Sin cierres registrados" description="Registra el primer cierre con el formulario." />
      )}

      {records.length > 0 && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Caja</th>
                <th className="px-4 py-2">Tickets</th>
                <th className="px-4 py-2">Ticket medio</th>
                <th className="px-4 py-2">Clima</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{record.revenue.toFixed(2)}</td>
                  <td className="px-4 py-2">{record.tickets}</td>
                  <td className="px-4 py-2">{record.averageTicket.toFixed(2)}</td>
                  <td className="px-4 py-2">{record.weather ?? '—'}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      className="font-medium text-sky-600 hover:text-sky-700"
                      onClick={() => handleEdit(record)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
