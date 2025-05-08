import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronLeft, Car, Scan, Database, Cable, RotateCw, Check, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';
import OBDConnect from '@/components/vehicle/OBDConnect';
import SmartcarConnect from '@/components/vehicle/SmartcarConnect';
import { queryClient } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define vehicle schema
const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900, "Invalid year").max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  vin: z.string().optional(),
  trim: z.string().optional(),
  color: z.string().optional(),
  nickname: z.string().optional(),
  license_plate: z.string().optional(),
  purchase_date: z.date().optional(),
  notes: z.string().optional()
});

// VIN decoder schema
const vinSchema = z.object({
  vin: z.string().length(17, "VIN must be exactly 17 characters")
});

export default function AddVehiclePage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('manual');
  const [vinInfo, setVinInfo] = useState<any>(null);
  const [loadingVinInfo, setLoadingVinInfo] = useState(false);
  const [obdConnected, setObdConnected] = useState(false);
  const [obdVehicleData, setObdVehicleData] = useState<any>(null);
  const [smartcarConnected, setSmartcarConnected] = useState(false);
  
  // Form for manual entry
  const manualForm = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      make: '',
      model: '',
      year: undefined,
      vin: '',
      trim: '',
      color: '',
      nickname: '',
      license_plate: '',
      notes: ''
    }
  });
  
  // Form for VIN decoder
  const vinForm = useForm<z.infer<typeof vinSchema>>({
    resolver: zodResolver(vinSchema),
    defaultValues: {
      vin: ''
    }
  });
  
  // Create vehicle from manual form
  const onManualSubmit = async (data: z.infer<typeof vehicleSchema>) => {
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add vehicle');
      }
      
      const result = await response.json();
      
      toast({
        title: 'Vehicle Added',
        description: `${data.make} ${data.model} has been added to your garage`,
      });
      
      // Invalidate any vehicle queries
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      
      // Redirect to garage
      setLocation('/garage');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add vehicle',
        variant: 'destructive'
      });
    }
  };
  
  // Decode VIN
  const onVinSubmit = async (data: z.infer<typeof vinSchema>) => {
    try {
      setLoadingVinInfo(true);
      setVinInfo(null);
      
      const response = await fetch(`/api/vehicles/decode/${data.vin}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to decode VIN');
      }
      
      const result = await response.json();
      
      if (!result.make || !result.model || !result.year) {
        throw new Error('Could not extract required vehicle information from the VIN');
      }
      
      setVinInfo(result);
      
      // Update manual form with VIN data
      manualForm.setValue('make', result.make);
      manualForm.setValue('model', result.model);
      manualForm.setValue('year', result.year);
      manualForm.setValue('vin', data.vin);
      if (result.trim) manualForm.setValue('trim', result.trim);
      
      // Switch to manual tab to edit and submit
      setActiveTab('manual');
      
      toast({
        title: 'VIN Decoded',
        description: `Found ${result.year} ${result.make} ${result.model}`,
      });
    } catch (error) {
      console.error('Error decoding VIN:', error);
      toast({
        title: 'Decoding Error',
        description: error instanceof Error ? error.message : 'Failed to decode VIN',
        variant: 'destructive'
      });
    } finally {
      setLoadingVinInfo(false);
    }
  };
  
  // Handle OBD connection
  const handleObdConnect = () => {
    setObdConnected(true);
    
    // Fetch OBD data when connected
    fetchObdData();
  };
  
  // Handle OBD disconnection
  const handleObdDisconnect = () => {
    setObdConnected(false);
    setObdVehicleData(null);
  };
  
  // Fetch data from OBD
  const fetchObdData = async () => {
    try {
      // Attempt to get VIN from OBD
      const vinResponse = await fetch('/api/obd/command/VIN');
      
      if (vinResponse.ok) {
        const vinData = await vinResponse.json();
        
        if (vinData.supported && vinData.value) {
          // We got a VIN, now decode it
          const decodeResponse = await fetch(`/api/vehicles/decode/${vinData.value}`);
          
          if (decodeResponse.ok) {
            const decodeData = await decodeResponse.json();
            
            setObdVehicleData({
              make: decodeData.make,
              model: decodeData.model,
              year: decodeData.year,
              vin: vinData.value,
              trim: decodeData.trim || null
            });
            
            toast({
              title: 'Vehicle Detected',
              description: `Found ${decodeData.year} ${decodeData.make} ${decodeData.model}`,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching OBD data:', error);
    }
  };
  
  // Import OBD vehicle
  const importObdVehicle = () => {
    if (!obdVehicleData) return;
    
    // Set values in the manual form
    manualForm.setValue('make', obdVehicleData.make);
    manualForm.setValue('model', obdVehicleData.model);
    manualForm.setValue('year', obdVehicleData.year);
    manualForm.setValue('vin', obdVehicleData.vin);
    if (obdVehicleData.trim) manualForm.setValue('trim', obdVehicleData.trim);
    
    // Switch to manual tab to edit and submit
    setActiveTab('manual');
    
    toast({
      title: 'Vehicle Imported',
      description: `${obdVehicleData.year} ${obdVehicleData.make} ${obdVehicleData.model} imported from OBD`,
    });
  };
  
  // Handle Smartcar connection
  const handleSmartcarConnect = (vehicleData: any) => {
    if (vehicleData) {
      // Set form values with vehicle data
      manualForm.setValue('make', vehicleData.make || '');
      manualForm.setValue('model', vehicleData.model || '');
      manualForm.setValue('year', vehicleData.year || new Date().getFullYear());
      if (vehicleData.vin) manualForm.setValue('vin', vehicleData.vin);
      
      // Switch to manual tab to review and submit
      setActiveTab('manual');
      
      toast({
        title: 'Vehicle Imported',
        description: `${vehicleData.year} ${vehicleData.make} ${vehicleData.model} imported from Smartcar`,
      });
    }
    
    setSmartcarConnected(true);
  };
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/garage" className="flex items-center text-sm text-primary hover:underline">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Garage
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Add a Vehicle</h1>
          <p className="text-muted-foreground mt-1">
            Choose from multiple methods to add your vehicle to Paddock 20
          </p>
        </div>
      </div>

      <Card className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <TabsList className="grid grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                <span>Manual Entry</span>
              </TabsTrigger>
              <TabsTrigger value="vin" className="flex items-center gap-2">
                <Scan className="h-4 w-4" />
                <span>VIN Decoder</span>
              </TabsTrigger>
              <TabsTrigger value="smartcar" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Smartcar</span>
              </TabsTrigger>
              <TabsTrigger value="obd" className="flex items-center gap-2">
                <Cable className="h-4 w-4" />
                <span>OBD-II</span>
              </TabsTrigger>
            </TabsList>
            <CardDescription>
              Choose your preferred method to add a vehicle to your Paddock 20 account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <TabsContent value="manual">
              <Card>
                <CardHeader>
                  <CardTitle>Manual Vehicle Entry</CardTitle>
                  <CardDescription>
                    Enter your vehicle details manually
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...manualForm}>
                    <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField
                          control={manualForm.control}
                          name="make"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Make*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Toyota" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={manualForm.control}
                          name="model"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Supra" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={manualForm.control}
                          name="year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year*</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder={new Date().getFullYear().toString()}
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={manualForm.control}
                          name="vin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>VIN</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. JT2JA82J6R0012345" {...field} />
                              </FormControl>
                              <FormDescription>
                                Vehicle Identification Number (17 characters)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={manualForm.control}
                          name="trim"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Trim</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. GR" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={manualForm.control}
                          name="color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Color</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Red" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={manualForm.control}
                          name="nickname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nickname</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. My Ride" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={manualForm.control}
                          name="license_plate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>License Plate</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. ABC123" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={manualForm.control}
                          name="purchase_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Purchase Date</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field}
                                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={manualForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                placeholder="Any additional information about your vehicle"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button type="submit" disabled={manualForm.formState.isSubmitting}>
                          {manualForm.formState.isSubmitting ? (
                            <>
                              <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Add Vehicle
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="vin">
              <Card>
                <CardHeader>
                  <CardTitle>VIN Decoder</CardTitle>
                  <CardDescription>
                    Enter your Vehicle Identification Number to automatically fetch vehicle details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...vinForm}>
                    <form onSubmit={vinForm.handleSubmit(onVinSubmit)} className="space-y-6">
                      <FormField
                        control={vinForm.control}
                        name="vin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VIN (Vehicle Identification Number)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. JT2JA82J6R0012345" 
                                {...field} 
                                className="uppercase"
                              />
                            </FormControl>
                            <FormDescription>
                              The VIN is a 17-character code that can usually be found on the driver's side dashboard, 
                              door jamb, or your vehicle registration documents.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button type="submit" disabled={loadingVinInfo}>
                          {loadingVinInfo ? (
                            <>
                              <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                              Decoding...
                            </>
                          ) : (
                            <>
                              <Scan className="h-4 w-4 mr-2" />
                              Decode VIN
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {vinInfo && (
                        <div className="mt-6 p-4 border rounded-md bg-secondary/20">
                          <h3 className="text-lg font-medium mb-2">Decoded Vehicle Information</h3>
                          <dl className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <dt className="text-muted-foreground">Make:</dt>
                              <dd className="font-medium">{vinInfo.make}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Model:</dt>
                              <dd className="font-medium">{vinInfo.model}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Year:</dt>
                              <dd className="font-medium">{vinInfo.year}</dd>
                            </div>
                            {vinInfo.trim && (
                              <div>
                                <dt className="text-muted-foreground">Trim:</dt>
                                <dd className="font-medium">{vinInfo.trim}</dd>
                              </div>
                            )}
                            <div className="col-span-2">
                              <dt className="text-muted-foreground">VIN:</dt>
                              <dd className="font-medium">{vinForm.getValues().vin}</dd>
                            </div>
                          </dl>
                          <div className="mt-4">
                            <Button 
                              variant="default" 
                              onClick={() => setActiveTab('manual')}
                              className="w-full"
                            >
                              Continue to Vehicle Details
                            </Button>
                          </div>
                        </div>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="smartcar">
              <Card>
                <CardHeader>
                  <CardTitle>Smartcar Integration</CardTitle>
                  <CardDescription>
                    Connect to your vehicle using Smartcar to automatically import vehicle details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p className="text-sm">
                      Smartcar allows you to securely connect to your vehicle's data without any hardware. 
                      It works with many modern vehicles from major manufacturers.
                    </p>
                    
                    <div className="rounded-md bg-muted p-4">
                      <h3 className="text-sm font-medium mb-2">Compatible Manufacturers</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Badge variant="outline">Tesla</Badge>
                        <Badge variant="outline">Ford</Badge>
                        <Badge variant="outline">Toyota</Badge>
                        <Badge variant="outline">Honda</Badge>
                        <Badge variant="outline">BMW</Badge>
                        <Badge variant="outline">Mercedes</Badge>
                        <Badge variant="outline">Audi</Badge>
                        <Badge variant="outline">And more</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">With Smartcar, you can:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Import vehicle details automatically</li>
                        <li>Retrieve real-time odometer readings</li>
                        <li>Access fuel or battery level information</li>
                        <li>View vehicle location (with permission)</li>
                      </ul>
                    </div>
                    
                    <SmartcarConnect onConnect={handleSmartcarConnect} />
                    
                    {smartcarConnected && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Connection Successful</AlertTitle>
                        <AlertDescription>
                          Your vehicle has been connected with Smartcar and will appear in your garage shortly.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="obd">
              <Card>
                <CardHeader>
                  <CardTitle>OBD-II Connection</CardTitle>
                  <CardDescription>
                    Connect to your vehicle using an OBD-II adapter to import details and access diagnostic data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p className="text-sm">
                      OBD-II (On-Board Diagnostics) is a standardized system that allows external devices to interface 
                      with your vehicle's computer system. By connecting an OBD-II adapter to your computer, you can 
                      access real-time vehicle data and diagnostic information.
                    </p>
                    
                    <OBDConnect 
                      onConnect={handleObdConnect} 
                      onDisconnect={handleObdDisconnect} 
                    />
                    
                    {obdConnected && obdVehicleData && (
                      <div className="mt-6 p-4 border rounded-md bg-secondary/20">
                        <h3 className="text-lg font-medium mb-2">Detected Vehicle Information</h3>
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <dt className="text-muted-foreground">Make:</dt>
                            <dd className="font-medium">{obdVehicleData.make}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Model:</dt>
                            <dd className="font-medium">{obdVehicleData.model}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Year:</dt>
                            <dd className="font-medium">{obdVehicleData.year}</dd>
                          </div>
                          {obdVehicleData.trim && (
                            <div>
                              <dt className="text-muted-foreground">Trim:</dt>
                              <dd className="font-medium">{obdVehicleData.trim}</dd>
                            </div>
                          )}
                          <div className="col-span-2">
                            <dt className="text-muted-foreground">VIN:</dt>
                            <dd className="font-medium">{obdVehicleData.vin}</dd>
                          </div>
                        </dl>
                        <div className="mt-4">
                          <Button 
                            variant="default" 
                            onClick={importObdVehicle}
                            className="w-full"
                          >
                            Import This Vehicle
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {obdConnected && !obdVehicleData && (
                      <div className="space-y-4">
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>OBD Connected</AlertTitle>
                          <AlertDescription>
                            Connected to OBD adapter. Attempting to read vehicle information...
                          </AlertDescription>
                        </Alert>
                        
                        <div className="flex flex-col items-center justify-center py-3">
                          <RotateCw className="h-8 w-8 animate-spin text-primary mb-3" />
                          <p className="text-xs text-muted-foreground text-center">
                            If no data appears, your vehicle may not support VIN retrieval through OBD.
                            You can still use the manual entry method.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-xs text-muted-foreground">
              * Required fields. Your vehicle information is stored securely and is only visible to you.
            </p>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
}