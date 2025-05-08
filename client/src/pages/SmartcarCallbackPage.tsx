import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';

export default function SmartcarCallbackPage() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [vehicleId, setVehicleId] = useState<string | null>(null);

  useEffect(() => {
    // Get the authorization code from the URL
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (error) {
      setStatus('error');
      setMessage(errorDescription || 'Authorization failed');
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received');
      return;
    }

    // Exchange the code for an access token
    const exchangeCode = async () => {
      try {
        const response = await apiRequest('POST', '/api/smartcar/exchange', { code });
        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Vehicle connected successfully!');
          setVehicleId(data.vehicleId);
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to connect vehicle');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Error connecting to vehicle service');
        console.error('Smartcar exchange error:', error);
      }
    };

    exchangeCode();
  }, []);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <CardHeader>
              <CardTitle>Connecting your vehicle</CardTitle>
              <CardDescription>Please wait while we establish a connection...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </CardContent>
          </>
        );
      
      case 'success':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span>Vehicle Connected</span>
              </CardTitle>
              <CardDescription>{message}</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-green-50 border-green-200 text-green-700">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Connection Successful</AlertTitle>
                <AlertDescription>
                  Your vehicle is now connected to PADDOCK20. You can access vehicle data and controls in the Garage.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => navigate('/garage')}>
                Go to Garage
              </Button>
              <Button onClick={() => navigate('/vehicle-dashboard')}>
                View Vehicle Dashboard
              </Button>
            </CardFooter>
          </>
        );
      
      case 'error':
        return (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <span>Connection Failed</span>
              </CardTitle>
              <CardDescription>{message}</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  There was a problem connecting your vehicle. Please try again or contact support if the issue persists.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => navigate('/')}>
                Return to Dashboard
              </Button>
              <Button onClick={() => navigate('/connect-vehicle')}>
                Try Again
              </Button>
            </CardFooter>
          </>
        );
    }
  };

  return (
    <div className="container max-w-lg mx-auto px-4 py-16">
      <Card className="border-2">{renderContent()}</Card>
    </div>
  );
}