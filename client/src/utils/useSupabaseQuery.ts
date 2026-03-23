import { useEffect, useState } from 'react';
import { useUserId } from './supabaseAuth';
import { supabase } from './supabaseAuth';

/**
 * Generic query result type
 */
interface QueryResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
}

/**
 * Creates a user-scoped query for Supabase
 * Ensures all queries are filtered by the current user's Auth0 ID
 * 
 * @param tableName The Supabase table to query
 * @param options Query options like select columns, filters, etc.
 * @returns Query result with loading state and refetch function
 * 
 * @example
 * // Basic usage:
 * const { data, isLoading } = useSupabaseQuery('vehicles');
 * 
 * // With custom columns and additional filters:
 * const { data } = useSupabaseQuery('maintenance_logs', {
 *   select: 'id, type, date, mileage, description',
 *   additionalFilters: (query) => query.eq('vehicleId', activeVehicleId)
 * });
 */
export function useSupabaseQuery<T = any>(
  tableName: string,
  options: {
    select?: string;
    additionalFilters?: (query: any) => any;
    enabled?: boolean;
  } = {}
): QueryResult<T> {
  const userId = useUserId();
  const [result, setResult] = useState<QueryResult<T>>({
    data: null,
    error: null,
    isLoading: true,
    isError: false,
    refetch: async () => {}
  });
  
  const { select = '*', additionalFilters, enabled = true } = options;
  
  const executeQuery = async () => {
    if (!userId || !enabled) {
      setResult(prev => ({ ...prev, isLoading: false }));
      return;
    }
    
    setResult(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Start with the base query
      let query = supabase
        .from(tableName)
        .select(select)
        .eq('user_id', userId);
      
      // Apply additional filters if provided
      if (additionalFilters) {
        query = additionalFilters(query);
      }
      
      // Execute the query
      const { data, error } = await query;
      
      if (error) throw error;
      
      setResult({
        data: data as T,
        error: null,
        isLoading: false,
        isError: false,
        refetch: executeQuery
      });
    } catch (error) {
      console.error(`Error querying ${tableName}:`, error);
      setResult({
        data: null,
        error: error as Error,
        isLoading: false,
        isError: true,
        refetch: executeQuery
      });
    }
  };
  
  useEffect(() => {
    executeQuery();
  }, [userId, tableName, select, enabled]);
  
  return result;
}

/**
 * Hook for user-scoped Supabase mutations
 * Automatically adds user_id to inserts based on the current Auth0 user
 * 
 * @param tableName The Supabase table to mutate
 * @returns Mutation functions with loading states
 * 
 * @example
 * const { insert, update, remove, isLoading } = useSupabaseMutation('vehicles');
 * 
 * // Insert a new vehicle (user_id is added automatically)
 * const handleAddVehicle = async () => {
 *   await insert({ make: 'Toyota', model: 'Supra', year: 2021 });
 * }
 */
export function useSupabaseMutation(tableName: string) {
  const userId = useUserId();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Insert with automatic user_id
  const insert = async <T extends Record<string, any>>(data: T) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert({
          ...data,
          user_id: userId
        })
        .select();
      
      if (error) throw error;
      
      setIsLoading(false);
      return result;
    } catch (err) {
      console.error(`Error inserting into ${tableName}:`, err);
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  };
  
  // Update with user_id security check
  const update = async <T extends Record<string, any>>(id: string | number, data: T) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .eq('user_id', userId) // Security check
        .select();
      
      if (error) throw error;
      
      setIsLoading(false);
      return result;
    } catch (err) {
      console.error(`Error updating ${tableName}:`, err);
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  };
  
  // Delete with user_id security check
  const remove = async (id: string | number) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
        .eq('user_id', userId); // Security check
      
      if (error) throw error;
      
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error(`Error deleting from ${tableName}:`, err);
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  };
  
  return {
    insert,
    update,
    remove,
    isLoading,
    error
  };
}