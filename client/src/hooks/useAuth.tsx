/**
 * Authentication Hook
 * 
 * Provides a unified interface for authentication
 * across the application.
 */

import { useContext } from 'react';
import { NativeAuthContext } from '../context/NativeAuthContext';

export function useAuth() {
  const context = useContext(NativeAuthContext);

  if (!context) {
    throw new Error('useAuth must be used within a NativeAuthProvider');
  }

  return context;
}