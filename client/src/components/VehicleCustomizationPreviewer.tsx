import { useState, useEffect } from 'react';
import { 
  Car, 
  Paintbrush, 
  PaintBucket, 
  Palette, 
  Repeat, 
  RotateCcw, 
  Download, 
  Check, 
  Image as ImageIcon,
  CircleDashed,
  Layers,
  Maximize,
  ChevronDown
} from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  image_url: string;
}

interface Modification {
  type: 'color' | 'wheels' | 'bodykit' | 'windows' | 'lights' | 'spoiler';
  name: string;
  value: string;
  thumbnail?: string;
}

const VehicleCustomizationPreviewer = ({ 
  vehicle, 
  onClose 
}: { 
  vehicle: Vehicle;
  onClose: () => void;
}) => {
  // State
  const [activeTab, setActiveTab] = useState<string>('color');
  const [selectedColor, setSelectedColor] = useState<string>(vehicle.color || '#000000');
  const [selectedWheels, setSelectedWheels] = useState<string>('stock');
  const [selectedBodykit, setSelectedBodykit] = useState<string>('stock');
  const [selectedWindows, setSelectedWindows] = useState<string>('clear');
  const [selectedLights, setSelectedLights] = useState<string>('stock');
  const [selectedSpoiler, setSelectedSpoiler] = useState<string>('none');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [modifications, setModifications] = useState<Modification[]>([]);
  const [viewAngle, setViewAngle] = useState<'front' | 'side' | 'rear' | '3/4'>('3/4');

  // Available colors
  const availableColors = [
    { name: 'Jet Black', value: '#000000' },
    { name: 'Arctic White', value: '#ffffff' },
    { name: 'Racing Red', value: '#cc0000' },
    { name: 'Azure Blue', value: '#0066cc' },
    { name: 'Emerald Green', value: '#006633' },
    { name: 'Sunset Orange', value: '#ff6600' },
    { name: 'Solar Yellow', value: '#ffcc00' },
    { name: 'Gunmetal Grey', value: '#333333' },
    { name: 'Midnight Purple', value: '#330066' },
  ];

  // Available wheels
  const availableWheels = [
    { name: 'Stock', value: 'stock', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Stock' },
    { name: 'Sport', value: 'sport', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Sport' },
    { name: 'Racing', value: 'racing', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Racing' },
    { name: 'Luxury', value: 'luxury', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Luxury' },
    { name: 'Off-Road', value: 'offroad', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Off+Road' },
  ];

  // Available body kits
  const availableBodykits = [
    { name: 'Stock', value: 'stock', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Stock' },
    { name: 'Sport', value: 'sport', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Sport' },
    { name: 'Widebody', value: 'widebody', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Widebody' },
    { name: 'Aero', value: 'aero', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Aero' },
  ];

  // Available window tints
  const availableWindows = [
    { name: 'Clear', value: 'clear', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Clear' },
    { name: 'Light Tint', value: 'light', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Light' },
    { name: 'Medium Tint', value: 'medium', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Medium' },
    { name: 'Dark Tint', value: 'dark', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Dark' },
  ];

  // Available lights
  const availableLights = [
    { name: 'Stock', value: 'stock', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Stock' },
    { name: 'LED', value: 'led', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=LED' },
    { name: 'Xenon', value: 'xenon', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Xenon' },
    { name: 'Tinted', value: 'tinted', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Tinted' },
  ];

  // Available spoilers
  const availableSpoilers = [
    { name: 'None', value: 'none', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=None' },
    { name: 'Lip', value: 'lip', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Lip' },
    { name: 'Wing', value: 'wing', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=Wing' },
    { name: 'GT', value: 'gt', thumbnail: 'https://placehold.co/60x60/333/7FC844?text=GT' },
  ];

  // Track modifications
  useEffect(() => {
    const currentMods: Modification[] = [];
    
    if (selectedColor !== vehicle.color) {
      currentMods.push({
        type: 'color',
        name: availableColors.find(c => c.value === selectedColor)?.name || 'Custom',
        value: selectedColor
      });
    }
    
    if (selectedWheels !== 'stock') {
      const wheelOption = availableWheels.find(w => w.value === selectedWheels);
      currentMods.push({
        type: 'wheels',
        name: wheelOption?.name || 'Custom Wheels',
        value: selectedWheels,
        thumbnail: wheelOption?.thumbnail
      });
    }
    
    if (selectedBodykit !== 'stock') {
      const bodykitOption = availableBodykits.find(b => b.value === selectedBodykit);
      currentMods.push({
        type: 'bodykit',
        name: bodykitOption?.name || 'Custom Bodykit',
        value: selectedBodykit,
        thumbnail: bodykitOption?.thumbnail
      });
    }
    
    if (selectedWindows !== 'clear') {
      const windowOption = availableWindows.find(w => w.value === selectedWindows);
      currentMods.push({
        type: 'windows',
        name: windowOption?.name || 'Custom Tint',
        value: selectedWindows,
        thumbnail: windowOption?.thumbnail
      });
    }
    
    if (selectedLights !== 'stock') {
      const lightOption = availableLights.find(l => l.value === selectedLights);
      currentMods.push({
        type: 'lights',
        name: lightOption?.name || 'Custom Lights',
        value: selectedLights,
        thumbnail: lightOption?.thumbnail
      });
    }
    
    if (selectedSpoiler !== 'none') {
      const spoilerOption = availableSpoilers.find(s => s.value === selectedSpoiler);
      currentMods.push({
        type: 'spoiler',
        name: spoilerOption?.name || 'Custom Spoiler',
        value: selectedSpoiler,
        thumbnail: spoilerOption?.thumbnail
      });
    }
    
    setModifications(currentMods);
  }, [
    selectedColor, 
    selectedWheels, 
    selectedBodykit, 
    selectedWindows, 
    selectedLights, 
    selectedSpoiler,
    vehicle.color
  ]);

  // Generate vehicle image based on customizations
  const generateCustomizedImage = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Visualization Generated",
        description: "Vehicle customization preview has been updated."
      });
    }, 1500);
  };
  
  // Save customization
  const saveCustomization = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Customization Saved",
        description: "Your vehicle customization has been saved to your profile."
      });
      onClose();
    }, 1500);
  };
  
  // Reset all customizations
  const resetCustomizations = () => {
    setSelectedColor(vehicle.color || '#000000');
    setSelectedWheels('stock');
    setSelectedBodykit('stock');
    setSelectedWindows('clear');
    setSelectedLights('stock');
    setSelectedSpoiler('none');
    
    toast({
      title: "Customizations Reset",
      description: "All modifications have been reset to stock."
    });
  };
  
  // Download customization image
  const downloadImage = () => {
    toast({
      title: "Image Downloaded",
      description: "Your customized vehicle image has been downloaded."
    });
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Get visualization image based on selections and view angle
  const getVisualizationImage = () => {
    // In a real implementation, this would generate or retrieve a customized image
    // For now, we'll return the vehicle image with a colored overlay to simulate customization
    return (
      <div className="relative w-full h-full">
        <img 
          src={vehicle.image_url || 'https://placehold.co/600x400/333/7FC844?text=Vehicle+Image'} 
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover rounded-md"
        />
        <div 
          className="absolute inset-0 rounded-md opacity-30" 
          style={{ backgroundColor: selectedColor }}
        ></div>
        
        {/* This would be replaced with actual customization elements */}
        {selectedBodykit !== 'stock' && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/50 flex items-center justify-center text-white text-sm">
            {availableBodykits.find(b => b.value === selectedBodykit)?.name} Bodykit Applied
          </div>
        )}
        
        {selectedWheels !== 'stock' && (
          <div className="absolute bottom-16 left-8 h-16 w-16 rounded-full bg-black/70 flex items-center justify-center text-white text-[10px]">
            {availableWheels.find(w => w.value === selectedWheels)?.name} Wheels
          </div>
        )}
        
        {selectedSpoiler !== 'none' && (
          <div className="absolute top-1/3 right-8 h-4 w-24 bg-black/70 flex items-center justify-center text-white text-[10px]">
            {availableSpoilers.find(s => s.value === selectedSpoiler)?.name} Spoiler
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-black text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Paintbrush className="h-6 w-6 text-[#7FC844]" />
            Vehicle Customization Previewer
          </h2>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-4 w-4 mr-2" />
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetCustomizations}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={downloadImage}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm">
              Close
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Visualization Area */}
          <div className="lg:w-2/3 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    View: {viewAngle}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setViewAngle('front')}>
                    Front View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewAngle('side')}>
                    Side View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewAngle('rear')}>
                    Rear View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewAngle('3/4')}>
                    3/4 View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="bg-zinc-800 rounded-lg overflow-hidden aspect-video">
              {isLoading ? (
                <div className="h-full w-full flex flex-col items-center justify-center">
                  <CircleDashed className="h-12 w-12 animate-spin text-[#7FC844] mb-2" />
                  <p className="text-sm text-gray-400">Generating visualization...</p>
                </div>
              ) : (
                getVisualizationImage()
              )}
            </div>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-zinc-800 rounded p-2">
                <div className="text-xs text-gray-400">Make/Model</div>
                <div className="font-medium">{vehicle.make} {vehicle.model}</div>
              </div>
              <div className="bg-zinc-800 rounded p-2">
                <div className="text-xs text-gray-400">Year</div>
                <div className="font-medium">{vehicle.year}</div>
              </div>
              <div className="bg-zinc-800 rounded p-2">
                <div className="text-xs text-gray-400">Color</div>
                <div className="font-medium flex items-center">
                  <span 
                    className="h-3 w-3 rounded-full mr-2" 
                    style={{ backgroundColor: selectedColor }}
                  ></span>
                  {availableColors.find(c => c.value === selectedColor)?.name || 'Custom'}
                </div>
              </div>
              <div className="bg-zinc-800 rounded p-2">
                <div className="text-xs text-gray-400">Modifications</div>
                <div className="font-medium">{modifications.length} applied</div>
              </div>
            </div>
          </div>
          
          {/* Customization Controls */}
          <div className="lg:w-1/3 bg-zinc-900 rounded-xl border border-zinc-800">
            <Tabs defaultValue="color" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 rounded-t-xl rounded-b-none bg-zinc-800 p-0">
                <TabsTrigger 
                  value="color" 
                  className="rounded-none data-[state=active]:bg-[#7FC844]/20 data-[state=active]:text-[#7FC844]"
                >
                  <PaintBucket className="h-4 w-4 mr-2" />
                  Color
                </TabsTrigger>
                <TabsTrigger 
                  value="wheels" 
                  className="rounded-none data-[state=active]:bg-[#7FC844]/20 data-[state=active]:text-[#7FC844]"
                >
                  <Car className="h-4 w-4 mr-2" />
                  Wheels
                </TabsTrigger>
                <TabsTrigger 
                  value="bodykit" 
                  className="rounded-none data-[state=active]:bg-[#7FC844]/20 data-[state=active]:text-[#7FC844]"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Body
                </TabsTrigger>
              </TabsList>
              
              <div className="p-4">
                <TabsContent value="color" className="mt-0">
                  <div className="mb-4">
                    <h4 className="text-lg font-medium mb-2">Paint Color</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {availableColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setSelectedColor(color.value)}
                          className={`p-2 rounded border ${
                            selectedColor === color.value 
                              ? 'border-[#7FC844]' 
                              : 'border-zinc-700'
                          } flex flex-col items-center`}
                        >
                          <div 
                            className="h-10 w-10 rounded-full mb-1" 
                            style={{ backgroundColor: color.value }}
                          ></div>
                          <span className="text-xs">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="wheels" className="mt-0">
                  <div className="mb-4">
                    <h4 className="text-lg font-medium mb-2">Wheel Style</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {availableWheels.map((wheel) => (
                        <button
                          key={wheel.value}
                          onClick={() => setSelectedWheels(wheel.value)}
                          className={`p-2 rounded border ${
                            selectedWheels === wheel.value 
                              ? 'border-[#7FC844]' 
                              : 'border-zinc-700'
                          } flex items-center gap-2`}
                        >
                          <img 
                            src={wheel.thumbnail} 
                            alt={wheel.name} 
                            className="h-10 w-10 object-cover rounded"
                          />
                          <span>{wheel.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="bodykit" className="mt-0">
                  <div className="mb-4">
                    <h4 className="text-lg font-medium mb-2">Body Kit</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {availableBodykits.map((bodykit) => (
                        <button
                          key={bodykit.value}
                          onClick={() => setSelectedBodykit(bodykit.value)}
                          className={`p-2 rounded border ${
                            selectedBodykit === bodykit.value 
                              ? 'border-[#7FC844]' 
                              : 'border-zinc-700'
                          } flex items-center gap-2`}
                        >
                          <img 
                            src={bodykit.thumbnail} 
                            alt={bodykit.name} 
                            className="h-10 w-10 object-cover rounded"
                          />
                          <span>{bodykit.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-lg font-medium mb-2">Window Tint</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {availableWindows.map((window) => (
                        <button
                          key={window.value}
                          onClick={() => setSelectedWindows(window.value)}
                          className={`p-2 rounded border ${
                            selectedWindows === window.value 
                              ? 'border-[#7FC844]' 
                              : 'border-zinc-700'
                          } flex items-center gap-2`}
                        >
                          <img 
                            src={window.thumbnail} 
                            alt={window.name} 
                            className="h-10 w-10 object-cover rounded"
                          />
                          <span>{window.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-lg font-medium mb-2">Spoiler</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {availableSpoilers.map((spoiler) => (
                        <button
                          key={spoiler.value}
                          onClick={() => setSelectedSpoiler(spoiler.value)}
                          className={`p-2 rounded border ${
                            selectedSpoiler === spoiler.value 
                              ? 'border-[#7FC844]' 
                              : 'border-zinc-700'
                          } flex items-center gap-2`}
                        >
                          <img 
                            src={spoiler.thumbnail} 
                            alt={spoiler.name} 
                            className="h-10 w-10 object-cover rounded"
                          />
                          <span>{spoiler.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </div>
              
              {/* Applied Modifications Summary */}
              <div className="p-4 border-t border-zinc-800">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Palette className="h-4 w-4 text-[#7FC844]" />
                  Applied Modifications
                </h4>
                
                {modifications.length > 0 ? (
                  <div className="space-y-2">
                    {modifications.map((mod, index) => (
                      <div key={index} className="flex items-center justify-between bg-zinc-800 rounded p-2">
                        <div className="flex items-center gap-2">
                          {mod.thumbnail ? (
                            <img 
                              src={mod.thumbnail} 
                              alt={mod.name} 
                              className="h-6 w-6 object-cover rounded"
                            />
                          ) : mod.type === 'color' ? (
                            <div 
                              className="h-6 w-6 rounded" 
                              style={{ backgroundColor: mod.value }}
                            ></div>
                          ) : (
                            <div className="h-6 w-6 rounded bg-zinc-700 flex items-center justify-center">
                              <Palette className="h-3 w-3" />
                            </div>
                          )}
                          <span className="text-sm">{mod.name}</span>
                        </div>
                        <button 
                          onClick={() => {
                            // Reset this specific modification
                            switch(mod.type) {
                              case 'color': 
                                setSelectedColor(vehicle.color || '#000000');
                                break;
                              case 'wheels': 
                                setSelectedWheels('stock');
                                break;
                              case 'bodykit': 
                                setSelectedBodykit('stock');
                                break;
                              case 'windows': 
                                setSelectedWindows('clear');
                                break;
                              case 'lights': 
                                setSelectedLights('stock');
                                break;
                              case 'spoiler': 
                                setSelectedSpoiler('none');
                                break;
                            }
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-2 text-sm">
                    No modifications applied yet
                  </div>
                )}
              </div>
            </Tabs>

            <div className="p-4 border-t border-zinc-800 flex gap-2">
              <Button 
                className="w-full bg-[#7FC844] text-black hover:bg-[#6cb33a]"
                onClick={saveCustomization}
                disabled={isLoading || modifications.length === 0}
              >
                {isLoading ? (
                  <>
                    <CircleDashed className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Customization
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={generateCustomizedImage}
                disabled={isLoading}
              >
                <Repeat className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCustomizationPreviewer;