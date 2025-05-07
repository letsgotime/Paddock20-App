import { useContext } from 'react';
import { AuthContext } from '../context/SupabaseAuthContext';

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};