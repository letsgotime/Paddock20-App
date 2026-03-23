import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create a completely mocked Supabase client to avoid any initialization issues
// This prevents URL construction errors while allowing the app to function in demo mode
console.log("Using mocked Supabase client for demo/development");

// Create a mock Supabase client that safely intercepts all method calls
// and returns empty data arrays to prevent runtime errors
const mockSupabase = new Proxy({}, {
  get: function(target, prop) {
    // Return a function for any method access
    return function() {
      // For method chaining (from, select, insert, etc.), return this proxy again
      if (['from', 'select', 'insert', 'update', 'delete', 'eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'is', 'in', 'contains', 'containedBy', 'rangeLt', 'rangeGt', 'rangeGte', 'rangeLte', 'textSearch', 'filter', 'not', 'or', 'and'].includes(prop as string)) {
        return mockSupabase;
      }
      
      // For terminal operations, return mock data wrapped in a promise
      return Promise.resolve({
        data: [],
        error: null
      });
    };
  }
});

// Export the mock client for all Supabase operations
export const supabase = mockSupabase;

/**
 * Extracts the Auth0 user ID for Supabase integration
 * @returns The Auth0 user.sub value or null if not authenticated
 */
export function useUserId(): string | null {
  const { user, isAuthenticated } = useAuth0();
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    if (isAuthenticated && user && user.sub) {
      setUserId(user.sub);
    } else {
      setUserId(null);
    }
  }, [user, isAuthenticated]);
  
  return userId;
}

/**
 * Helper hook for accessing user-scoped Supabase tables
 * @param tableName Supabase table name
 * @returns Object with select and insert methods
 */
export function useUserData(tableName: string) {
  const userId = useUserId();
  
  // Select user's data from table
  const select = async () => {
    if (!userId) return { data: null, error: new Error('Not authenticated') };
    
    try {
      return await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', userId);
    } catch (error) {
      console.error(`Error selecting from ${tableName}:`, error);
      return { 
        data: null, 
        error: new Error(`Failed to query ${tableName}`) 
      };
    }
  };
  
  // Insert data with user_id
  const insert = async (data: any) => {
    if (!userId) return { data: null, error: new Error('Not authenticated') };
    
    try {
      return await supabase
        .from(tableName)
        .insert({
          ...data,
          user_id: userId
        })
        .select();
    } catch (error) {
      console.error(`Error inserting into ${tableName}:`, error);
      return { 
        data: null, 
        error: new Error(`Failed to insert into ${tableName}`) 
      };
    }
  };
  
  // Update data by ID, ensuring user_id matches
  const update = async (id: string | number, data: any) => {
    if (!userId) return { data: null, error: new Error('Not authenticated') };
    
    try {
      return await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .eq('user_id', userId)
        .select();
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      return { 
        data: null, 
        error: new Error(`Failed to update ${tableName}`) 
      };
    }
  };
  
  // Delete data by ID, ensuring user_id matches
  const remove = async (id: string | number) => {
    if (!userId) return { data: null, error: new Error('Not authenticated') };
    
    try {
      return await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
    } catch (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      return { 
        data: null, 
        error: new Error(`Failed to delete from ${tableName}`) 
      };
    }
  };
  
  return { select, insert, update, remove };
}