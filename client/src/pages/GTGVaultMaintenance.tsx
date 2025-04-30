// /client/src/pages/GTGVaultMaintenance.tsx

import React from "react";
import { Wrench, Calendar, Gauge, AlertTriangle, Plus, Filter, SlidersHorizontal, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const GTGVaultMaintenance: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">
          Maintenance Records
        </h1>
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Service History</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="border-zinc-700">
                  <Filter className="h-4 w-4 mr-2" /> Filter
                </Button>
                <Button className="bg-green-600 hover:bg-green-500 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Log Service
                </Button>
              </div>
            </div>
            
            {/* Recent Service Items */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Wrench className="h-5 w-5" /> Recent Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-800 rounded-md">
                    <div className="flex justify-between mb-1">
                      <div className="font-medium">Oil Change & Filter Replacement</div>
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-600">
                        Routine
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-400 mb-2">April 12, 2025 • 3,425 miles</div>
                    <div className="text-sm mb-3">
                      Used Mobil 1 0W-40 European Car Formula and K&N HP-1004 Oil Filter
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Cost: $89.95</span>
                      <span>Next service: 6,425 miles</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-zinc-800 rounded-md">
                    <div className="flex justify-between mb-1">
                      <div className="font-medium">Brake Fluid Flush</div>
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-600">
                        Critical
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-400 mb-2">March 25, 2025 • 2,980 miles</div>
                    <div className="text-sm mb-3">
                      Replaced with Motul RBF 660 DOT 4 racing brake fluid
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Cost: $225.00</span>
                      <span>Next service: March 25, 2027</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-zinc-800 rounded-md">
                    <div className="flex justify-between mb-1">
                      <div className="font-medium">Tire Rotation & Alignment</div>
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-600">
                        Preventative
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-400 mb-2">February 15, 2025 • 2,250 miles</div>
                    <div className="text-sm mb-3">
                      Full 4-wheel alignment and tire rotation for even wear pattern
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Cost: $149.95</span>
                      <span>Next service: 5,250 miles</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="w-full md:w-80 space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Upcoming Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border border-yellow-600/30 bg-yellow-500/10 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <span className="font-medium">Oil Change Due</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Due in 500 miles</p>
                  <Progress value={85} className="h-2 mb-2" />
                  <Button size="sm" className="w-full bg-yellow-600 hover:bg-yellow-500 text-white">
                    Schedule
                  </Button>
                </div>
                
                <div className="p-3 border border-blue-600/30 bg-blue-500/10 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span className="font-medium">Annual Inspection</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Due in 45 days</p>
                  <Progress value={65} className="h-2 mb-2" />
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                    Schedule
                  </Button>
                </div>
                
                <div className="p-3 border border-green-600/30 bg-green-500/10 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="h-4 w-4 text-green-400" />
                    <span className="font-medium">Tire Rotation</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Due in 1,200 miles</p>
                  <Progress value={45} className="h-2 mb-2" />
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-500 text-white">
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" /> Maintenance Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-gray-400">Total Services</span>
                    <span>24</span>
                  </div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-gray-400">Annual Spend</span>
                    <span>$1,245.65</span>
                  </div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-gray-400">DIY Savings</span>
                    <span>$780.25</span>
                  </div>
                </div>
                
                <Separator className="bg-zinc-800" />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Service Distribution</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Routine</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Preventative</span>
                        <span>25%</span>
                      </div>
                      <Progress value={25} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Critical</span>
                        <span>10%</span>
                      </div>
                      <Progress value={10} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GTGVaultMaintenance;