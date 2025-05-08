import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle, GaugeCircle, Thermometer, Droplet, Wind } from 'lucide-react';

type OBDDataDisplayProps = {
  connected: boolean;
}

type SensorData = {
  command: string;
  desc: string;
  supported: boolean;
  value: number | null;
  unit: string | null;
}

type DiagnosticCode = {
  code: string;
  description: string | null;
}

type OBDData = {
  [key: string]: SensorData;
}

export default function OBDDataDisplay({ connected }: OBDDataDisplayProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OBDData | null>(null);
  const [dtcCodes, setDtcCodes] = useState<DiagnosticCode[]>([]);
  const [supportedCommands, setSupportedCommands] = useState<Array<{name: string, desc: string}>>([]);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  // Fetch OBD data
  const fetchOBDData = async () => {
    if (!connected) {
      setLoading(false);
      setError('Not connected to the OBD service');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/obd/data');
      
      if (!response.ok) {
        throw new Error('Failed to fetch OBD data');
      }
      
      const responseData = await response.json();
      
      if (responseData.error) {
        throw new Error(responseData.error);
      }
      
      setData(responseData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching OBD data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setLoading(false);
    }
  };

  // Fetch diagnostic trouble codes
  const fetchDTCs = async () => {
    if (!connected) return;

    try {
      const response = await fetch('/api/obd/dtc');
      
      if (!response.ok) {
        throw new Error('Failed to fetch diagnostic codes');
      }
      
      const responseData = await response.json();
      
      if (responseData.error) {
        throw new Error(responseData.error);
      }
      
      if (responseData.supported && responseData.codes) {
        setDtcCodes(responseData.codes);
      } else {
        setDtcCodes([]);
      }
    } catch (error) {
      console.error('Error fetching DTCs:', error);
    }
  };

  // Fetch supported commands
  const fetchSupportedCommands = async () => {
    if (!connected) return;

    try {
      const response = await fetch('/api/obd/supported');
      
      if (!response.ok) {
        throw new Error('Failed to fetch supported commands');
      }
      
      const responseData = await response.json();
      
      if (responseData.error) {
        throw new Error(responseData.error);
      }
      
      if (responseData.commands) {
        setSupportedCommands(responseData.commands.map((cmd: any) => ({
          name: cmd.name,
          desc: cmd.desc
        })));
      }
    } catch (error) {
      console.error('Error fetching supported commands:', error);
    }
  };

  // Start auto-refresh when connected
  useEffect(() => {
    if (connected) {
      // Initial fetch
      fetchOBDData();
      fetchDTCs();
      fetchSupportedCommands();
      
      // Set up refresh interval
      const interval = window.setInterval(() => {
        fetchOBDData();
      }, 2000); // Refresh every 2 seconds
      
      setRefreshInterval(interval);
      
      // Clean up on unmount
      return () => {
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
      };
    } else {
      // Clean up interval if disconnected
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
      
      setLoading(false);
      setError('Not connected to the OBD service');
    }
  }, [connected]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  const renderSensorValue = (sensor: SensorData | undefined) => {
    if (!sensor) return 'N/A';
    
    if (!sensor.supported) return 'Not supported';
    
    if (sensor.value === null) return 'No data';
    
    return `${sensor.value}${sensor.unit ? ' ' + sensor.unit : ''}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GaugeCircle className="h-5 w-5" />
          Vehicle Data
        </CardTitle>
        <CardDescription>
          Real-time vehicle data from your OBD-II connection
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!connected ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connect to your vehicle using the OBD-II adapter to view real-time data
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading vehicle data...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="dashboard">
            <TabsList className="mb-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="engine">Engine</TabsTrigger>
              <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
              <TabsTrigger value="supported">Supported</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card rounded-lg border p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <GaugeCircle className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium">Speed & RPM</h3>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Speed:</span>
                      <span className="text-sm font-medium">{renderSensorValue(data?.SPEED)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">RPM:</span>
                      <span className="text-sm font-medium">{renderSensorValue(data?.RPM)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Engine Load:</span>
                      <span className="text-sm font-medium">{renderSensorValue(data?.ENGINE_LOAD)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Throttle Position:</span>
                      <span className="text-sm font-medium">{renderSensorValue(data?.THROTTLE_POS)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium">Temperature</h3>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Coolant Temp:</span>
                      <span className="text-sm font-medium">{renderSensorValue(data?.COOLANT_TEMP)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Intake Temp:</span>
                      <span className="text-sm font-medium">{renderSensorValue(data?.INTAKE_TEMP)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Oil Temp:</span>
                      <span className="text-sm font-medium">{renderSensorValue(data?.OIL_TEMP)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Ambient Air Temp:</span>
                      <span className="text-sm font-medium">{renderSensorValue(data?.AMBIANT_AIR_TEMP)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium">Fuel</h3>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Fuel Level:</span>
                      <span className="text-sm font-medium">{renderSensorValue(data?.FUEL_LEVEL)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Fuel Pressure:</span>
                      <span className="text-sm font-medium">{renderSensorValue(data?.FUEL_PRESSURE)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Fuel Rate:</span>
                      <span className="text-sm font-medium">{renderSensorValue(data?.FUEL_RATE)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium">Air & Pressure</h3>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Barometric Pressure:</span>
                      <span className="text-sm font-medium">{renderSensorValue(data?.BAROMETRIC_PRESSURE)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Run Time:</span>
                      <span className="text-sm font-medium">{renderSensorValue(data?.RUN_TIME)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Distance Since DTC Clear:</span>
                      <span className="text-sm font-medium">{renderSensorValue(data?.DISTANCE_SINCE_DTC_CLEAR)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="engine">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Engine Data</h3>
                <div className="grid gap-2">
                  {data && Object.entries(data).map(([key, sensor]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b">
                      <div>
                        <span className="text-sm font-medium">{sensor.desc}</span>
                        <Badge 
                          variant={sensor.supported ? "default" : "secondary"} 
                          className="ml-2"
                        >
                          {sensor.supported ? 'Supported' : 'Unsupported'}
                        </Badge>
                      </div>
                      <span className="text-sm">{renderSensorValue(sensor)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="diagnostics">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Diagnostic Trouble Codes</h3>
                
                {dtcCodes.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No diagnostic trouble codes found. Your vehicle is running smoothly!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid gap-2">
                    {dtcCodes.map((code, index) => (
                      <div key={index} className="bg-card rounded-lg border p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                          <Badge variant="destructive">{code.code}</Badge>
                          <span className="text-sm">{code.description || 'Unknown error'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-end mt-4">
                  <button 
                    className="text-sm text-primary hover:underline"
                    onClick={fetchDTCs}
                  >
                    Refresh Codes
                  </button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="supported">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Supported Commands</h3>
                
                {supportedCommands.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No commands supported or still detecting supported commands...
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {supportedCommands.map((command, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm font-medium">{command.name}</span>
                        <span className="text-xs text-muted-foreground">{command.desc}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-end mt-4">
                  <button 
                    className="text-sm text-primary hover:underline"
                    onClick={fetchSupportedCommands}
                  >
                    Refresh Commands
                  </button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}