'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

interface Zone {
  id: string;
  name: string;
  total_parishioners: number;
  total_households: number;
}

interface ZonesContextType {
  zones: Zone[];
  isLoading: boolean;
  error: any;
  refresh: () => void;
}

const ZonesContext = createContext<ZonesContextType | undefined>(undefined);



export function ZonesProvider({ children }: { children: ReactNode }) {
  // We use SWR at the provider level to fetch the static data once
  // Revalidate options are set to prevent unnecessary refetching
  const { data, error, refetch: mutate, isLoading } = useQuery({
    queryKey: ['zones'],
    queryFn: () => apiFetch<any>('/api/v1/zones?limit=100'),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const zones = data?.data?.items || [];

  const value = {
    zones,
    isLoading,
    error,
    refresh: () => mutate(),
  };

  return (
    <ZonesContext.Provider value={value}>
      {children}
    </ZonesContext.Provider>
  );
}

export function useZones() {
  const context = useContext(ZonesContext);
  if (context === undefined) {
    throw new Error('useZones must be used within a ZonesProvider');
  }
  return context;
}
