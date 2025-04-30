// /client/src/pages/GTGVaultDetailing.tsx

import React from "react";
import { Plus, Filter, Calendar, Droplets, FileText, Image as ImageIcon, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const GTGVaultDetailing: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">
          Detailing Records
        </h1>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Detailing Sessions</h2>
            <p className="text-gray-400">Track your detailing work and protect your investment</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="border-zinc-700">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Session
            </Button>
          </div>
        </div>
        
        {/* Sessions Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative pl-6 border-l-2 border-zinc-800 space-y-6">
              {/* Session 1 */}
              <div className="relative">
                <div className="absolute -left-[25px] top-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-white" />
                </div>
                
                <Card className="bg-zinc-900 border-zinc-800 ml-4">
                  <CardHeader className="flex flex-row justify-between items-start pb-2">
                    <div>
                      <Badge className="mb-2 bg-blue-600 hover:bg-blue-500">Full Detail</Badge>
                      <CardTitle>Spring Refresh Detail</CardTitle>
                      <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>April 15, 2025</span>
                        <span className="text-gray-600">•</span>
                        <Clock className="h-4 w-4" />
                        <span>4.5 hours</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-zinc-700">2022 Porsche 911 GT3</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Products Used:</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">Gyeon Wet Coat</Badge>
                        <Badge variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">Sonax Perfect Finish</Badge>
                        <Badge variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">CarPro Reset</Badge>
                        <Badge variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">Koch Chemie FSE</Badge>
                      </div>
                    </div>
                    
                    <Separator className="bg-zinc-800" />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Notes:</h4>
                      <p className="text-sm text-gray-400">Full paint correction with Rupes LHR15 and Sonax Perfect Finish. Finished with Gyeon Wet Coat. Wheels cleaned with P&S Brake Buster and protected with Gyeon Rim.</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <img 
                        src="https://images.unsplash.com/photo-1636618825587-28237f4f9d87?q=80&w=2080&auto=format&fit=crop" 
                        alt="Before" 
                        className="w-1/2 h-40 object-cover rounded"
                      />
                      <img 
                        src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop" 
                        alt="After" 
                        className="w-1/2 h-40 object-cover rounded"
                      />
                    </div>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" className="border-zinc-700">
                        <FileText className="h-4 w-4 mr-2" /> View Full Log
                      </Button>
                      <Button variant="outline" size="sm" className="border-zinc-700">
                        <ImageIcon className="h-4 w-4 mr-2" /> All Photos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Session 2 */}
              <div className="relative">
                <div className="absolute -left-[25px] top-0 h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-white" />
                </div>
                
                <Card className="bg-zinc-900 border-zinc-800 ml-4">
                  <CardHeader className="flex flex-row justify-between items-start pb-2">
                    <div>
                      <Badge className="mb-2 bg-green-600 hover:bg-green-500">Maintenance Wash</Badge>
                      <CardTitle>Weekly Maintenance</CardTitle>
                      <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>April 2, 2025</span>
                        <span className="text-gray-600">•</span>
                        <Clock className="h-4 w-4" />
                        <span>1.5 hours</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-zinc-700">2022 Porsche 911 GT3</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Products Used:</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">CarPro Reset</Badge>
                        <Badge variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">Beadmaker</Badge>
                        <Badge variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">P&S Brake Buster</Badge>
                      </div>
                    </div>
                    
                    <Separator className="bg-zinc-800" />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Notes:</h4>
                      <p className="text-sm text-gray-400">Two-bucket wash method with CarPro Reset. Wheels cleaned with P&S Brake Buster. Dried with BigBoi BlowR Pro and topped with Beadmaker.</p>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" className="border-zinc-700">
                        <FileText className="h-4 w-4 mr-2" /> View Full Log
                      </Button>
                      <Button variant="outline" size="sm" className="border-zinc-700">
                        <ImageIcon className="h-4 w-4 mr-2" /> Photos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Session 3 */}
              <div className="relative">
                <div className="absolute -left-[25px] top-0 h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-white" />
                </div>
                
                <Card className="bg-zinc-900 border-zinc-800 ml-4">
                  <CardHeader className="flex flex-row justify-between items-start pb-2">
                    <div>
                      <Badge className="mb-2 bg-purple-600 hover:bg-purple-500">Protection</Badge>
                      <CardTitle>Ceramic Coating Application</CardTitle>
                      <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>March 20, 2025</span>
                        <span className="text-gray-600">•</span>
                        <Clock className="h-4 w-4" />
                        <span>12 hours</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-zinc-700">2019 BMW M4</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Products Used:</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">GTechniq Crystal Serum Ultra</Badge>
                        <Badge variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">GTechniq EXO v4</Badge>
                        <Badge variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">CarPro IronX</Badge>
                        <Badge variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">Menzerna 3500</Badge>
                      </div>
                    </div>
                    
                    <Separator className="bg-zinc-800" />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Notes:</h4>
                      <p className="text-sm text-gray-400">Professional-grade ceramic coating with GTechniq Crystal Serum Ultra and EXO v4 top coat. Full paint correction beforehand with 3-stage polishing. 5-year protection.</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <img 
                        src="https://images.unsplash.com/photo-1552519507-88aa2dfa9fdb?q=80&w=2070&auto=format&fit=crop" 
                        alt="Before" 
                        className="w-1/2 h-40 object-cover rounded"
                      />
                      <img 
                        src="https://images.unsplash.com/photo-1603146058637-13250cadd7d0?q=80&w=2070&auto=format&fit=crop" 
                        alt="After" 
                        className="w-1/2 h-40 object-cover rounded"
                      />
                    </div>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" className="border-zinc-700">
                        <FileText className="h-4 w-4 mr-2" /> View Full Log
                      </Button>
                      <Button variant="outline" size="sm" className="border-zinc-700">
                        <ImageIcon className="h-4 w-4 mr-2" /> All Photos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-blue-400">Detailing Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-400">Total Sessions:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-400">Time Invested:</span>
                  <span className="font-medium">48 hours</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-400">Products Used:</span>
                  <span className="font-medium">28</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-400">Current Protection:</span>
                  <span className="font-medium text-green-400">Ceramic Coating</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-400">Next Service:</span>
                  <span className="font-medium">4 days</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-blue-400">Products Library</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between mb-2">
                  <h4 className="text-sm font-medium">Most Used Products</h4>
                  <Button variant="ghost" size="sm" className="h-6 p-0">View All</Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm p-2 bg-zinc-800 rounded">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-blue-400" />
                      <span>CarPro Reset</span>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">11 uses</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm p-2 bg-zinc-800 rounded">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-400" />
                      <span>Beadmaker</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">8 uses</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm p-2 bg-zinc-800 rounded">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-purple-400" />
                      <span>P&S Brake Buster</span>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">7 uses</Badge>
                  </div>
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-500">
                  <Plus className="h-4 w-4 mr-2" /> Add Product
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-blue-400">Upcoming Maintenance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-zinc-800 rounded">
                  <div className="font-medium mb-1">Weekly Wash</div>
                  <div className="text-xs text-gray-400 mb-2">2022 Porsche 911 GT3 • Due in 3 days</div>
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-500">Schedule</Button>
                </div>
                
                <div className="p-3 bg-zinc-800 rounded">
                  <div className="font-medium mb-1">Wax Renewal</div>
                  <div className="text-xs text-gray-400 mb-2">2019 BMW M4 • Due in 14 days</div>
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500">Schedule</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GTGVaultDetailing;