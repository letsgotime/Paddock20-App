// /client/src/pages/GTGVaultTireTracker.tsx

import React from "react";
import { Plus, Filter, Settings, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const GTGVaultTireTracker: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">
          Tire Management System
        </h1>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Active Tire Sets</h2>
            <p className="text-gray-400">Track and manage all tire sets for your vehicles</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="border-zinc-700">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            <Button className="bg-green-600 hover:bg-green-500 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Tire Set
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tire Set Cards */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-blue-400">Michelin Pilot Sport 4S</CardTitle>
                <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-400">
                  Street
                </Badge>
              </div>
              <div className="text-sm text-gray-400">2022 Porsche 911 GT3</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Size Front</div>
                  <div className="font-medium">245/35/R20</div>
                </div>
                <div>
                  <div className="text-gray-400">Size Rear</div>
                  <div className="font-medium">305/30/R20</div>
                </div>
                <div>
                  <div className="text-gray-400">Front PSI</div>
                  <div className="font-medium">32 psi</div>
                </div>
                <div>
                  <div className="text-gray-400">Rear PSI</div>
                  <div className="font-medium">36 psi</div>
                </div>
              </div>
              
              <Separator className="bg-zinc-800" />
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm text-gray-400">Tire Life</div>
                  <div className="text-sm font-medium text-green-400">85%</div>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-400">Installation:</span> April 15, 2025
                </div>
                <div>
                  <span className="text-gray-400">Mileage:</span> 1,250 mi
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" size="sm" className="border-zinc-700">
                  <FileText className="h-4 w-4 mr-2" /> Log
                </Button>
                <Button variant="outline" size="sm" className="border-zinc-700">
                  <Settings className="h-4 w-4 mr-2" /> Manage
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-blue-400">Pirelli P Zero Trofeo R</CardTitle>
                <Badge className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 hover:text-purple-400">
                  Track
                </Badge>
              </div>
              <div className="text-sm text-gray-400">2022 Porsche 911 GT3</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Size Front</div>
                  <div className="font-medium">245/35/R20</div>
                </div>
                <div>
                  <div className="text-gray-400">Size Rear</div>
                  <div className="font-medium">305/30/R20</div>
                </div>
                <div>
                  <div className="text-gray-400">Front PSI</div>
                  <div className="font-medium">28 psi (hot)</div>
                </div>
                <div>
                  <div className="text-gray-400">Rear PSI</div>
                  <div className="font-medium">30 psi (hot)</div>
                </div>
              </div>
              
              <Separator className="bg-zinc-800" />
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm text-gray-400">Heat Cycles</div>
                  <div className="text-sm font-medium">4 / 10</div>
                </div>
                <Progress value={40} className="h-2" />
              </div>
              
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-400">Installation:</span> March 5, 2025
                </div>
                <div>
                  <span className="text-gray-400">Track Days:</span> 2
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" size="sm" className="border-zinc-700">
                  <FileText className="h-4 w-4 mr-2" /> Log
                </Button>
                <Button variant="outline" size="sm" className="border-zinc-700">
                  <Settings className="h-4 w-4 mr-2" /> Manage
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-blue-400">Bridgestone Blizzak LM005</CardTitle>
                <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-400">
                  Winter
                </Badge>
              </div>
              <div className="text-sm text-gray-400">2019 BMW M4</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Size Front</div>
                  <div className="font-medium">255/35/R19</div>
                </div>
                <div>
                  <div className="text-gray-400">Size Rear</div>
                  <div className="font-medium">275/35/R19</div>
                </div>
                <div>
                  <div className="text-gray-400">Front PSI</div>
                  <div className="font-medium">35 psi</div>
                </div>
                <div>
                  <div className="text-gray-400">Rear PSI</div>
                  <div className="font-medium">38 psi</div>
                </div>
              </div>
              
              <Separator className="bg-zinc-800" />
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm text-gray-400">Tire Life</div>
                  <div className="text-sm font-medium text-yellow-400">45%</div>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-400">Season:</span> 2024/25
                </div>
                <div>
                  <span className="text-gray-400">Storage:</span> Basement
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" size="sm" className="border-zinc-700">
                  <FileText className="h-4 w-4 mr-2" /> Log
                </Button>
                <Button variant="outline" size="sm" className="border-zinc-700">
                  <Settings className="h-4 w-4 mr-2" /> Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tire Info & Alerts */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Tire Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <span className="font-medium">Winter Tires Storage Reminder</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    Your BMW M4 winter tires should be stored properly during summer months. Store in a cool, dark, dry location.
                  </p>
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" className="border-zinc-700">
                      Mark Complete
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="font-medium">Track Tires Heat Cycle Warning</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    Your Pirelli P Zero Trofeo R tires are approaching their recommended heat cycle limit. Consider replacement soon.
                  </p>
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" className="border-zinc-700">
                      Dismiss
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-green-400" />
                    <span className="font-medium">Rotation Recommendation</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    Your Michelin Pilot Sport 4S tires should be rotated at your next service interval for optimal wear.
                  </p>
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" className="border-zinc-700">
                      Schedule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-blue-400">Tire Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-green-600 hover:bg-green-500">
                  <Plus className="h-4 w-4 mr-2" /> Add New Tire Set
                </Button>
                
                <Separator className="bg-zinc-800" />
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start border-zinc-700">
                    <FileText className="h-4 w-4 mr-2" /> Tire Pressure Log
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-zinc-700">
                    <FileText className="h-4 w-4 mr-2" /> Track Heat Cycle Log
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-zinc-700">
                    <FileText className="h-4 w-4 mr-2" /> Tire Rotation History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GTGVaultTireTracker;