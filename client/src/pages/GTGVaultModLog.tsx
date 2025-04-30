// /client/src/pages/GTGVaultModLog.tsx

import React from "react";
import { Plus, Filter, Settings, Sparkles, Tag, FileText, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const GTGVaultModLog: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">
          Modification Tracker
        </h1>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Vehicle Modifications</h2>
            <p className="text-gray-400">Track all modifications and upgrades for your vehicles</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="border-zinc-700">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-500 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Modification
            </Button>
          </div>
        </div>
        
        {/* Modifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden group hover:border-purple-500 transition-colors">
            <div className="relative h-40">
              <img 
                src="https://images.unsplash.com/photo-1611651338412-8403fa6e3599?q=80&w=2071&auto=format&fit=crop" 
                alt="Carbon Fiber Intake"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-3 left-3">
                <Badge className="mb-1 bg-purple-600 hover:bg-purple-500">
                  Performance
                </Badge>
                <h3 className="text-lg font-bold text-white">Carbon Fiber Intake</h3>
              </div>
            </div>
            <CardContent className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Vehicle</div>
                  <div className="font-medium">2022 Porsche 911 GT3</div>
                </div>
                <div>
                  <div className="text-gray-400">Date</div>
                  <div className="font-medium">April 5, 2025</div>
                </div>
                <div>
                  <div className="text-gray-400">Cost</div>
                  <div className="font-medium">$1,295.00</div>
                </div>
                <div>
                  <div className="text-gray-400">Brand</div>
                  <div className="font-medium">IPD Plenum</div>
                </div>
              </div>
              
              <Separator className="bg-zinc-800" />
              
              <div>
                <div className="text-gray-400 text-sm mb-1">Description</div>
                <p className="text-sm">High-flow carbon fiber intake system with IPD Y-pipe and BMC filter. +15hp, +12lb-ft.</p>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" size="sm" className="border-zinc-700">
                  <FileText className="h-4 w-4 mr-2" /> Details
                </Button>
                <Button variant="outline" size="sm" className="border-zinc-700">
                  <Settings className="h-4 w-4 mr-2" /> Edit
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden group hover:border-purple-500 transition-colors">
            <div className="relative h-40">
              <img 
                src="https://images.unsplash.com/photo-1626668893536-1e1cf9442c63?q=80&w=2072&auto=format&fit=crop" 
                alt="HRE P101 Wheels"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-3 left-3">
                <Badge className="mb-1 bg-green-600 hover:bg-green-500">
                  Aesthetics
                </Badge>
                <h3 className="text-lg font-bold text-white">HRE P101 Wheels</h3>
              </div>
            </div>
            <CardContent className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Vehicle</div>
                  <div className="font-medium">2019 BMW M4</div>
                </div>
                <div>
                  <div className="text-gray-400">Date</div>
                  <div className="font-medium">March 15, 2025</div>
                </div>
                <div>
                  <div className="text-gray-400">Cost</div>
                  <div className="font-medium">$6,500.00</div>
                </div>
                <div>
                  <div className="text-gray-400">Brand</div>
                  <div className="font-medium">HRE Performance</div>
                </div>
              </div>
              
              <Separator className="bg-zinc-800" />
              
              <div>
                <div className="text-gray-400 text-sm mb-1">Description</div>
                <p className="text-sm">20" HRE P101 forged wheels in Satin Bronze finish. 20x9.5 front, 20x11 rear with Michelin PS4S tires.</p>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" size="sm" className="border-zinc-700">
                  <FileText className="h-4 w-4 mr-2" /> Details
                </Button>
                <Button variant="outline" size="sm" className="border-zinc-700">
                  <Settings className="h-4 w-4 mr-2" /> Edit
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden group hover:border-purple-500 transition-colors">
            <div className="relative h-40">
              <img 
                src="https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?q=80&w=2095&auto=format&fit=crop" 
                alt="KW Coilovers"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-3 left-3">
                <Badge className="mb-1 bg-blue-600 hover:bg-blue-500">
                  Suspension
                </Badge>
                <h3 className="text-lg font-bold text-white">KW V3 Coilovers</h3>
              </div>
            </div>
            <CardContent className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Vehicle</div>
                  <div className="font-medium">2019 BMW M4</div>
                </div>
                <div>
                  <div className="text-gray-400">Date</div>
                  <div className="font-medium">February 22, 2025</div>
                </div>
                <div>
                  <div className="text-gray-400">Cost</div>
                  <div className="font-medium">$2,950.00</div>
                </div>
                <div>
                  <div className="text-gray-400">Brand</div>
                  <div className="font-medium">KW Suspension</div>
                </div>
              </div>
              
              <Separator className="bg-zinc-800" />
              
              <div>
                <div className="text-gray-400 text-sm mb-1">Description</div>
                <p className="text-sm">KW Variant 3 coilovers with adjustable compression and rebound damping. Height adjusted -1.2" front, -0.8" rear.</p>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" size="sm" className="border-zinc-700">
                  <FileText className="h-4 w-4 mr-2" /> Details
                </Button>
                <Button variant="outline" size="sm" className="border-zinc-700">
                  <Settings className="h-4 w-4 mr-2" /> Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Modification Stats */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Total Mods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">12</span>
                <span className="bg-purple-500/20 p-2 rounded-full">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Total Invested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">$24,850</span>
                <span className="bg-green-500/20 p-2 rounded-full">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Recent Mod</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold truncate">Carbon Intake</span>
                <span className="bg-blue-500/20 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </span>
              </div>
              <div className="text-sm text-gray-400 mt-1">April 5, 2025</div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Most Modified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold truncate">BMW M4</div>
                  <div className="text-sm text-gray-400">7 modifications</div>
                </div>
                <span className="bg-yellow-500/20 p-2 rounded-full">
                  <Tag className="h-5 w-5 text-yellow-400" />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Categories */}
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-4">Modification Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 border-zinc-700 justify-start">
              <div className="flex flex-col items-center w-full">
                <Sparkles className="h-8 w-8 text-purple-400 mb-2" />
                <span>Performance</span>
                <span className="text-xs text-gray-400 mt-1">5 mods</span>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4 border-zinc-700 justify-start">
              <div className="flex flex-col items-center w-full">
                <Tag className="h-8 w-8 text-green-400 mb-2" />
                <span>Aesthetics</span>
                <span className="text-xs text-gray-400 mt-1">4 mods</span>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4 border-zinc-700 justify-start">
              <div className="flex flex-col items-center w-full">
                <Settings className="h-8 w-8 text-blue-400 mb-2" />
                <span>Suspension</span>
                <span className="text-xs text-gray-400 mt-1">2 mods</span>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4 border-zinc-700 justify-start">
              <div className="flex flex-col items-center w-full">
                <Plus className="h-8 w-8 text-gray-400 mb-2" />
                <span>Add Category</span>
                <span className="text-xs text-gray-400 mt-1">Create new</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GTGVaultModLog;