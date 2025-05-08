import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import OBDManager from '@/components/OBDManager';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Loader2, AlertTriangle, InfoIcon } from 'lucide-react';

export default function OBDDiagnosticsPage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to access vehicle diagnostics.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/auth')}>Log In</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <InfoIcon className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-700">Vehicle Diagnostics</AlertTitle>
        <AlertDescription className="text-blue-600">
          Connect to your vehicle's OBD-II port to view real-time diagnostics. 
          You'll need an ELM327 OBD-II adapter (USB, Bluetooth, or WiFi) and a compatible vehicle (generally post-1996).
        </AlertDescription>
      </Alert>
      
      <OBDManager />
    </div>
  );
}