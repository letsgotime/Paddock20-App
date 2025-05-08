import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, PlayCircle, StopCircle, RefreshCw, Plug2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

type OBDConnectProps = {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export default function OBDConnect({ onConnect, onDisconnect }: OBDConnectProps) {
  const [status, setStatus] = useState<'idle' | 'starting' | 'connected' | 'disconnecting' | 'error'>('idle');
  const [serviceStatus, setServiceStatus] = useState<'running' | 'stopped' | 'loading'>('loading');
  const [availablePorts, setAvailablePorts] = useState<string[]>([]);
  const [selectedPort, setSelectedPort] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Check if the OBD service is running when the component mounts
  useEffect(() => {
    checkServiceStatus();
  }, []);

  // Check OBD service status
  const checkServiceStatus = async () => {
    try {
      const response = await fetch('/api/obd/status');
      const data = await response.json();
      
      setServiceStatus(data.running ? 'running' : 'stopped');
      
      // If service is running, update connection status
      if (data.running) {
        setStatus('connected');
        if (onConnect) onConnect();
      } else {
        setStatus('idle');
      }
    } catch (error) {
      console.error('Error checking OBD service status:', error);
      setServiceStatus('stopped');
      setStatus('idle');
    }
  };

  // Start the OBD service
  const startService = async () => {
    setStatus('starting');
    setErrorMessage(null);
    
    try {
      const response = await fetch('/api/obd/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setServiceStatus('running');
        setStatus('connected');
        toast({
          title: "OBD Service Started",
          description: "The OBD service has been started successfully",
        });
        if (onConnect) onConnect();
      } else {
        setServiceStatus('stopped');
        setStatus('error');
        setErrorMessage(data.message || 'Failed to start OBD service');
        toast({
          title: "Failed to Start OBD Service",
          description: data.message || 'Unknown error',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error starting OBD service:', error);
      setServiceStatus('stopped');
      setStatus('error');
      setErrorMessage('Network error: Could not communicate with the server');
      toast({
        title: "Connection Error",
        description: "Could not communicate with the server",
        variant: "destructive"
      });
    }
  };

  // Stop the OBD service
  const stopService = async () => {
    setStatus('disconnecting');
    
    try {
      const response = await fetch('/api/obd/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setServiceStatus('stopped');
        setStatus('idle');
        toast({
          title: "OBD Service Stopped",
          description: "The OBD service has been stopped successfully",
        });
        if (onDisconnect) onDisconnect();
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Failed to stop OBD service');
        toast({
          title: "Failed to Stop OBD Service",
          description: data.message || 'Unknown error',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error stopping OBD service:', error);
      setStatus('error');
      setErrorMessage('Network error: Could not communicate with the server');
      toast({
        title: "Connection Error",
        description: "Could not communicate with the server",
        variant: "destructive"
      });
    }
  };

  // Scan for available ports
  const scanPorts = async () => {
    setRefreshing(true);
    
    try {
      const response = await fetch('/api/obd/ports');
      const data = await response.json();
      
      if (data.ports && Array.isArray(data.ports)) {
        setAvailablePorts(data.ports);
        if (data.ports.length > 0 && !selectedPort) {
          setSelectedPort(data.ports[0]);
        }
        
        if (data.ports.length === 0) {
          toast({
            title: "No OBD Adapters Found",
            description: "Make sure your OBD adapter is connected to your computer",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error scanning ports:', error);
      toast({
        title: "Port Scan Failed",
        description: "Could not scan for available ports",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug2 className="h-5 w-5" />
          OBD-II Connection
        </CardTitle>
        <CardDescription>
          Connect to your vehicle using an OBD-II adapter to access real-time data
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Service Status:</span>
            <span className="flex items-center gap-2">
              {serviceStatus === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : serviceStatus === 'running' ? (
                <span className="text-sm font-medium text-green-500">Running</span>
              ) : (
                <span className="text-sm font-medium text-gray-500">Stopped</span>
              )}
            </span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection Status:</span>
            <span className="flex items-center gap-2">
              {status === 'starting' || status === 'disconnecting' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : status === 'connected' ? (
                <span className="text-sm font-medium text-green-500">Connected</span>
              ) : (
                <span className="text-sm font-medium text-gray-500">Disconnected</span>
              )}
            </span>
          </div>

          {availablePorts.length > 0 && (
            <>
              <Separator />
              
              <div className="grid gap-2">
                <label htmlFor="port-select" className="text-sm font-medium">
                  Available Ports:
                </label>
                <select 
                  id="port-select"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={selectedPort}
                  onChange={(e) => setSelectedPort(e.target.value)}
                >
                  {availablePorts.map((port) => (
                    <option key={port} value={port}>
                      {port}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={scanPorts} 
          disabled={refreshing || status === 'starting' || status === 'disconnecting'}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Scan for Adapters
        </Button>

        <div className="flex gap-2">
          {(status === 'idle' || status === 'error') && (
            <Button 
              size="sm"
              onClick={startService} 
              disabled={status === 'starting' || status === 'disconnecting'}
            >
              {status === 'starting' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <PlayCircle className="h-4 w-4 mr-2" />
              )}
              Connect
            </Button>
          )}

          {status === 'connected' && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={stopService} 
              disabled={status === 'disconnecting'}
            >
              {status === 'disconnecting' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <StopCircle className="h-4 w-4 mr-2" />
              )}
              Disconnect
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}