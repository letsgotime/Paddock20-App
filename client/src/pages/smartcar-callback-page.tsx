import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Car, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Component for handling authorization code exchange with Smartcar
export default function SmartcarCallbackPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Processing your vehicle connection...');
  const [error, setError] = useState<string | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);

  useEffect(() => {
    // Get the code from URL params
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (!code) {
      setStatus('error');
      setError('No authorization code received from Smartcar');
      return;
    }

    // Exchange the code for access token and get vehicle info
    const exchangeCode = async () => {
      try {
        const response = await apiRequest('POST', '/api/smartcar/exchange', { code });
        const data = await response.json();
        
        if (data.success) {
          setStatus('success');
          setMessage('Vehicle connected successfully!');
          setVehicleInfo(data.vehicle);
        } else {
          setStatus('error');
          setError(data.message || 'Failed to connect your vehicle');
        }
      } catch (err) {
        console.error('Error exchanging code:', err);
        setStatus('error');
        setError('Failed to process vehicle connection');
      }
    };

    if (user) {
      exchangeCode();
    } else {
      setStatus('error');
      setError('You need to be logged in to connect your vehicle');
    }
  }, [user]);

  // Content based on status
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-16 w-16 animate-spin text-carolina-blue mb-4" />
            <p className="text-lg">{message}</p>
          </div>
        );
        
      case 'success':
        return (
          <>
            <div className="flex flex-col items-center py-6">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-4 text-center">{message}</h2>
              
              {vehicleInfo && (
                <div className="w-full max-w-md bg-slate-50 rounded-lg p-4 border mb-4">
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <Car className="mr-2 h-5 w-5 text-carolina-blue" />
                    Vehicle Information
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-600">Make:</span>
                      <span className="font-medium">{vehicleInfo.make}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">{vehicleInfo.model}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Year:</span>
                      <span className="font-medium">{vehicleInfo.year}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-mono text-sm">{vehicleInfo.id}</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </>
        );
        
      case 'error':
        return (
          <div className="py-6">
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        );
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-6 w-6 text-carolina-blue" />
            <span>Smartcar Connection</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {renderContent()}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => navigate('/')}
            className={status === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {status === 'success' ? 'Go to Dashboard' : 'Return to Home'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}