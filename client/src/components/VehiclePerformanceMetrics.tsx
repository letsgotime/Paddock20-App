import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Gauge, 
  Timer, 
  ActivitySquare, 
  Fuel, 
  TrendingUp, 
  Thermometer,
  BarChart3
} from 'lucide-react';
import { useVehicle } from '@/contexts/VehicleContext';

/**
 * VehiclePerformanceMetrics Component
 * 
 * Displays real-time and historical performance metrics for the active vehicle
 * Designed with F1-inspired styling and data visualization
 */
export default function VehiclePerformanceMetrics() {
  const vehicle = useVehicle();
  const [timeframe, setTimeframe] = useState('current');
  
  // Extract current performance data from vehicle context
  const performanceData = vehicle?.activeVehicle?.performanceData || {};
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-blue-400 font-orbitron text-sm">PERFORMANCE METRICS</h3>
        <Badge variant="outline" className="text-green-400 border-green-500/30">
          {vehicle?.obd?.connected ? 'LIVE OBD DATA' : 'STORED DATA'}
        </Badge>
      </div>
      
      <Tabs defaultValue="current" onValueChange={setTimeframe} className="w-full">
        <TabsList className="grid grid-cols-3 bg-black/50 mb-4 h-8">
          <TabsTrigger value="current" className="text-xs h-8">CURRENT</TabsTrigger>
          <TabsTrigger value="trip" className="text-xs h-8">TRIP</TabsTrigger>
          <TabsTrigger value="historical" className="text-xs h-8">HISTORICAL</TabsTrigger>
        </TabsList>
        
        {/* Current Performance Tab */}
        <TabsContent value="current" className="m-0 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-black/30 border-gray-800">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Gauge className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-400 text-xs">SPEED</span>
                  </div>
                  <span className="text-white text-lg font-mono">
                    {performanceData.currentSpeed !== undefined ? performanceData.currentSpeed : '--'}
                    <span className="text-xs text-gray-400 ml-1">
                      {vehicle?.preferences?.units === 'metric' ? 'km/h' : 'mph'}
                    </span>
                  </span>
                </div>
                
                <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ 
                      width: `${Math.min(100, ((performanceData.currentSpeed || 0) / (performanceData.maxSpeed || 160)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/30 border-gray-800">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <ActivitySquare className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-400 text-xs">RPM</span>
                  </div>
                  <span className="text-white text-lg font-mono">
                    {performanceData.rpm !== undefined ? performanceData.rpm.toLocaleString() : '--'}
                  </span>
                </div>
                
                <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ 
                      width: `${Math.min(100, ((performanceData.rpm || 0) / (performanceData.redline || 6500)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/30 border-gray-800">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Fuel className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-400 text-xs">FUEL ECONOMY</span>
                  </div>
                  <span className="text-white text-lg font-mono">
                    {performanceData.fuelEconomy !== undefined ? performanceData.fuelEconomy : '--'}
                    <span className="text-xs text-gray-400 ml-1">
                      {vehicle?.preferences?.units === 'metric' ? 'l/100km' : 'mpg'}
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/30 border-gray-800">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-400 text-xs">ENGINE TEMP</span>
                  </div>
                  <span className="text-white text-lg font-mono">
                    {performanceData.engineTemp !== undefined ? performanceData.engineTemp : '--'}
                    <span className="text-xs text-gray-400 ml-1">
                      {vehicle?.preferences?.units === 'metric' ? '°C' : '°F'}
                    </span>
                  </span>
                </div>
                <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${performanceData.engineTemp > 220 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ 
                      width: `${Math.min(100, ((performanceData.engineTemp || 0) / 260) * 100)}%` 
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-gray-300 text-sm">ACCELERATION PROFILE</span>
              </div>
              
              <div className="h-32 w-full bg-black/30 rounded-md flex items-end justify-between p-2">
                {/* This would ideally be a real chart from a charting library */}
                {/* For now we'll create a simple bar chart visualization */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div 
                    key={i} 
                    className="w-[8%] bg-blue-500 rounded-t-sm" 
                    style={{ 
                      height: `${15 + Math.sin(i * 0.6) * 50 + Math.random() * 20}%`,
                      opacity: 0.7 + Math.random() * 0.3
                    }}
                  ></div>
                ))}
              </div>
              
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0 sec</span>
                <span>Time</span>
                <span>10 sec</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Trip Performance Tab */}
        <TabsContent value="trip" className="m-0 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-black/30 border-gray-800">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Timer className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-400 text-xs">TRIP TIME</span>
                </div>
                <span className="text-white text-lg font-mono">
                  {performanceData.tripTime || '00:45:12'}
                </span>
              </CardContent>
            </Card>
            
            <Card className="bg-black/30 border-gray-800">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Gauge className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-400 text-xs">AVG SPEED</span>
                </div>
                <span className="text-white text-lg font-mono">
                  {performanceData.avgSpeed || '42'}
                  <span className="text-xs text-gray-400 ml-1">
                    {vehicle?.preferences?.units === 'metric' ? 'km/h' : 'mph'}
                  </span>
                </span>
              </CardContent>
            </Card>
            
            <Card className="bg-black/30 border-gray-800">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Gauge className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-400 text-xs">MAX SPEED</span>
                </div>
                <span className="text-white text-lg font-mono">
                  {performanceData.maxSpeed || '78'}
                  <span className="text-xs text-gray-400 ml-1">
                    {vehicle?.preferences?.units === 'metric' ? 'km/h' : 'mph'}
                  </span>
                </span>
              </CardContent>
            </Card>
            
            <Card className="bg-black/30 border-gray-800">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Fuel className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-400 text-xs">FUEL USED</span>
                </div>
                <span className="text-white text-lg font-mono">
                  {performanceData.fuelUsed || '3.2'}
                  <span className="text-xs text-gray-400 ml-1">
                    {vehicle?.preferences?.units === 'metric' ? 'L' : 'gal'}
                  </span>
                </span>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span className="text-gray-300 text-sm">TRIP STATISTICS</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Driver Score</span>
                    <span className="text-white font-mono">92 / 100</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 mt-1 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Smooth Driving</span>
                    <span className="text-white font-mono">87 / 100</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 mt-1 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '87%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Efficiency</span>
                    <span className="text-white font-mono">95 / 100</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 mt-1 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '95%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Historical Performance Tab */}
        <TabsContent value="historical" className="m-0">
          <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
            <CardContent className="p-4">
              <p className="text-center text-gray-400 mb-2">
                Performance trends over time
              </p>
              
              <div className="h-64 w-full bg-black/30 rounded-md mb-3 p-3 flex items-end">
                {/* Placeholder for historical performance chart */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-blue-400 text-sm mb-2">PERFORMANCE HISTORY</p>
                    <p className="text-gray-500 text-xs">
                      Full performance history and trends available with connected vehicle data
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-gray-400 text-xs">MAX RECORDED</p>
                  <p className="text-white font-mono">
                    {performanceData.maxRecorded || '118'} 
                    <span className="text-xs text-gray-400 ml-1">mph</span>
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-400 text-xs">BEST 0-60</p>
                  <p className="text-white font-mono">
                    {performanceData.bestAcceleration || '5.8'}
                    <span className="text-xs text-gray-400 ml-1">sec</span>
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-400 text-xs">BEST ECONOMY</p>
                  <p className="text-white font-mono">
                    {performanceData.bestEconomy || '34.2'}
                    <span className="text-xs text-gray-400 ml-1">mpg</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}