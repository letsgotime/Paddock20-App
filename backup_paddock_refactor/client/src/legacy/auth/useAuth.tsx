// Direct hook implementation rather than re-exporting
import { useContext } from 'react';
import { AuthContext } from '../context/SupabaseAuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};