import { useState } from 'react';

import { useSelectedBusiness } from '../../features/businesses/SelectedBusinessContext';
import { apiClient } from '../../services/apiClient';
import { Button, Card, EmptyState, ErrorBanner, PageHeader } from '../../components/ui';

type ExportTarget = 'csv-records' | 'csv-metrics' | 'json' | 'report';

export function ExportsPage() {
  const { selectedBusiness } = useSelectedBusiness();
  const [loading, setLoading] = useState<ExportTarget | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!selectedBusiness) {
    return <EmptyState title="Selecciona un negocio" />;
  }

  async function download(target: ExportTarget) {
    if (!selectedBusiness) return;
    setError(null);
    setLoading(target);

    try {
      let url: string;
      let mimeType: string;

      switch (target) {
        case 'csv-records':
          url = `/businesses/${selectedBusiness.id}/export/csv?target=records`;
          mimeType = 'text/csv';
          break;
        case 'csv-metrics':
          url = `/businesses/${selectedBusiness.id}/export/csv?target=metrics`;
          mimeType = 'text/csv';
          break;
        case 'json':
          url = `/businesses/${selectedBusiness.id}/export/json`;
          mimeType = 'application/json';
          break;
        case 'report':
          url = `/businesses/${selectedBusiness.id}/export/report.md`;
          mimeType = 'text/markdown';
          break;
        default:
          return;
      }

      const response = await apiClient.get(url, { responseType: 'blob' });

      // Extraer nombre de archivo del header Content-Disposition
      const disposition: string =
        (response.headers as Record<string, string>)['content-disposition'] ?? '';
      const match = /filename="([^"]+)"/.exec(disposition);
      const filename = match?.[1] ?? `export-${selectedBusiness.id}`;

      // Trigger de descarga en el navegador
      const blob = new Blob([response.data as BlobPart], { type: mimeType });
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      setError(
        'No se ha podido descargar el archivo. Comprueba que el servidor está en marcha.',
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title="Exportaciones"
        description={`Negocio: ${selectedBusiness.name}`}
      />

      <ErrorBanner message={error} />

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Cierres y métricas (CSV)
        </h2>

        <ExportButton
          label="Exportar cierres diarios (CSV)"
          description="Formato compatible con la importación. Incluye todas las variables registradas."
          isLoading={loading === 'csv-records'}
          onClick={() => void download('csv-records')}
        />

        <ExportButton
          label="Exportar métricas principales (CSV)"
          description="Resumen de indicadores clave: caja acumulada, media, tickets, tendencia."
          isLoading={loading === 'csv-metrics'}
          onClick={() => void download('csv-metrics')}
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Datos completos (JSON)
        </h2>

        <ExportButton
          label="Exportar todos los datos (JSON)"
          description="Incluye negocio, cierres, métricas y predicciones. Ideal para backup o integración."
          isLoading={loading === 'json'}
          onClick={() => void download('json')}
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Informe (Markdown)
        </h2>

        <ExportButton
          label="Generar informe completo (Markdown)"
          description="Informe con métricas, evolución mensual, últimas predicciones y recomendaciones."
          isLoading={loading === 'report'}
          onClick={() => void download('report')}
        />
      </Card>
    </div>
  );
}

function ExportButton({
  label,
  description,
  isLoading,
  onClick,
}: {
  label: string;
  description: string;
  isLoading: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <Button
        variant="secondary"
        onClick={onClick}
        disabled={isLoading}
        className="shrink-0"
      >
        {isLoading ? 'Descargando…' : 'Descargar'}
      </Button>
    </div>
  );
}
