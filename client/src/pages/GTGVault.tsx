// /client/src/pages/GTGVault.tsx

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Car, 
  Plus, 
  Settings, 
  Wrench, 
  Gauge, 
  Zap, 
  Clock, 
  BarChart3, 
  FileText,
  Image as ImageIcon,
  Sparkles,
  Tag,
  Droplets,
  UploadCloud,
  Search,
  SlidersHorizontal,
  Filter,
  AlertTriangle,
  Download,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { GTGVaultVehicleProvider, useVehicleVault, Vehicle } from "@/contexts/GTGVaultVehicleContext";

// Simplified components for placeholders
const GTGTelemetrySnapshot: React.FC = () => (
  <Card className="bg-zinc-900 border border-zinc-800 text-white">
    <CardHeader>
      <CardTitle className="text-blue-400 text-xl flex items-center gap-2">
        <Zap className="h-5 w-5" /> Telemetry Snapshot
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-400">Real-time telemetry data will be displayed here.</p>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <div className="text-xs text-gray-500">Engine Temp</div>
          <div className="text-lg font-semibold">197°F</div>
          <Progress value={65} className="h-1 mt-1" />
        </div>
        <div>
          <div className="text-xs text-gray-500">Oil Pressure</div>
          <div className="text-lg font-semibold">42 PSI</div>
          <Progress value={75} className="h-1 mt-1" />
        </div>
        <div>
          <div className="text-xs text-gray-500">Battery</div>
          <div className="text-lg font-semibold">13.8V</div>
          <Progress value={90} className="h-1 mt-1" />
        </div>
        <div>
          <div className="text-xs text-gray-500">Fuel Level</div>
          <div className="text-lg font-semibold">68%</div>
          <Progress value={68} className="h-1 mt-1" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const GTGVaultUploadZone: React.FC = () => (
  <div className="space-y-4 p-4 bg-zinc-900 border border-zinc-700 rounded-lg">
    <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
      <UploadCloud className="h-4 w-4" /> Quick Upload
    </h3>
    <div className="p-6 border border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center text-center">
      <UploadCloud className="h-10 w-10 text-zinc-500 mb-2" />
      <p className="text-sm text-zinc-400">Drag files here or click to upload</p>
      <p className="text-xs text-zinc-500 mt-1">Documents, images, videos related to your vehicles</p>
      <Button className="mt-4 bg-green-600 hover:bg-green-500 text-white">Select Files</Button>
    </div>
  </div>
);

// Main GTG Vault Component
const GTGVaultContent: React.FC = () => {
  const { vehicles, loading, error } = useVehicleVault();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // UI state
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddVehicleDialog, setShowAddVehicleDialog] = useState<boolean>(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState<boolean>(false);

  // Dashboard settings
  const [dashboardSettings, setDashboardSettings] = useState({
    showVehicleOverview: true,
    showMaintenanceAlerts: true,
    showTelemetry: true,
    showUpcomingMaintenance: true,
    showRecentActivity: true,
    showGallery: true,
    showModifications: true,
    showTires: true,
  });

  // Filtered vehicles
  const filteredVehicles = searchQuery
    ? vehicles.filter((vehicle) => 
        `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : vehicles;

  // Format helpers
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatMileage = (miles: number): string => {
    return miles.toLocaleString() + ' mi';
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Go to vehicle detail page
  const viewVehicleDetails = (id: string) => {
    setLocation(`/garage/${id}/detail`);
  };

  // Handle initial vehicle mount
  useEffect(() => {
    if (error) {
      toast({
        title: "Error Loading Vehicles",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">
              Garage Vault
            </h1>
            <p className="text-gray-400 mt-1">
              Your complete vehicle command center
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showAddVehicleDialog} onOpenChange={setShowAddVehicleDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-500 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Add Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 text-white border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="text-xl">Add New Vehicle</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-gray-400 mb-4">Add your vehicle details below.</p>
                  {/* Vehicle form would go here */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Make</label>
                        <Input className="bg-zinc-800 border-zinc-700" placeholder="e.g. BMW" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Model</label>
                        <Input className="bg-zinc-800 border-zinc-700" placeholder="e.g. M3" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Year</label>
                        <Input className="bg-zinc-800 border-zinc-700" type="number" placeholder="2023" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Color</label>
                        <Input className="bg-zinc-800 border-zinc-700" placeholder="e.g. Black" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Current Mileage</label>
                      <Input className="bg-zinc-800 border-zinc-700" type="number" placeholder="0" />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" className="border-zinc-700" onClick={() => setShowAddVehicleDialog(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-500">
                        Add Vehicle
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-zinc-700">
                  <Settings className="h-4 w-4 mr-2" /> Vault Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 text-white border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="text-xl">Garage Vault Settings</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-gray-400 mb-4">Customize your garage vault experience.</p>
                  {/* Settings form would go here */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Dashboard Widgets</h3>
                      <div className="space-y-2">
                        {Object.entries(dashboardSettings).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</span>
                            <input 
                              type="checkbox" 
                              checked={value} 
                              onChange={() => {
                                setDashboardSettings({
                                  ...dashboardSettings,
                                  [key]: !value
                                });
                              }} 
                              className="h-4 w-4 rounded border-gray-500 text-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" className="border-zinc-700" onClick={() => setShowSettingsDialog(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-500">
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-zinc-900 border border-zinc-700">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="vehicles" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Vehicles
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Maintenance
              </TabsTrigger>
              <TabsTrigger value="modifications" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Mods
              </TabsTrigger>
              <TabsTrigger value="tires" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Tires
              </TabsTrigger>
              <TabsTrigger value="detailing" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Detailing
              </TabsTrigger>
              <TabsTrigger value="gallery" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Gallery
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-zinc-900 border-zinc-700 w-[200px]"
                />
              </div>
            </div>
          </div>

          {/* Dashboard Tab Content */}
          <TabsContent value="dashboard" className="mt-0">
            {vehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-lg bg-zinc-900">
                <Car className="h-16 w-16 text-zinc-700 mb-4" />
                <h3 className="text-xl font-bold mb-2">No Vehicles Yet</h3>
                <p className="text-zinc-400 text-center max-w-md mb-6">
                  Your garage vault is empty. Add your first vehicle to start tracking maintenance, modifications, and more.
                </p>
                <Button 
                  className="bg-green-600 hover:bg-green-500 text-white"
                  onClick={() => setShowAddVehicleDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Vehicle
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-zinc-400">Total Vehicles</p>
                          <h3 className="text-3xl font-bold mt-1">{vehicles.length}</h3>
                        </div>
                        <div className="bg-blue-500/20 rounded-full p-2">
                          <Car className="h-5 w-5 text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-zinc-400">Total Value</p>
                          <h3 className="text-3xl font-bold mt-1">{formatCurrency(vehicles.reduce((sum, v) => sum + (v.current_value || 0), 0))}</h3>
                        </div>
                        <div className="bg-green-500/20 rounded-full p-2">
                          <BarChart3 className="h-5 w-5 text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-zinc-400">Maintenance Items</p>
                          <h3 className="text-3xl font-bold mt-1">17</h3>
                        </div>
                        <div className="bg-yellow-500/20 rounded-full p-2">
                          <Wrench className="h-5 w-5 text-yellow-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-zinc-400">Modifications</p>
                          <h3 className="text-3xl font-bold mt-1">8</h3>
                        </div>
                        <div className="bg-purple-500/20 rounded-full p-2">
                          <Sparkles className="h-5 w-5 text-purple-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Vehicle Snapshots Row */}
                <h2 className="text-xl font-bold mb-3 text-blue-400">Vehicle Fleet</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles.map((vehicle) => (
                    <Card 
                      key={vehicle.id} 
                      className="bg-zinc-900 border-zinc-800 overflow-hidden hover:border-blue-500 transition-colors cursor-pointer"
                      onClick={() => viewVehicleDetails(vehicle.id)}
                    >
                      <div className="aspect-video relative">
                        <img
                          src={vehicle.image_url || "https://via.placeholder.com/400x225?text=No+Image"}
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-blue-600 hover:bg-blue-500 mb-1">
                            {vehicle.status?.toUpperCase() || "ACTIVE"}
                          </Badge>
                          <h3 className="text-lg font-bold text-white drop-shadow-md">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-gray-400">Mileage</p>
                            <p className="font-semibold">{formatMileage(vehicle.mileage)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Value</p>
                            <p className="font-semibold">{formatCurrency(vehicle.current_value)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Health</p>
                            <div className="flex items-center">
                              <span className="font-semibold text-green-400 mr-1">Good</span>
                              <Progress value={85} className="h-1 flex-1" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add Vehicle Card */}
                  <Card 
                    className="bg-zinc-900 border-zinc-800 border-dashed flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-zinc-800/30 transition-colors"
                    onClick={() => setShowAddVehicleDialog(true)}
                  >
                    <div className="rounded-full bg-zinc-800 p-4 mb-4">
                      <Plus className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Add New Vehicle</h3>
                    <p className="text-zinc-500 text-center">Track another vehicle in your collection</p>
                  </Card>
                </div>

                {/* Two Column Layout: Telemetry and Alerts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column (2/3 width) */}
                  <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-blue-400">Vehicle Health Center</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                          <CardTitle className="text-yellow-400 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" /> Maintenance Alerts
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="bg-zinc-800 rounded-md p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="h-4 w-4 text-yellow-400" />
                              <span className="font-medium">Oil Change Due</span>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">2022 Porsche 911 GT3 • Due in 500 miles</p>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Last service: 2,900 miles</span>
                              <Button size="sm" variant="outline" className="h-6 border-zinc-700">Schedule</Button>
                            </div>
                          </div>
                          
                          <div className="bg-zinc-800 rounded-md p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="h-4 w-4 text-red-400" />
                              <span className="font-medium">Brake Fluid Flush Overdue</span>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">2019 BMW M4 • 30 days overdue</p>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Last service: 11/15/2023</span>
                              <Button size="sm" variant="outline" className="h-6 border-zinc-700">Schedule</Button>
                            </div>
                          </div>
                          
                          <div className="bg-zinc-800 rounded-md p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="h-4 w-4 text-blue-400" />
                              <span className="font-medium">Annual Inspection</span>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">2022 Porsche 911 GT3 • Due in 45 days</p>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Expires: 06/15/2024</span>
                              <Button size="sm" variant="outline" className="h-6 border-zinc-700">Schedule</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <GTGTelemetrySnapshot />
                    </div>

                    {/* Recent Activity Feed */}
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader>
                        <CardTitle className="text-blue-400 flex items-center gap-2">
                          <Clock className="h-5 w-5" /> Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Wrench className="h-4 w-4 text-green-400" />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Oil Change Completed</span>
                                <Badge variant="outline" className="text-xs font-normal border-zinc-700">Maintenance</Badge>
                              </div>
                              <p className="text-sm text-gray-400">2022 Porsche 911 GT3 • 2 days ago</p>
                              <p className="text-sm mt-1">Mobil 1 0W-40 European Car Formula, K&N Oil Filter</p>
                            </div>
                          </div>
                          
                          <Separator className="bg-zinc-800" />
                          
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-purple-400" />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Added New Wheels</span>
                                <Badge variant="outline" className="text-xs font-normal border-zinc-700">Modification</Badge>
                              </div>
                              <p className="text-sm text-gray-400">2019 BMW M4 • 1 week ago</p>
                              <p className="text-sm mt-1">HRE P101 20" Satin Bronze, Michelin PS4S tires</p>
                            </div>
                          </div>
                          
                          <Separator className="bg-zinc-800" />
                          
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Droplets className="h-4 w-4 text-blue-400" />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Ceramic Coating Applied</span>
                                <Badge variant="outline" className="text-xs font-normal border-zinc-700">Detailing</Badge>
                              </div>
                              <p className="text-sm text-gray-400">2022 Porsche 911 GT3 • 2 weeks ago</p>
                              <p className="text-sm mt-1">Gtechniq Crystal Serum Ultra, 5 year protection</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Right Column (1/3 width) */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-blue-400">Quick Access</h2>
                    
                    <GTGVaultUploadZone />
                    
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader>
                        <CardTitle className="text-blue-400 flex items-center gap-2">
                          <ImageIcon className="h-5 w-5" /> Recent Gallery
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          <img 
                            src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop" 
                            alt="Car gallery" 
                            className="rounded-md aspect-video object-cover"
                          />
                          <img 
                            src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop" 
                            alt="Car gallery" 
                            className="rounded-md aspect-video object-cover"
                          />
                          <img 
                            src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=2487&auto=format&fit=crop" 
                            alt="Car gallery" 
                            className="rounded-md aspect-video object-cover"
                          />
                          <img 
                            src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=2574&auto=format&fit=crop" 
                            alt="Car gallery" 
                            className="rounded-md aspect-video object-cover"
                          />
                        </div>
                        <Button variant="outline" className="w-full mt-4 border-zinc-700">
                          View All Photos
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader>
                        <CardTitle className="text-blue-400 flex items-center gap-2">
                          <FileText className="h-5 w-5" /> Important Documents
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="bg-zinc-800 rounded-md p-3 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-400" />
                            <span>Insurance Policy.pdf</span>
                          </div>
                          <Button size="sm" variant="ghost" className="h-8 px-2">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="bg-zinc-800 rounded-md p-3 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-400" />
                            <span>Service Records.xlsx</span>
                          </div>
                          <Button size="sm" variant="ghost" className="h-8 px-2">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="bg-zinc-800 rounded-md p-3 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-yellow-400" />
                            <span>Vehicle Registration.pdf</span>
                          </div>
                          <Button size="sm" variant="ghost" className="h-8 px-2">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button variant="outline" className="w-full mt-2 border-zinc-700">
                          Manage Documents
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Vehicles Tab Content */}
          <TabsContent value="vehicles" className="mt-0">
            <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Vehicle Fleet</h2>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-zinc-700">
                    <Filter className="h-4 w-4 mr-2" /> Filter
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-500 text-white" onClick={() => setShowAddVehicleDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Vehicle
                  </Button>
                </div>
              </div>
              
              {filteredVehicles.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="h-16 w-16 mx-auto text-zinc-700 mb-4" />
                  <h3 className="text-xl font-bold mb-2">No Vehicles Found</h3>
                  <p className="text-zinc-400 max-w-md mx-auto">
                    {searchQuery 
                      ? `No vehicles match your search for "${searchQuery}".` 
                      : "Your garage vault is empty. Add your first vehicle to start."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left py-3 px-4 text-zinc-400 font-medium">Vehicle</th>
                        <th className="text-left py-3 px-4 text-zinc-400 font-medium">Details</th>
                        <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-zinc-400 font-medium">Value</th>
                        <th className="text-left py-3 px-4 text-zinc-400 font-medium">Mileage</th>
                        <th className="text-left py-3 px-4 text-zinc-400 font-medium">Health</th>
                        <th className="text-right py-3 px-4 text-zinc-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVehicles.map((vehicle) => (
                        <tr 
                          key={vehicle.id}
                          className="border-b border-zinc-800 hover:bg-zinc-800/30 cursor-pointer transition-colors"
                          onClick={() => viewVehicleDetails(vehicle.id)}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                <img 
                                  src={vehicle.image_url || "https://via.placeholder.com/48?text=No+Image"} 
                                  alt={`${vehicle.make} ${vehicle.model}`} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                                <div className="text-sm text-zinc-400">{vehicle.trim}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-zinc-300">{vehicle.engine_type}</div>
                            <div className="text-sm text-zinc-400">{vehicle.transmission}</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={
                              vehicle.status === 'active' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-400' :
                              vehicle.status === 'storage' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 hover:text-yellow-400'
                            }>
                              {vehicle.status?.toUpperCase() || "ACTIVE"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium">{formatCurrency(vehicle.current_value)}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium">{formatMileage(vehicle.mileage)}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24">
                                <Progress value={85} className="h-2" />
                              </div>
                              <span className="text-green-400 text-sm">Good</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => {
                              e.stopPropagation();
                              viewVehicleDetails(vehicle.id);
                            }}>
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Stubs for other tabs - these would be implemented later */}
          <TabsContent value="maintenance" className="mt-0">
            <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4">Maintenance Records</h2>
              <p className="text-zinc-400">
                This section will show a comprehensive view of all maintenance records across your vehicles.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="modifications" className="mt-0">
            <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4">Modification Log</h2>
              <p className="text-zinc-400">
                Track all modifications and upgrades to your vehicles here.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="tires" className="mt-0">
            <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4">Tire Management</h2>
              <p className="text-zinc-400">
                Monitor tire sets, rotation schedules, and track heat cycles for track use.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="detailing" className="mt-0">
            <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4">Detailing Records</h2>
              <p className="text-zinc-400">
                Track detailing sessions, products used, and before/after photos.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="gallery" className="mt-0">
            <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4">Vehicle Gallery</h2>
              <p className="text-zinc-400">
                A comprehensive photo collection of all your vehicles.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Wrap the main component with the provider
const GTGVault: React.FC = () => {
  return (
    <GTGVaultVehicleProvider>
      <GTGVaultContent />
    </GTGVaultVehicleProvider>
  );
};

export default GTGVault;