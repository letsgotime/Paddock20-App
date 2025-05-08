import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Loader2, Car, Link, Shield, WifiOff } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

/**
 * SmartcarConnect Component
 * 
 * This component handles the Smartcar connection flow and displays connected vehicle information.
 */
const SmartcarConnect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const { toast } = useToast();

  // Check if we have connected vehicles
  useEffect(() => {
    fetchConnectedVehicles();
  }, []);

  // Function to fetch connected vehicles list
  const fetchConnectedVehicles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiRequest('GET', '/api/smartcar/vehicles');
      const data = await response.json();
      
      if (response.ok) {
        setVehicles(data.vehicles || []);
      } else {
        // 401 is expected if no vehicles connected yet
        if (response.status !== 401) {
          setError(data.error || 'Failed to fetch connected vehicles');
        }
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to start the Smartcar authorization flow
  const startSmartcarAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiRequest('GET', '/api/smartcar/authorize');
      const data = await response.json();
      
      if (response.ok && data.authUrl) {
        // Redirect to Smartcar's authorization URL
        window.location.href = data.authUrl;
      } else {
        setError(data.error || 'Failed to start vehicle authorization');
        toast({
          title: 'Authorization Error',
          description: data.error || 'Failed to start vehicle authorization',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      console.error('Error starting authorization:', err);
      setError(err.message || 'Failed to start authorization');
      toast({
        title: 'Connection Error',
        description: err.message || 'Failed to connect to service',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to import a connected vehicle to the garage
  const importVehicle = async (vehicleId: string) => {
    try {
      setIsLoading(true);
      
      const response = await apiRequest('POST', `/api/smartcar/import/${vehicleId}`);
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Vehicle Imported',
          description: 'Vehicle successfully added to your garage',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Import Failed',
          description: data.error || 'Failed to import vehicle',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      console.error('Error importing vehicle:', err);
      toast({
        title: 'Import Error',
        description: err.message || 'An error occurred while importing the vehicle',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to disconnect from Smartcar
  const disconnectSmartcar = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiRequest('POST', '/api/smartcar/disconnect');
      const data = await response.json();
      
      if (response.ok) {
        setVehicles([]);
        toast({
          title: 'Disconnected',
          description: 'Vehicle connection successfully removed',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Disconnection Failed',
          description: data.error || 'Failed to disconnect vehicle',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      console.error('Error disconnecting:', err);
      toast({
        title: 'Disconnection Error',
        description: err.message || 'An error occurred while disconnecting',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl shadow-md border-zinc-800 bg-black/90 mb-8">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Car className="text-[#1982FC]" size={24} />
          <span>Connect Vehicle with Smartcar</span>
        </CardTitle>
        <CardDescription>
          Securely connect your vehicle using Smartcar's platform for real-time data
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-[#1982FC]" />
          </div>
        ) : vehicles.length > 0 ? (
          <div className="space-y-4">
            <div className="rounded-md bg-zinc-900 p-4 border border-zinc-800">
              <h3 className="text-lg font-medium mb-2 text-[#1982FC]">Connected Vehicles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="rounded-md bg-black p-4 border border-zinc-800">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-white">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h4>
                        <p className="text-sm text-zinc-400">{vehicle.id}</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => importVehicle(vehicle.id)}
                        className="bg-[#08c519] hover:bg-[#08c519]/80 text-white"
                      >
                        Import to Garage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between rounded-md bg-zinc-900 p-4 border border-zinc-800">
              <div className="flex items-center gap-2">
                <Shield className="text-[#1982FC]" />
                <span>Your vehicle connection is active</span>
              </div>
              <Button 
                variant="outline"
                onClick={disconnectSmartcar}
                className="border-red-600 text-red-500 hover:bg-red-900/20"
              >
                <WifiOff className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-md bg-zinc-900 p-6 text-center">
            <Car className="h-12 w-12 text-[#1982FC] mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Vehicles Connected</h3>
            <p className="text-zinc-400 mb-4 max-w-md mx-auto">
              Connect your vehicle to access real-time data such as odometer readings, 
              fuel level, location, and more.
            </p>
            <Button 
              onClick={startSmartcarAuth}
              className="bg-[#1982FC] hover:bg-[#1982FC]/80 text-white"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect Vehicle
            </Button>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 rounded-md bg-red-900/20 border border-red-600 text-red-500">
            {error}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-start text-xs text-zinc-500">
        <p className="mb-1">
          Uses Smartcar's secure platform - your login credentials are never shared.
        </p>
        <p>
          By connecting, you agree to the 
          <a 
            href="https://smartcar.com/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#1982FC] hover:underline mx-1"
          >
            Smartcar Terms of Service
          </a>
          and
          <a 
            href="https://smartcar.com/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#1982FC] hover:underline ml-1"
          >
            Privacy Policy
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SmartcarConnect;