import { useState, useEffect, useCallback } from 'react';
import type { DbCategory } from '../../services/enka/types';
import { enkaRepository } from '../../services/enka';
import { useAuth } from '../../context';

export function useRealCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    if (!user) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const result = await enkaRepository.fetchCategories();
    if (result.error) {
      setError(result.error.message);
    } else {
      setCategories(result.data || []);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchInitial() {
      if (!user) {
        setCategories([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      const result = await enkaRepository.fetchCategories();
      if (!isCancelled) {
        if (result.error) {
          setError(result.error.message);
        } else {
          setCategories(result.data || []);
        }
        setIsLoading(false);
      }
    }

    void fetchInitial();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  const createCategory = async (
    categoryData: Omit<DbCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<{ data: DbCategory | null; error: string | null }> => {
    const result = await enkaRepository.createCategory(categoryData);
    if (result.error) {
      return { data: null, error: result.error.message };
    }
    if (result.data) {
      setCategories((prev) => [...prev, result.data!]);
      window.dispatchEvent(new Event('enka:data-changed'));
    }
    return { data: result.data, error: null };
  };

  const updateCategory = async (
    id: string,
    updates: Partial<Omit<DbCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<{ data: DbCategory | null; error: string | null }> => {
    const result = await enkaRepository.updateCategory(id, updates);
    if (result.error) {
      return { data: null, error: result.error.message };
    }
    if (result.data) {
      setCategories((prev) => prev.map((c) => (c.id === id ? result.data! : c)));
      window.dispatchEvent(new Event('enka:data-changed'));
    }
    return { data: result.data, error: null };
  };

  const deleteCategory = async (id: string): Promise<{ success: boolean; error: string | null }> => {
    const result = await enkaRepository.deleteCategory(id);
    if (result.error) {
      return { success: false, error: result.error.message };
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    window.dispatchEvent(new Event('enka:data-changed'));
    return { success: true, error: null };
  };

  return {
    categories,
    isLoading,
    error,
    reloadCategories: loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
