import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseOptimizedQueryOptions<T> {
  queryKey: string[];
  tableName?: string;
  selectFields?: string;
  filter?: Record<string, any>;
  customFn?: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
}

export function useOptimizedQuery<T>({
  queryKey,
  tableName,
  selectFields = '*',
  filter,
  customFn,
  enabled = true,
  staleTime = 2 * 60 * 1000,
  gcTime = 5 * 60 * 1000,
  refetchOnWindowFocus = false,
}: UseOptimizedQueryOptions<T>) {
  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      if (customFn) {
        return customFn();
      }

      if (!tableName) {
        throw new Error('Either tableName or customFn must be provided');
      }

      let query = supabase.from(tableName as any).select(selectFields);

      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as T;
    },
    enabled,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
  });
}
