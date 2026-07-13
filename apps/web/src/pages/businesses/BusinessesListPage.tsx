import { Link } from 'react-router-dom';

import { useSelectedBusiness } from '../../features/businesses/SelectedBusinessContext';
import { Button, Card, EmptyState, PageHeader } from '../../components/ui';

export function BusinessesListPage() {
  const { businesses, isLoading, selectedBusiness, selectBusiness } = useSelectedBusiness();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title="Negocios"
          description="Gestiona los negocios sobre los que quieres generar predicciones."
        />
        <Link to="/businesses/new">
          <Button>Crear negocio</Button>
        </Link>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Cargando negocios...</p>}

      {!isLoading && businesses.length === 0 && (
        <EmptyState
          title="Todavía no tienes negocios"
          description="Crea tu primer negocio para empezar a registrar cierres diarios."
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {businesses.map((business) => (
          <Card key={business.id} className={business.id === selectedBusiness?.id ? 'ring-2 ring-sky-500' : ''}>
            <p className="font-semibold text-slate-900">{business.name}</p>
            <p className="text-sm text-slate-500">{business.type} · {business.location}</p>
            <p className="mt-2 text-xs text-slate-400">
              Moneda: {business.currency} · Inicio: {new Date(business.startDate).toLocaleDateString()}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {business.isSeasonal ? 'Negocio estacional' : 'Negocio no estacional'}
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" onClick={() => selectBusiness(business.id)}>
                Seleccionar
              </Button>
              <Link to={`/businesses/${business.id}/predictive-variables`}>
                <Button variant="secondary">Variables predictivas</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
