import { useState } from 'react';
import { 
  Wrench, 
  FileText, 
  Camera, 
  Film, 
  PlusCircle, 
  Radio, 
  Check, 
  Gauge,
  Thermometer,
  Zap,
  SparkleIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface ProjectEntry {
  type: string;
  vehicleId: string;
  title: string;
  notes: string;
  image?: File;
  video?: File;
  document?: File;
  audio?: File;
  telemetry?: {
    surfaceTemp?: string;
    tirePressure?: string;
    torqueSetting?: string;
    gripLevel?: string;
    obdConnected?: boolean;
  };
  addToFeed: boolean;
}

const ProjectLauncherModule = () => {
  const [entry, setEntry] = useState<ProjectEntry>({
    type: 'mod',
    vehicleId: '',
    title: '',
    notes: '',
    telemetry: {},
    addToFeed: true,
  });

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  const handleFileChange = (fileType: keyof Omit<ProjectEntry, 'type' | 'vehicleId' | 'title' | 'notes' | 'telemetry' | 'addToFeed'>, file: File) => {
    setEntry({ ...entry, [fileType]: file });
    if (fileType === 'image') setFilePreview(URL.createObjectURL(file));
  };

  const submitProject = () => {
    console.log('Submitting entry:', entry);
    toast({
      title: "Project Submitted",
      description: `Your ${entry.type} project has been added to your garage. ${entry.addToFeed ? 'Posted to Live Feed.' : ''}`,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <SparkleIcon className="h-6 w-6 text-[#7FC844]" />
                Project Launcher
              </h1>
              <p className="text-gray-400 mt-1">
                Document everything for your vehicle. Every detail matters.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 bg-zinc-800 p-1 rounded-lg mb-6">
                <TabsTrigger 
                  value="details" 
                  className="data-[state=active]:bg-[#7FC844] data-[state=active]:text-black"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Project Details
                </TabsTrigger>
                <TabsTrigger 
                  value="media" 
                  className="data-[state=active]:bg-[#7FC844] data-[state=active]:text-black"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Media Files
                </TabsTrigger>
                <TabsTrigger 
                  value="telemetry" 
                  className="data-[state=active]:bg-[#7FC844] data-[state=active]:text-black"
                >
                  <Gauge className="h-4 w-4 mr-2" />
                  F1 Telemetry
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Project Type</label>
                      <select
                        value={entry.type}
                        onChange={(e) => setEntry({ ...entry, type: e.target.value })}
                        className="w-full bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700"
                      >
                        <option value="mod">Modification</option>
                        <option value="tire">Tire Service</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="telemetry">F1 Telemetry</option>
                        <option value="detailing">Detailing Session</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Project Title</label>
                      <input
                        placeholder="e.g. 'Exhaust System Upgrade' or 'Summer Tire Installation'"
                        value={entry.title}
                        onChange={(e) => setEntry({ ...entry, title: e.target.value })}
                        className="w-full bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Notes & Description</label>
                      <textarea
                        placeholder="Detailed notes about the project, parts used, settings applied, etc."
                        value={entry.notes}
                        onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
                        className="w-full bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700"
                        rows={5}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                      <h3 className="font-semibold text-lg mb-4 text-[#7FC844] flex items-center">
                        <Wrench className="h-5 w-5 mr-2" />
                        Project Settings
                      </h3>

                      <div className="space-y-3">
                        {entry.type === 'mod' && (
                          <div className="p-3 rounded-lg bg-zinc-900">
                            <label className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-gray-300">Modification Type</span>
                            </label>
                            <select className="w-full bg-zinc-800 text-white p-2 rounded border border-zinc-700 text-sm">
                              <option value="performance">Performance</option>
                              <option value="cosmetic">Cosmetic</option>
                              <option value="audio">Audio System</option>
                              <option value="suspension">Suspension</option>
                              <option value="engine">Engine</option>
                              <option value="exhaust">Exhaust</option>
                              <option value="wheels">Wheels & Tires</option>
                              <option value="interior">Interior</option>
                              <option value="lighting">Lighting</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        )}

                        {entry.type === 'maintenance' && (
                          <div className="p-3 rounded-lg bg-zinc-900">
                            <label className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-gray-300">Service Type</span>
                            </label>
                            <select className="w-full bg-zinc-800 text-white p-2 rounded border border-zinc-700 text-sm">
                              <option value="oil">Oil Change</option>
                              <option value="brakes">Brake Service</option>
                              <option value="fluids">Fluid Change</option>
                              <option value="filter">Filter Replacement</option>
                              <option value="alignment">Wheel Alignment</option>
                              <option value="inspection">General Inspection</option>
                              <option value="battery">Battery Service</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        )}

                        <div className="p-3 rounded-lg bg-zinc-900">
                          <label className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-300">Post to Live Feed</span>
                            <Switch 
                              checked={entry.addToFeed} 
                              onCheckedChange={(checked) => setEntry({ ...entry, addToFeed: checked })}
                              className="data-[state=checked]:bg-[#7FC844]"
                            />
                          </label>
                          <p className="text-xs text-gray-500">
                            Share this project with the Paddock20 community
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-zinc-900">
                          <label className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-300">Track Project Cost</span>
                            <Switch 
                              className="data-[state=checked]:bg-[#7FC844]"
                              defaultChecked={true}
                            />
                          </label>
                          <div className="flex gap-3 mt-3">
                            <div className="flex-1">
                              <input 
                                type="number" 
                                placeholder="Cost" 
                                className="w-full bg-zinc-800 text-white p-2 rounded border border-zinc-700 text-sm" 
                              />
                            </div>
                            <select className="bg-zinc-800 text-white p-2 rounded border border-zinc-700 text-sm">
                              <option value="usd">USD</option>
                              <option value="eur">EUR</option>
                              <option value="gbp">GBP</option>
                              <option value="cad">CAD</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-zinc-800 p-5 rounded-lg border border-zinc-700">
                      <h3 className="font-medium mb-4 text-[#7FC844] flex items-center">
                        <Camera className="h-5 w-5 mr-2" />
                        Project Photos
                      </h3>

                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center">
                          <Camera className="h-8 w-8 mx-auto text-zinc-500 mb-2" />
                          <p className="text-sm text-zinc-500">Drag photos here or click to upload</p>
                          <input 
                            type="file" 
                            onChange={(e) => e.target.files && handleFileChange('image', e.target.files[0])} 
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" 
                            multiple
                          />
                        </div>

                        {filePreview && (
                          <div className="relative">
                            <img 
                              src={filePreview} 
                              alt="Preview" 
                              className="w-full h-40 object-cover rounded-lg" 
                            />
                            <Badge className="absolute top-2 right-2 bg-black/50">
                              Preview
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-zinc-800 p-5 rounded-lg border border-zinc-700">
                      <h3 className="font-medium mb-4 text-[#7FC844] flex items-center">
                        <Film className="h-5 w-5 mr-2" />
                        Video & Audio
                      </h3>

                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center">
                          <Film className="h-8 w-8 mx-auto text-zinc-500 mb-2" />
                          <p className="text-sm text-zinc-500">Upload video of the project</p>
                          <input 
                            type="file" 
                            onChange={(e) => e.target.files && handleFileChange('video', e.target.files[0])} 
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" 
                          />
                        </div>
                        
                        <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center">
                          <Radio className="h-8 w-8 mx-auto text-zinc-500 mb-2" />
                          <p className="text-sm text-zinc-500">Upload voice notes</p>
                          <input 
                            type="file" 
                            onChange={(e) => e.target.files && handleFileChange('audio', e.target.files[0])} 
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" 
                          />
                        </div>

                        <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center">
                          <FileText className="h-8 w-8 mx-auto text-zinc-500 mb-2" />
                          <p className="text-sm text-zinc-500">Upload documents (PDF, etc)</p>
                          <input 
                            type="file" 
                            onChange={(e) => e.target.files && handleFileChange('document', e.target.files[0])} 
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="telemetry" className="mt-0">
                <div className="bg-zinc-800 p-5 rounded-lg border border-zinc-700">
                  <h3 className="font-medium mb-6 text-[#7FC844] flex items-center">
                    <Gauge className="h-5 w-5 mr-2" />
                    F1 Telemetry Data
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          <Thermometer className="h-4 w-4 inline mr-1" />
                          Surface Temperature (°F)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 72"
                          onChange={(e) => setEntry({ ...entry, telemetry: { ...entry.telemetry, surfaceTemp: e.target.value } })}
                          className="w-full bg-zinc-900 text-white p-3 rounded-lg border border-zinc-700"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          <Gauge className="h-4 w-4 inline mr-1" />
                          Tire Pressure (PSI)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 36"
                          onChange={(e) => setEntry({ ...entry, telemetry: { ...entry.telemetry, tirePressure: e.target.value } })}
                          className="w-full bg-zinc-900 text-white p-3 rounded-lg border border-zinc-700"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          <Wrench className="h-4 w-4 inline mr-1" />
                          Torque Setting (ft-lb)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 90"
                          onChange={(e) => setEntry({ ...entry, telemetry: { ...entry.telemetry, torqueSetting: e.target.value } })}
                          className="w-full bg-zinc-900 text-white p-3 rounded-lg border border-zinc-700"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          <Gauge className="h-4 w-4 inline mr-1" />
                          Grip Level
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 'High' or 1-10 scale"
                          onChange={(e) => setEntry({ ...entry, telemetry: { ...entry.telemetry, gripLevel: e.target.value } })}
                          className="w-full bg-zinc-900 text-white p-3 rounded-lg border border-zinc-700"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 rounded-lg bg-black/30 border border-[#7FC844]/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-[#7FC844]" />
                        <h4 className="font-medium">OBD-II Data Connection</h4>
                      </div>
                      <Switch 
                        checked={entry.telemetry?.obdConnected || false}
                        onCheckedChange={(checked) =>
                          setEntry({
                            ...entry,
                            telemetry: { ...entry.telemetry, obdConnected: checked },
                          })
                        }
                        className="data-[state=checked]:bg-[#7FC844]"
                      />
                    </div>
                    
                    <p className="text-sm text-gray-400 mt-2">
                      Automatically import real-time OBD-II data directly from your vehicle's computer
                    </p>
                    
                    {entry.telemetry?.obdConnected && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-zinc-900 p-3 rounded border border-zinc-800 text-center">
                          <p className="text-xs text-gray-500">Engine RPM</p>
                          <p className="text-lg font-medium">1,250</p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded border border-zinc-800 text-center">
                          <p className="text-xs text-gray-500">Engine Temp</p>
                          <p className="text-lg font-medium">195°F</p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded border border-zinc-800 text-center">
                          <p className="text-xs text-gray-500">Battery</p>
                          <p className="text-lg font-medium">12.7V</p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded border border-zinc-800 text-center">
                          <p className="text-xs text-gray-500">Fuel Level</p>
                          <p className="text-lg font-medium">87%</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-8 flex justify-end gap-3">
              <button
                className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-lg transition flex items-center gap-2"
              >
                Save as Draft
              </button>
              <button
                onClick={submitProject}
                className="bg-[#7FC844] hover:bg-[#6cb33a] text-black py-2 px-4 rounded-lg transition flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Submit Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectLauncherModule;