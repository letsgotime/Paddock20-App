import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, Link as LinkIcon, Shield, Bluetooth, Loader2 } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Component for initiating the Smartcar connection process
export default function ConnectVehiclePage() {
  const { user } = useAuth();
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get the Smartcar authorization URL
    const getAuthUrl = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiRequest('GET', '/api/smartcar/auth-url');
        const data = await response.json();
        
        if (data.authUrl) {
          setAuthUrl(data.authUrl);
        } else {
          setError(data.message || 'Failed to get authorization URL');
        }
      } catch (err) {
        console.error('Error getting auth URL:', err);
        setError('Failed to connect to Smartcar service');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      getAuthUrl();
    } else {
      setLoading(false);
      setError('You need to be logged in to connect your vehicle');
    }
  }, [user]);

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8 flex items-center">
        <Car className="mr-2 h-8 w-8 text-carolina-blue" />
        <span>Connect Your Vehicle</span>
      </h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Smartcar connection card */}
        <Card className={`overflow-hidden ${authUrl ? 'border-carolina-blue border-2' : ''}`}>
          <CardHeader className="bg-gradient-to-r from-blue-900 to-carolina-blue pb-8">
            <CardTitle className="text-white flex items-center">
              <Car className="mr-2 h-5 w-5" />
              <span>Smartcar Connection</span>
            </CardTitle>
            <CardDescription className="text-gray-100">
              Connect with supported vehicle platforms
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-10 w-10 animate-spin text-carolina-blue" />
              </div>
            ) : error ? (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-4">
                  <p>
                    Connecting your vehicle with Smartcar provides enhanced features:
                  </p>
                  
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Shield className="mt-1 h-4 w-4 mr-2 text-green-500 shrink-0" />
                      <span>Secure, read-only access to vehicle data</span>
                    </li>
                    <li className="flex items-start">
                      <LinkIcon className="mt-1 h-4 w-4 mr-2 text-green-500 shrink-0" />
                      <span>Works with Tesla, BMW, Ford, GM, and more</span>
                    </li>
                    <li className="flex items-start">
                      <Car className="mt-1 h-4 w-4 mr-2 text-green-500 shrink-0" />
                      <span>Vehicle information, location, and odometer</span>
                    </li>
                  </ul>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100 text-blue-800">
                    <p className="text-sm font-medium mb-1">Compatible Brands Include:</p>
                    <p className="text-sm">Tesla, BMW, Mercedes-Benz, Volkswagen, Ford, GM, Hyundai, Kia, Toyota, Honda, Nissan, FCA (Jeep, Dodge), and more</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          
          <CardFooter>
            {authUrl ? (
              <Button 
                className="w-full bg-carolina-blue hover:bg-blue-600" 
                asChild
              >
                <a href={authUrl} target="_self">
                  <Car className="mr-2 h-4 w-4" />
                  Connect with Smartcar
                </a>
              </Button>
            ) : (
              <Button 
                className="w-full" 
                disabled={loading || !!error}
              >
                <Car className="mr-2 h-4 w-4" />
                {loading ? 'Loading...' : 'Connect with Smartcar'}
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* OBD-II connection card */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 pb-8">
            <CardTitle className="text-white flex items-center">
              <Bluetooth className="mr-2 h-5 w-5" />
              <span>OBD-II Connection</span>
            </CardTitle>
            <CardDescription className="text-gray-200">
              Connect with your own OBD-II adapter
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p>
                Connect using an ELM327-compatible OBD-II adapter for advanced diagnostics:
              </p>
              
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Bluetooth className="mt-1 h-4 w-4 mr-2 text-carolina-blue shrink-0" />
                  <span>Works with Bluetooth, WiFi, or USB adapters</span>
                </li>
                <li className="flex items-start">
                  <Shield className="mt-1 h-4 w-4 mr-2 text-carolina-blue shrink-0" />
                  <span>Direct connection to your vehicle's ECU</span>
                </li>
                <li className="flex items-start">
                  <Car className="mt-1 h-4 w-4 mr-2 text-carolina-blue shrink-0" />
                  <span>Real-time sensor data and diagnostic codes</span>
                </li>
              </ul>
              
              <div className="mt-4 p-3 bg-slate-100 rounded border border-slate-200 text-slate-800">
                <p className="text-sm font-medium mb-1">Works With Most Vehicles:</p>
                <p className="text-sm">Compatible with any vehicle that has an OBD-II port (generally all vehicles manufactured after 1996). Access engine parameters, sensor data, and diagnostic trouble codes.</p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              variant="outline"
              className="w-full" 
              asChild
            >
              <Link to="/obd-diagnostics">
                <Bluetooth className="mr-2 h-4 w-4" />
                Open OBD Diagnostics
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-10 bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="mr-2 h-5 w-5 text-carolina-blue" />
          <span>Your Privacy & Security</span>
        </h2>
        <p className="mb-4">
          Paddock20 values your privacy and security. We follow industry best practices:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start">
            <Shield className="mt-1 h-4 w-4 mr-2 text-green-500 shrink-0" />
            <span>All data is encrypted in transit and at rest</span>
          </li>
          <li className="flex items-start">
            <Shield className="mt-1 h-4 w-4 mr-2 text-green-500 shrink-0" />
            <span>Vehicle connections are read-only by default</span>
          </li>
          <li className="flex items-start">
            <Shield className="mt-1 h-4 w-4 mr-2 text-green-500 shrink-0" />
            <span>You can disconnect your vehicle at any time</span>
          </li>
        </ul>
      </div>
    </div>
  );
}