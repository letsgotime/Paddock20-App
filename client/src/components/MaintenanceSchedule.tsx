import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wrench, 
  AlertTriangle, 
  Calendar, 
  Car, 
  Droplet, 
  Gauge, 
  RotateCw, 
  ArrowRight,
  CheckCircle2,
  Timer,
  Tractor,
  Battery,
  RefreshCw
} from 'lucide-react';
import { useVehicle } from '@/contexts/VehicleContext';

/**
 * MaintenanceSchedule Component
 * 
 * Displays vehicle maintenance schedule with upcoming services,
 * history, and integration with live OBD data when available.
 * 
 * Integrates with Smartcar API when connected.
 */
export default function MaintenanceSchedule() {
  const vehicle = useVehicle();
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Determine if vehicle is connected via Smartcar
  const isSmartcarConnected = vehicle?.smartcar?.connected || false;
  
  // Calculate days until next service
  const getDaysUntil = (date: string) => {
    if (!date) return "Unknown";
    
    const serviceDate = new Date(date);
    const now = new Date();
    const diffTime = serviceDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days`;
  };
  
  // Get severity level badges
  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
            Critical
          </Badge>
        );
      case 'high':
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
            High
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
            Medium
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
            Low
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
            Normal
          </Badge>
        );
    }
  };
  
  // Get maintenance icon based on type
  const getMaintenanceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'oil':
        return <Droplet size={16} className="text-blue-400" />;
      case 'tire':
        return <Tractor size={16} className="text-blue-400" />;
      case 'battery':
        return <Battery size={16} className="text-blue-400" />;
      case 'inspection':
        return <Car size={16} className="text-blue-400" />;
      default:
        return <Wrench size={16} className="text-blue-400" />;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-blue-400 font-orbitron text-sm">MAINTENANCE SCHEDULE</h3>
        <Badge 
          variant="outline" 
          className={`${isSmartcarConnected ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-orange-500/10 text-orange-400 border-orange-500/30'} flex items-center gap-1`}
        >
          {isSmartcarConnected ? (
            <>
              <RefreshCw size={12} className="animate-spin" />
              <span>SMARTCAR CONNECTED</span>
            </>
          ) : (
            <>
              <AlertTriangle size={12} />
              <span>SMARTCAR DISCONNECTED</span>
            </>
          )}
        </Badge>
      </div>
      
      <Tabs defaultValue="upcoming" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 bg-black/50 mb-4">
          <TabsTrigger value="upcoming" className="text-xs">UPCOMING</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">HISTORY</TabsTrigger>
          <TabsTrigger value="status" className="text-xs">LIVE STATUS</TabsTrigger>
        </TabsList>
        
        {/* UPCOMING MAINTENANCE TAB */}
        <TabsContent value="upcoming" className="m-0 space-y-3">
          {vehicle?.activeVehicle?.maintenanceSchedule?.upcoming && 
           vehicle.activeVehicle.maintenanceSchedule.upcoming.length > 0 ? (
            <>
              {vehicle.activeVehicle.maintenanceSchedule.upcoming.map((item: any, index: number) => (
                <Card 
                  key={item.id || index} 
                  className={`bg-gradient-to-r ${item.severity === 'critical' ? 'from-red-950/50 to-black border-red-800/30' : 'from-gray-900 to-black border-gray-800'}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getMaintenanceIcon(item.type)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-gray-400 text-xs mt-1">{item.description}</p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center text-gray-300 text-xs">
                              <Calendar size={12} className="text-blue-400 mr-1" />
                              <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-300 text-xs">
                              <Gauge size={12} className="text-blue-400 mr-1" />
                              <span>{item.dueDistance} {vehicle?.preferences?.units === 'metric' ? 'km' : 'mi'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        {getSeverityBadge(item.severity)}
                        
                        <div className="text-right">
                          <p className="text-xs text-white font-medium">
                            {getDaysUntil(item.dueDate)}
                          </p>
                          <p className="text-xs text-gray-400">until due</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full justify-center text-blue-400 border-blue-500/20 hover:bg-blue-800/10"
              >
                Schedule Service <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <Card className="bg-black/30 border-gray-800">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
                <p className="text-white">No upcoming maintenance scheduled</p>
                <p className="text-gray-400 text-sm mt-1">
                  Your vehicle is up to date with all maintenance requirements
                </p>
                
                <Button 
                  variant="outline" 
                  className="mt-4 text-blue-400 border-blue-500/20 hover:bg-blue-800/10"
                >
                  View Recommended Maintenance
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* MAINTENANCE HISTORY TAB */}
        <TabsContent value="history" className="m-0 space-y-3">
          {vehicle?.activeVehicle?.maintenanceSchedule?.history && 
           vehicle.activeVehicle.maintenanceSchedule.history.length > 0 ? (
            <>
              {vehicle.activeVehicle.maintenanceSchedule.history.map((item: any, index: number) => (
                <Card 
                  key={item.id || index} 
                  className="bg-gradient-to-r from-gray-900 to-black border-gray-800"
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getMaintenanceIcon(item.type)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            Completed on {new Date(item.completedDate).toLocaleDateString()} • 
                            {item.mileage && ` ${item.mileage} ${vehicle?.preferences?.units === 'metric' ? 'km' : 'mi'} •`}
                            {item.location && ` ${item.location}`}
                          </p>
                          {item.notes && (
                            <p className="text-gray-500 text-xs mt-2 italic">"{item.notes}"</p>
                          )}
                        </div>
                      </div>
                      
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                        Completed
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full justify-center text-gray-400 border-gray-700 hover:bg-gray-800/20"
              >
                View Full History <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <Card className="bg-black/30 border-gray-800">
              <CardContent className="p-4 text-center">
                <Timer className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                <p className="text-white">No maintenance history available</p>
                <p className="text-gray-400 text-sm mt-1">
                  Add your maintenance records to keep track of your vehicle's service history
                </p>
                
                <Button 
                  variant="outline" 
                  className="mt-4 text-blue-400 border-blue-500/20 hover:bg-blue-800/10"
                >
                  Add Service Record
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* LIVE STATUS TAB */}
        <TabsContent value="status" className="m-0">
          {isSmartcarConnected ? (
            <div className="space-y-3">
              <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-400 text-sm font-orbitron">LIVE DIAGNOSTICS</CardTitle>
                    <Button variant="ghost" size="sm" className="h-7 text-gray-400">
                      <RotateCw className="h-3.5 w-3.5 mr-1" /> Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 p-3">
                  <div className="bg-black/30 p-3 rounded-md">
                    <div className="flex items-center space-x-2 mb-1">
                      <Droplet size={14} className="text-blue-400" />
                      <p className="text-gray-300 text-sm">Oil Life</p>
                    </div>
                    <p className="text-white text-lg font-mono">
                      {vehicle?.smartcar?.diagnostics?.oilLife || '85%'}
                    </p>
                    <div className="w-full bg-gray-800 h-2 mt-1 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${vehicle?.smartcar?.diagnostics?.oilLife || '85'}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-3 rounded-md">
                    <div className="flex items-center space-x-2 mb-1">
                      <Battery size={14} className="text-blue-400" />
                      <p className="text-gray-300 text-sm">Battery</p>
                    </div>
                    <p className="text-white text-lg font-mono">
                      {vehicle?.smartcar?.diagnostics?.batteryHealth || '95%'}
                    </p>
                    <div className="w-full bg-gray-800 h-2 mt-1 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${vehicle?.smartcar?.diagnostics?.batteryHealth || '95'}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-3 rounded-md">
                    <div className="flex items-center space-x-2 mb-1">
                      <Tractor size={14} className="text-blue-400" />
                      <p className="text-gray-300 text-sm">Tire Pressure</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">FL</p>
                        <p className="text-white">
                          {vehicle?.smartcar?.diagnostics?.tirePressure?.frontLeft || '33'} psi
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">FR</p>
                        <p className="text-white">
                          {vehicle?.smartcar?.diagnostics?.tirePressure?.frontRight || '33'} psi
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">RL</p>
                        <p className="text-white">
                          {vehicle?.smartcar?.diagnostics?.tirePressure?.rearLeft || '35'} psi
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">RR</p>
                        <p className="text-white">
                          {vehicle?.smartcar?.diagnostics?.tirePressure?.rearRight || '35'} psi
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-3 rounded-md">
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertTriangle size={14} className="text-blue-400" />
                      <p className="text-gray-300 text-sm">Issues</p>
                    </div>
                    {vehicle?.smartcar?.diagnostics?.issues && 
                     vehicle.smartcar.diagnostics.issues.length > 0 ? (
                      <div className="mt-1">
                        {vehicle.smartcar.diagnostics.issues.map((issue: any, i: number) => (
                          <div key={i} className="flex items-center">
                            <AlertTriangle size={12} className={`mr-1 ${issue.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'}`} />
                            <p className="text-white text-xs">{issue.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center mt-1">
                        <CheckCircle2 size={14} className="text-green-400 mr-1" />
                        <p className="text-white text-sm">No issues detected</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Button 
                variant="outline" 
                className="w-full justify-center text-blue-400 border-blue-500/20 hover:bg-blue-800/10"
              >
                Run Full Diagnostics <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Card className="bg-black/30 border-gray-800">
              <CardContent className="p-4 text-center">
                <RefreshCw className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                <p className="text-white">Connect your vehicle for live diagnostics</p>
                <p className="text-gray-400 text-sm mt-1">
                  Link your vehicle with Smartcar to access real-time vehicle health and diagnostics
                </p>
                
                <Button 
                  variant="default" 
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Connect with Smartcar
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}