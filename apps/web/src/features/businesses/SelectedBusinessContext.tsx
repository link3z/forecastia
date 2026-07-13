import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';

import { listBusinesses } from '../../services/businessService';
import type { Business } from '../../types/api';

const SELECTED_BUSINESS_KEY = 'forecastia.selectedBusinessId';

interface SelectedBusinessContextValue {
  businesses: Business[];
  isLoading: boolean;
  selectedBusiness: Business | null;
  selectBusiness: (businessId: string) => void;
  refetch: () => void;
}

const SelectedBusinessContext = createContext<SelectedBusinessContextValue | undefined>(
  undefined,
);

export function SelectedBusinessProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    localStorage.getItem(SELECTED_BUSINESS_KEY),
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['businesses'],
    queryFn: listBusinesses,
  });

  const businesses = data?.businesses ?? [];

  useEffect(() => {
    if (businesses.length === 0) return;
    const stillExists = businesses.some((b) => b.id === selectedId);
    if (!stillExists) {
      setSelectedId(businesses[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businesses]);

  const value = useMemo<SelectedBusinessContextValue>(
    () => ({
      businesses,
      isLoading,
      selectedBusiness: businesses.find((b) => b.id === selectedId) ?? null,
      selectBusiness(businessId: string) {
        setSelectedId(businessId);
        localStorage.setItem(SELECTED_BUSINESS_KEY, businessId);
      },
      refetch,
    }),
    [businesses, isLoading, selectedId, refetch],
  );

  return (
    <SelectedBusinessContext.Provider value={value}>{children}</SelectedBusinessContext.Provider>
  );
}

export function useSelectedBusiness(): SelectedBusinessContextValue {
  const ctx = useContext(SelectedBusinessContext);
  if (!ctx) {
    throw new Error('useSelectedBusiness debe usarse dentro de <SelectedBusinessProvider>.');
  }
  return ctx;
}
