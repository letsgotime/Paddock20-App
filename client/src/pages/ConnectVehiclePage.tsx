import React, { useEffect, useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Car, Info, Zap } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export default function ConnectVehiclePage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getAuthUrl = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest('GET', '/api/smartcar/auth-url');
        const data = await response.json();
        
        if (data.success) {
          setAuthUrl(data.authUrl);
        } else {
          setError(data.message || 'Failed to get authentication URL');
        }
      } catch (err) {
        setError('Error connecting to vehicle service');
        console.error('Error getting Smartcar auth URL:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      getAuthUrl();
    }
  }, [user]);

  if (loading) {
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
          <Info className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to connect your vehicle.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/auth')}>Log In</Button>
      </div>
    );
  }

  const handleConnect = () => {
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-6 w-6 text-carolina-blue" />
            <span>Connect Your Vehicle</span>
          </CardTitle>
          <CardDescription>
            Connect your vehicle to PADDOCK20 to unlock advanced features and insights.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-700">How It Works</AlertTitle>
            <AlertDescription className="text-blue-600">
              We use Smartcar to securely connect to your vehicle. You'll be redirected to select your vehicle
              and authorize connection. Your data is secure and you can revoke access at any time.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-slate-50">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Real-time Data</h3>
              </div>
              <p className="text-sm text-slate-600">
                Access odometer, fuel level, tire pressure, battery status and more from your dashboard.
              </p>
            </div>
            <div className="border rounded-lg p-4 bg-slate-50">
              <div className="flex items-center gap-2 mb-2">
                <Car className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Vehicle Controls</h3>
              </div>
              <p className="text-sm text-slate-600">
                Lock/unlock doors, start climate control, and access other remote features from anywhere.
              </p>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button 
            size="lg"
            onClick={handleConnect} 
            disabled={isLoading || !authUrl}
            className="bg-carolina-blue hover:bg-carolina-blue/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Loading...
              </>
            ) : (
              <>Connect My Vehicle</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}