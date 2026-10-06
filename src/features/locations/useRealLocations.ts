import { useState, useEffect, useCallback } from 'react';
import type { DbLocation } from '../../services/enka/types';
import { enkaRepository } from '../../services/enka';
import { useAuth } from '../../context';

export function useRealLocations() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<DbLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadLocations = useCallback(async () => {
    if (!user) {
      setLocations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const result = await enkaRepository.fetchLocations();
    if (result.error) {
      setError(result.error.message);
    } else {
      setLocations(result.data || []);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchInitial() {
      if (!user) {
        setLocations([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      const result = await enkaRepository.fetchLocations();
      if (!isCancelled) {
        if (result.error) {
          setError(result.error.message);
        } else {
          setLocations(result.data || []);
        }
        setIsLoading(false);
      }
    }

    void fetchInitial();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  const createLocation = async (
    locationData: Omit<DbLocation, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<{ data: DbLocation | null; error: string | null }> => {
    const result = await enkaRepository.createLocation(locationData);
    if (result.error) {
      return { data: null, error: result.error.message };
    }
    if (result.data) {
      setLocations((prev) => [result.data!, ...prev]);
    }
    return { data: result.data, error: null };
  };

  const updateLocation = async (
    id: string,
    updates: Partial<Omit<DbLocation, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<{ data: DbLocation | null; error: string | null }> => {
    const result = await enkaRepository.updateLocation(id, updates);
    if (result.error) {
      return { data: null, error: result.error.message };
    }
    if (result.data) {
      setLocations((prev) => prev.map((l) => (l.id === id ? result.data! : l)));
    }
    return { data: result.data, error: null };
  };

  const deleteLocation = async (id: string): Promise<{ success: boolean; error: string | null }> => {
    const result = await enkaRepository.deleteLocation(id);
    if (result.error) {
      return { success: false, error: result.error.message };
    }
    setLocations((prev) => prev.filter((l) => l.id !== id));
    return { success: true, error: null };
  };

  return {
    locations,
    isLoading,
    error,
    reloadLocations: loadLocations,
    createLocation,
    updateLocation,
    deleteLocation,
  };
}
