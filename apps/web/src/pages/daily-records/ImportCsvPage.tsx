import { useRef, useState } from 'react';

import { useSelectedBusiness } from '../../features/businesses/SelectedBusinessContext';
import { importDailyRecordsCsv } from '../../services/dailyRecordService';
import { extractApiErrorMessage } from '../../services/apiClient';
import type { ImportCsvSummary } from '../../types/api';
import { Button, Card, EmptyState, ErrorBanner, Label, PageHeader, Select } from '../../components/ui';

export function ImportCsvPage() {
  const { selectedBusiness } = useSelectedBusiness();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [conflictStrategy, setConflictStrategy] = useState<'ignore' | 'overwrite'>('ignore');
  const [summary, setSummary] = useState<ImportCsvSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  if (!selectedBusiness) {
    return (
      <EmptyState
        title="Selecciona un negocio"
        description="Elige o crea un negocio antes de importar un histórico."
      />
    );
  }

  async function handleImport() {
    if (!selectedBusiness) {
      return;
    }
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Selecciona un archivo CSV.');
      return;
    }
    setError(null);
    setSummary(null);
    setIsImporting(true);
    try {
      const csvContent = await file.text();
      const { summary: result } = await importDailyRecordsCsv(
        selectedBusiness.id,
        csvContent,
        conflictStrategy,
      );
      setSummary(result);
    } catch (err) {
      setError(extractApiErrorMessage(err, 'No se ha podido importar el CSV.'));
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Importar histórico desde CSV"
        description={`Negocio: ${selectedBusiness.name} (CU-004).`}
      />

      <Card>
        <ErrorBanner message={error} />

        <p className="mb-3 text-sm text-slate-500">
          Formato esperado de la cabecera:{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
            fecha,caja,tickets,ticketMedio,clima,tempMax,tempMin,lluvia,viento,eventos,campania,seguidores,observaciones
          </code>
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="csv-file">Archivo CSV</Label>
            <input
              id="csv-file"
              type="file"
              accept=".csv,text/csv"
              ref={fileInputRef}
              className="block w-full text-sm text-slate-600"
            />
          </div>

          <div>
            <Label htmlFor="conflict">Si la fecha ya existe</Label>
            <Select
              id="conflict"
              value={conflictStrategy}
              onChange={(e) => setConflictStrategy(e.target.value as 'ignore' | 'overwrite')}
            >
              <option value="ignore">Ignorar fila</option>
              <option value="overwrite">Sobrescribir cierre existente</option>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? 'Importando...' : 'Importar'}
            </Button>
          </div>
        </div>

        {summary && (
          <div className="mt-6 rounded-md border border-slate-200 p-4 text-sm">
            <p>
              <span className="font-semibold text-emerald-600">{summary.imported}</span> filas importadas ·{' '}
              <span className="font-semibold text-amber-600">{summary.ignored}</span> filas ignoradas ·{' '}
              <span className="font-semibold text-red-600">{summary.errors.length}</span> errores
            </p>
            {summary.errors.length > 0 && (
              <ul className="mt-3 list-disc pl-5 text-red-600">
                {summary.errors.map((e, idx) => (
                  <li key={idx}>
                    Línea {e.line}: {e.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
