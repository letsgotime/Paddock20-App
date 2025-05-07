import { useContext } from 'react';
import { NativeAuthContext } from '../context/NativeAuthContext';

export const useAuth = () => {
  const context = useContext(NativeAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a NativeAuthProvider');
  }
  return context;
};