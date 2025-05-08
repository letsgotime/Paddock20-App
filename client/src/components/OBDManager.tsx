import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertTriangle, CheckCircle2, Activity, Gauge, Thermometer, Fuel } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// OBD Service Status Types
interface OBDStatus {
  connected: boolean;
  port: string | null;
  protocol: string | null;
  status: string;
}

// OBD Data Types
interface OBDDataValue {
  command: string;
  desc: string;
  supported: boolean;
  value: number | null;
  unit: string | null;
  error?: string;
}

interface OBDData {
  [key: string]: OBDDataValue;
}

// OBD Service Health Response
interface OBDHealthResponse {
  serviceName: string;
  running: boolean;
  status?: OBDStatus;
  error?: string;
}

// DTC Code Types
interface DTCCode {
  code: string;
  description: string;
}

interface DTCResponse {
  supported: boolean;
  count: number;
  codes: DTCCode[];
  error?: string;
}

// Available Ports Response
interface PortsResponse {
  count: number;
  ports: string[];
  error?: string;
}

export default function OBDManager() {
  const queryClient = useQueryClient();
  const [selectedPort, setSelectedPort] = useState<string>('');
  
  // Query for OBD service health
  const { 
    data: healthData, 
    isLoading: healthLoading,
    isError: healthError,
    refetch: refetchHealth
  } = useQuery<OBDHealthResponse>({
    queryKey: ['/api/obd/health'],
    refetchInterval: 10000, // Check status every 10 seconds
  });
  
  // Query for available ports
  const {
    data: portsData,
    isLoading: portsLoading,
    refetch: refetchPorts
  } = useQuery<PortsResponse>({
    queryKey: ['/api/obd/ports'],
    enabled: healthData?.running === true,
  });
  
  // Query for OBD data (only when connected)
  const {
    data: obdData,
    isLoading: obdDataLoading,
    refetch: refetchOBDData
  } = useQuery<OBDData>({
    queryKey: ['/api/obd/data'],
    enabled: healthData?.status?.connected === true,
    refetchInterval: healthData?.status?.connected ? 2000 : false, // Refresh every 2 seconds when connected
  });
  
  // Query for DTC codes (only when connected)
  const {
    data: dtcData,
    isLoading: dtcLoading,
    refetch: refetchDTC
  } = useQuery<DTCResponse>({
    queryKey: ['/api/obd/dtc'],
    enabled: healthData?.status?.connected === true,
  });
  
  // Start OBD Service Mutation
  const startServiceMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/obd/start-service');
      return await res.json();
    },
    onSuccess: () => {
      // Refetch health status after starting service
      setTimeout(() => refetchHealth(), 2000);
    }
  });
  
  // Connect to OBD Mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/obd/connect', { 
        port: selectedPort,
        fast: true
      });
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/obd/health'] });
    }
  });
  
  // Disconnect from OBD Mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/obd/disconnect');
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/obd/health'] });
    }
  });
  
  // Clear DTC Codes Mutation
  const clearDTCMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/obd/dtc/clear');
      return await res.json();
    },
    onSuccess: () => {
      // Refetch DTC codes
      refetchDTC();
    }
  });
  
  // Handle start service button click
  const handleStartService = () => {
    startServiceMutation.mutate();
  };
  
  // Handle connect button click
  const handleConnect = () => {
    if (selectedPort) {
      connectMutation.mutate();
    }
  };
  
  // Handle disconnect button click
  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };
  
  // Handle clear DTC codes button click
  const handleClearDTC = () => {
    clearDTCMutation.mutate();
  };
  
  // Set the first available port as selected when ports are loaded
  useEffect(() => {
    if (portsData?.ports && portsData.ports.length > 0 && !selectedPort) {
      setSelectedPort(portsData.ports[0]);
    }
  }, [portsData, selectedPort]);
  
  // Function to render connection status
  const renderConnectionStatus = () => {
    if (healthLoading) {
      return (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Checking OBD service status...</span>
        </div>
      );
    }
    
    if (healthError || !healthData) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Service Error</AlertTitle>
          <AlertDescription>
            Unable to connect to the OBD service. Please try starting the service.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (!healthData.running) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Service Not Running</AlertTitle>
          <AlertDescription>
            The OBD service is not running. Click "Start OBD Service" to launch it.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (healthData.status?.connected) {
      return (
        <Alert variant="success" className="mb-4 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">Connected</AlertTitle>
          <AlertDescription className="text-green-600">
            Connected to {healthData.status.port} using {healthData.status.protocol} protocol.
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <Alert variant="warning" className="mb-4 bg-yellow-50 border-yellow-200">
        <Activity className="h-4 w-4 text-yellow-500" />
        <AlertTitle className="text-yellow-700">Service Running</AlertTitle>
        <AlertDescription className="text-yellow-600">
          OBD service is running but not connected to any vehicle. Select a port and connect.
        </AlertDescription>
      </Alert>
    );
  };
  
  // Extract important OBD data for display
  const renderKeyMetrics = () => {
    if (!obdData || !healthData?.status?.connected) return null;
    
    const metrics = [
      { name: 'Speed', icon: <Gauge className="h-4 w-4" />, data: obdData.SPEED },
      { name: 'RPM', icon: <Activity className="h-4 w-4" />, data: obdData.RPM },
      { name: 'Coolant Temp', icon: <Thermometer className="h-4 w-4" />, data: obdData.COOLANT_TEMP },
      { name: 'Fuel Level', icon: <Fuel className="h-4 w-4" />, data: obdData.FUEL_LEVEL }
    ];
    
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.name} className="bg-slate-50">
            <CardHeader className="p-3 pb-0">
              <div className="flex items-center space-x-2">
                {metric.icon}
                <CardTitle className="text-sm">{metric.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              {metric.data?.supported ? (
                <div className="text-xl font-bold">
                  {metric.data.value} {metric.data.unit}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Not supported</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render DTC codes if available
  const renderDTCCodes = () => {
    if (!dtcData || !healthData?.status?.connected) return null;
    
    if (dtcData.error) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>DTC Error</AlertTitle>
          <AlertDescription>{dtcData.error}</AlertDescription>
        </Alert>
      );
    }
    
    if (!dtcData.supported) {
      return (
        <Alert className="mb-4">
          <AlertTitle>DTC Codes</AlertTitle>
          <AlertDescription>This vehicle does not support DTC code reading.</AlertDescription>
        </Alert>
      );
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Trouble Codes</CardTitle>
          <CardDescription>
            {dtcData.count === 0 
              ? 'No diagnostic trouble codes found.' 
              : `Found ${dtcData.count} diagnostic trouble codes.`}
          </CardDescription>
        </CardHeader>
        {dtcData.count > 0 && (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dtcData.codes.map((code) => (
                  <TableRow key={code.code}>
                    <TableCell className="font-medium">{code.code}</TableCell>
                    <TableCell>{code.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
        {dtcData.count > 0 && (
          <CardFooter>
            <Button 
              variant="destructive" 
              onClick={handleClearDTC}
              disabled={clearDTCMutation.isPending}
            >
              {clearDTCMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Clear DTC Codes
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  };
  
  // Render all OBD data
  const renderAllData = () => {
    if (!obdData || !healthData?.status?.connected) return null;
    
    // Filter out undefined or null values
    const dataEntries = Object.entries(obdData).filter(([_, value]) => value !== undefined);
    
    if (dataEntries.length === 0) {
      return (
        <Alert className="mb-4">
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>No OBD data available from the vehicle.</AlertDescription>
        </Alert>
      );
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>All OBD Data</CardTitle>
          <CardDescription>
            Real-time data from the vehicle's onboard diagnostics system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sensor</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataEntries.map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell className="font-medium">{value.desc}</TableCell>
                  <TableCell>
                    {value.supported && value.value !== null 
                      ? `${value.value} ${value.unit || ''}` 
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {value.supported ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Supported
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50">
                        Not Supported
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Vehicle Diagnostics</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              refetchHealth();
              refetchPorts();
              if (healthData?.status?.connected) {
                refetchOBDData();
                refetchDTC();
              }
            }}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {renderConnectionStatus()}
      
      <Card>
        <CardHeader>
          <CardTitle>OBD Connection</CardTitle>
          <CardDescription>
            Connect to your vehicle's OBD-II port to access diagnostic data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!healthData?.running ? (
              <Button 
                onClick={handleStartService} 
                disabled={startServiceMutation.isPending}
              >
                {startServiceMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Start OBD Service
              </Button>
            ) : (
              <div className="space-y-4">
                {!healthData.status?.connected ? (
                  <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <select
                      value={selectedPort}
                      onChange={(e) => setSelectedPort(e.target.value)}
                      className="rounded-md border border-input px-3 py-2 text-sm"
                      disabled={portsLoading || !portsData}
                    >
                      {portsLoading && <option>Loading ports...</option>}
                      {!portsLoading && (!portsData || portsData.count === 0) && (
                        <option>No ports available</option>
                      )}
                      {!portsLoading &&
                        portsData &&
                        portsData.ports.map((port) => (
                          <option key={port} value={port}>
                            {port}
                          </option>
                        ))}
                    </select>
                    <Button 
                      onClick={handleConnect} 
                      disabled={
                        connectMutation.isPending || 
                        !selectedPort || 
                        portsLoading || 
                        !portsData || 
                        portsData.count === 0
                      }
                    >
                      {connectMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Connect
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="default" 
                    onClick={handleDisconnect}
                    disabled={disconnectMutation.isPending}
                  >
                    {disconnectMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Disconnect
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {healthData?.status?.connected && (
        <>
          <h3 className="text-xl font-semibold mt-8">Vehicle Data</h3>
          <Separator className="my-4" />
          
          {obdDataLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {renderKeyMetrics()}
              
              <div className="mt-8 space-y-6">
                {renderDTCCodes()}
              </div>
              
              <div className="mt-8 space-y-6">
                {renderAllData()}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}