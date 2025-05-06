import React, { useState, useEffect } from 'react';
import { 
  X, Car, User, Wrench, Calendar, ChevronRight, ChevronLeft, AlertCircle, 
  Loader2, Music, Shield, FileText, Info, Check, Zap, Award, Gauge, Map,
  Sparkles, Github, Settings, Upload, Camera, BarChart3, Clock
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { decodeVIN, formatVIN } from '@/services/vinDecoderService';
import { getPlaylistsByActivity, getPlaylistDetails } from '@/services/spotifyService';

// Car brands for dropdown
const carBrands = [
  "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "Bugatti", 
  "Buick", "Cadillac", "Chevrolet", "Chrysler", "Citroen", "Dodge", "Ferrari", 
  "Fiat", "Ford", "Genesis", "GMC", "Honda", "Hyundai", "Infiniti", "Jaguar", 
  "Jeep", "Kia", "Lamborghini", "Land Rover", "Lexus", "Lincoln", "Lotus", 
  "Maserati", "Mazda", "McLaren", "Mercedes-Benz", "MINI", "Mitsubishi", 
  "Nissan", "Pagani", "Porsche", "Ram", "Rolls-Royce", "Subaru", "Tesla", 
  "Toyota", "Volkswagen", "Volvo"
];

const tireBrands = [
  "Michelin", "Bridgestone", "Goodyear", "Continental", "Pirelli", 
  "Dunlop", "Firestone", "BFGoodrich", "Hankook", "Yokohama", 
  "Toyo", "Cooper", "Falken", "Nitto", "General", "Kumho"
];

const interests = [
  { id: 'track', label: 'Track Days' },
  { id: 'autocross', label: 'Autocross' },
  { id: 'rally', label: 'Rally' },
  { id: 'drift', label: 'Drifting' },
  { id: 'drag', label: 'Drag Racing' },
  { id: 'offroad', label: 'Off-Roading' },
  { id: 'restoration', label: 'Restoration' },
  { id: 'detailing', label: 'Detailing' },
  { id: 'modification', label: 'Modifications' },
  { id: 'shows', label: 'Car Shows' }
];

// Shirt sizes
const shirtSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  betaRole?: 'user' | 'tester';
}

interface UserInfo {
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  shirtSize: string;
  interests: string[];
  bio: string;
  dreamCar: string;
  dreamExperience: string;
  spotifyPlaylistUrl: string;
}

interface VehicleInfo {
  vin: string;
  make: string;
  model: string;
  year: string;
  trim: string;
  color: string;
  nickname: string;
  purchaseDate: string;
  tireManufacturer: string;
  tireModel: string;
  tireSize: string;
  modifications: string;
  bodyStyle: string;
  engineType: string;
  transmission: string;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ 
  isOpen, 
  onClose,
  betaRole = 'user' 
}) => {
  const [activeTab, setActiveTab] = useState('user');
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(33);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());
  
  // User information state
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    shirtSize: '',
    interests: [],
    bio: '',
    dreamCar: '',
    dreamExperience: '',
    spotifyPlaylistUrl: ''
  });

  // Vehicle information state
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    vin: '',
    make: '',
    model: '',
    year: currentYear.toString(),
    trim: '',
    color: '',
    nickname: '',
    purchaseDate: '',
    tireManufacturer: '',
    tireModel: '',
    tireSize: '',
    modifications: '',
    bodyStyle: '',
    engineType: '',
    transmission: ''
  });
  
  // States for VIN decoding and Spotify integration
  const [isDecodingVin, setIsDecodingVin] = useState(false);
  const [vinError, setVinError] = useState<string | null>(null);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<any[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);

  if (!isOpen) return null;
  
  // Handle VIN decoding
  const handleDecodeVin = async () => {
    if (!vehicleInfo.vin || vehicleInfo.vin.length !== 17) {
      setVinError('Please enter a valid 17-character VIN');
      return;
    }
    
    setIsDecodingVin(true);
    setVinError(null);
    
    try {
      const decodedInfo = await decodeVIN(vehicleInfo.vin);
      
      if (decodedInfo.error) {
        setVinError(decodedInfo.error);
      } else {
        // Update vehicle info with decoded data
        setVehicleInfo(prev => ({
          ...prev,
          make: decodedInfo.make || prev.make,
          model: decodedInfo.model || prev.model,
          year: decodedInfo.year || prev.year,
          trim: decodedInfo.trim || prev.trim
        }));
      }
    } catch (error) {
      setVinError('Error connecting to the VIN decoder service. Please try again.');
      console.error('VIN decoding error:', error);
    } finally {
      setIsDecodingVin(false);
    }
  };
  
  // Load Spotify playlists based on selected interests
  const handleLoadDrivingPlaylists = async () => {
    if (userInfo.interests.length === 0) {
      setSpotifyError('Select at least one driving interest to get playlist recommendations');
      return;
    }
    
    setIsLoadingPlaylists(true);
    setSpotifyError(null);
    
    try {
      // Use first interest as seed for recommendations
      const activity = interests.find(i => i.id === userInfo.interests[0])?.label || 'Driving';
      const playlists = await getPlaylistsByActivity(activity, 5);
      setSpotifyPlaylists(playlists);
      
      if (playlists.length === 0) {
        setSpotifyError('No driving playlists found. Try another interest or enter a URL manually.');
      }
    } catch (error) {
      setSpotifyError('Unable to connect to Spotify. You can still enter a playlist URL manually.');
      console.error('Spotify API error:', error);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const updateUserInfo = (field: keyof UserInfo, value: any) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    if (userInfo.interests.includes(interest)) {
      updateUserInfo('interests', userInfo.interests.filter(i => i !== interest));
    } else {
      updateUserInfo('interests', [...userInfo.interests, interest]);
    }
  };

  const updateVehicleInfo = (field: keyof VehicleInfo, value: string) => {
    setVehicleInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
      setProgress((step + 1) * 33);
      
      // Switch tabs based on step
      if (step === 1) setActiveTab('vehicle');
      if (step === 2) setActiveTab('review');
    } else {
      handleFinish();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setProgress((step - 1) * 33);
      
      // Switch tabs based on step
      if (step === 2) setActiveTab('user');
      if (step === 3) setActiveTab('vehicle');
    }
  };

  const handleFinish = () => {
    // Save all information to localStorage or send to API
    localStorage.setItem('paddock20_user_info', JSON.stringify(userInfo));
    localStorage.setItem('paddock20_vehicle', JSON.stringify(vehicleInfo));
    localStorage.setItem('paddock20_onboarding_completed', 'true');
    
    // Show success toast notification
    toast({
      title: "Profile Setup Complete",
      description: "Welcome to Paddock20! Redirecting to your dashboard...",
      variant: "default",
    });
    
    // Close the modal
    onClose();
    
    // Redirect to personalized dashboard after a short delay for the toast to be visible
    setTimeout(() => {
      // Redirect to the personalized dashboard page
      setLocation('/personalized-dashboard');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-gray-900 to-black border border-blue-900/40 rounded-lg max-w-4xl w-full md:w-4/5 p-6 relative mx-auto my-16 mt-20 mb-24 max-h-[80vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white" 
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-orbitron text-[#1982FC] mb-1">
            {step === 1 ? 'Driver Profile' : 
             step === 2 ? 'Vehicle Details' :
             'Complete Your Setup'}
          </h2>
          <p className="text-gray-300">
            {step === 1 ? 'Tell us about yourself so we can personalize your Paddock20 experience.' : 
             step === 2 ? 'Add your vehicle to unlock powerful features and insights.' :
             'Review your information and finish setup.'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 h-2 mb-6 rounded-full overflow-hidden">
          <div 
            className="bg-[#1982FC] h-full rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger 
              value="user" 
              onClick={() => setStep(1)} 
              className="data-[state=active]:bg-[#1982FC]"
            >
              <User className="w-4 h-4 mr-2" />
              Driver Info
            </TabsTrigger>
            <TabsTrigger 
              value="vehicle" 
              onClick={() => setStep(2)}
              className="data-[state=active]:bg-[#1982FC]"
            >
              <Car className="w-4 h-4 mr-2" />
              Vehicle
            </TabsTrigger>
            <TabsTrigger 
              value="review" 
              onClick={() => setStep(3)}
              className="data-[state=active]:bg-[#1982FC]"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Review
            </TabsTrigger>
          </TabsList>
          
          {/* User Information Tab */}
          <TabsContent value="user" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-200">First Name</Label>
                <Input 
                  id="firstName" 
                  value={userInfo.firstName}
                  onChange={(e) => updateUserInfo('firstName', e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                  placeholder="Your first name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-200">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={userInfo.lastName}
                  onChange={(e) => updateUserInfo('lastName', e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                  placeholder="Your last name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-gray-200">Nickname (Optional)</Label>
                <Input 
                  id="nickname" 
                  value={userInfo.nickname}
                  onChange={(e) => updateUserInfo('nickname', e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                  placeholder="What should we call you?"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => updateUserInfo('email', e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                  placeholder="Your email address"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-200">Beta Level</Label>
              <div className="p-3 bg-gray-800/50 rounded-md border border-gray-700">
                <p className="text-[#1982FC] font-medium">
                  {betaRole === 'tester' ? 'Beta Tester' : 'Beta User'}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {betaRole === 'tester' 
                    ? 'You\'ll receive early access to all features and help shape the future of Paddock20.' 
                    : 'You have access to all current beta features with regular updates.'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shirtSize" className="text-gray-200">T-Shirt Size (for swag)</Label>
              <Select 
                value={userInfo.shirtSize} 
                onValueChange={(value) => updateUserInfo('shirtSize', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select your size" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {shirtSizes.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-200">Automotive Interests (select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-800/50 p-3 rounded-md border border-gray-700">
                {interests.map((interest) => (
                  <div key={interest.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`interest-${interest.id}`}
                      checked={userInfo.interests.includes(interest.id)}
                      onCheckedChange={() => toggleInterest(interest.id)}
                      className="data-[state=checked]:bg-[#1982FC] data-[state=checked]:border-[#1982FC]"
                    />
                    <label
                      htmlFor={`interest-${interest.id}`}
                      className="text-sm text-gray-200 cursor-pointer"
                    >
                      {interest.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-200">Short Bio (Optional)</Label>
              <Textarea 
                id="bio"
                value={userInfo.bio}
                onChange={(e) => updateUserInfo('bio', e.target.value)}
                placeholder="Tell us about yourself and your automotive interests"
                className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dreamCar" className="text-gray-200">Dream Car</Label>
                <Input 
                  id="dreamCar" 
                  value={userInfo.dreamCar}
                  onChange={(e) => updateUserInfo('dreamCar', e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                  placeholder="Your ultimate dream vehicle"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dreamExperience" className="text-gray-200">Dream Automotive Experience</Label>
                <Input 
                  id="dreamExperience" 
                  value={userInfo.dreamExperience}
                  onChange={(e) => updateUserInfo('dreamExperience', e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                  placeholder="e.g., Nürburgring lap, Dakar Rally"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="spotifyPlaylistUrl" className="text-gray-200">Favorite Driving Playlist URL (Optional)</Label>
              <Input 
                id="spotifyPlaylistUrl" 
                value={userInfo.spotifyPlaylistUrl}
                onChange={(e) => updateUserInfo('spotifyPlaylistUrl', e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                placeholder="Spotify URL to your favorite driving playlist"
              />
              <p className="text-xs text-gray-400">We'll use this to enhance your Paddock20 experience with personalized audio</p>
            </div>
          </TabsContent>
          
          {/* Vehicle Information Tab */}
          <TabsContent value="vehicle" className="space-y-6">
            {/* VIN Decoder Section */}
            <div className="space-y-2">
              <Label htmlFor="vin" className="text-gray-200">VIN Decoder</Label>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex gap-2">
                  <Input 
                    id="vin" 
                    value={vehicleInfo.vin}
                    onChange={(e) => updateVehicleInfo('vin', e.target.value)}
                    className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white flex-1"
                    placeholder="Enter Vehicle Identification Number"
                  />
                  <Button 
                    type="button"
                    variant="secondary"
                    className="bg-[#1982FC] hover:bg-[#1982FC]/80 text-white shrink-0"
                    onClick={async () => {
                      if (vehicleInfo.vin && vehicleInfo.vin.length >= 17) {
                        try {
                          // Show loading toast
                          toast({
                            title: "Decoding VIN",
                            description: "Fetching vehicle information...",
                          });
                          
                          const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vehicleInfo.vin}?format=json`);
                          const data = await response.json();
                          
                          if (data.Results && data.Results.length > 0) {
                            const result = data.Results[0];
                            
                            // Update vehicle info with API results
                            setVehicleInfo(prev => ({
                              ...prev,
                              make: result.Make || prev.make,
                              model: result.Model || prev.model,
                              year: result.ModelYear || prev.year,
                              trim: result.Trim || prev.trim,
                              bodyStyle: result.BodyClass || prev.bodyStyle,
                              engineType: result.EngineConfiguration ? 
                                `${result.EngineConfiguration} ${result.EngineCylinders || ''} ${result.FuelTypePrimary || ''}` : 
                                prev.engineType,
                              transmission: result.TransmissionStyle || prev.transmission
                            }));
                            
                            toast({
                              title: "VIN Decoded Successfully",
                              description: `Found ${result.Make} ${result.Model} ${result.ModelYear}`,
                              variant: "default",
                            });
                          } else {
                            toast({
                              title: "VIN Decoding Error",
                              description: "Could not find vehicle details for this VIN",
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          console.error("VIN decoding error:", error);
                          toast({
                            title: "VIN Decoding Failed",
                            description: "There was a problem connecting to the VIN decoder service",
                            variant: "destructive",
                          });
                        }
                      } else {
                        toast({
                          title: "Invalid VIN",
                          description: "Please enter a valid 17-character VIN",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Decode
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Enter your complete 17-character VIN and click Decode to automatically fill vehicle details, or enter manually below
                </p>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700 mb-2">
              <h3 className="text-sm font-medium text-[#1982FC] mb-1">Manual Entry</h3>
              <p className="text-xs text-gray-400 mb-1">If you don't have your VIN or prefer to enter details manually, fill in the fields below</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make" className="text-gray-200">Make*</Label>
                <Select 
                  value={vehicleInfo.make} 
                  onValueChange={(value) => updateVehicleInfo('make', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-[200px] overflow-y-auto">
                    {carBrands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model" className="text-gray-200">Model*</Label>
                <Input 
                  id="model" 
                  value={vehicleInfo.model}
                  onChange={(e) => updateVehicleInfo('model', e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                  placeholder="e.g. Civic"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year" className="text-gray-200">Year*</Label>
                <Select 
                  value={vehicleInfo.year} 
                  onValueChange={(value) => updateVehicleInfo('year', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-[200px] overflow-y-auto">
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trim" className="text-gray-200">Trim</Label>
                <Input 
                  id="trim" 
                  value={vehicleInfo.trim}
                  onChange={(e) => updateVehicleInfo('trim', e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                  placeholder="e.g. Sport"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color" className="text-gray-200">Color</Label>
                <Input 
                  id="color" 
                  value={vehicleInfo.color}
                  onChange={(e) => updateVehicleInfo('color', e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                  placeholder="e.g. Blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-gray-200">Nickname</Label>
                <Input 
                  id="nickname" 
                  value={vehicleInfo.nickname}
                  onChange={(e) => updateVehicleInfo('nickname', e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                  placeholder="e.g. The Beast"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purchaseDate" className="text-gray-200">Purchase Date</Label>
                <Input 
                  id="purchaseDate" 
                  type="date"
                  value={vehicleInfo.purchaseDate}
                  onChange={(e) => updateVehicleInfo('purchaseDate', e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-white font-medium flex items-center space-x-2 mb-1">
                <span>Current Tires (Optional)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tireManufacturer" className="text-gray-200">Brand</Label>
                  <Select 
                    value={vehicleInfo.tireManufacturer} 
                    onValueChange={(value) => updateVehicleInfo('tireManufacturer', value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-[200px] overflow-y-auto">
                      {tireBrands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tireModel" className="text-gray-200">Model</Label>
                  <Input 
                    id="tireModel" 
                    value={vehicleInfo.tireModel}
                    onChange={(e) => updateVehicleInfo('tireModel', e.target.value)}
                    className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                    placeholder="e.g. Pilot Sport 4S"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tireSize" className="text-gray-200">Size</Label>
                  <Input 
                    id="tireSize" 
                    value={vehicleInfo.tireSize}
                    onChange={(e) => updateVehicleInfo('tireSize', e.target.value)}
                    className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                    placeholder="e.g. 225/45R17"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modifications" className="text-gray-200">Modifications (Optional)</Label>
              <Textarea 
                id="modifications"
                value={vehicleInfo.modifications}
                onChange={(e) => updateVehicleInfo('modifications', e.target.value)}
                placeholder="List any modifications to your vehicle"
                className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white min-h-[100px]"
              />
            </div>
          </TabsContent>
          
          {/* Review Tab */}
          <TabsContent value="review" className="space-y-6">
            <div className="space-y-6">
              <div className="bg-gray-900/70 border border-blue-900/30 rounded-lg p-4">
                <h3 className="text-lg font-medium text-[#1982FC] mb-3 flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Driver Information
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-gray-400 text-sm">Name:</span>
                    <p className="text-white">{userInfo.firstName} {userInfo.lastName}</p>
                  </div>
                  {userInfo.nickname && (
                    <div>
                      <span className="text-gray-400 text-sm">Nickname:</span>
                      <p className="text-white">{userInfo.nickname}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400 text-sm">Email:</span>
                    <p className="text-white">{userInfo.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Beta Status:</span>
                    <p className="text-white">{betaRole === 'tester' ? 'Beta Tester' : 'Beta User'}</p>
                  </div>
                  {userInfo.shirtSize && (
                    <div>
                      <span className="text-gray-400 text-sm">T-Shirt Size:</span>
                      <p className="text-white">{userInfo.shirtSize}</p>
                    </div>
                  )}
                  {userInfo.interests.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-gray-400 text-sm">Interests:</span>
                      <p className="text-white">
                        {userInfo.interests.map(id => 
                          interests.find(i => i.id === id)?.label
                        ).join(', ')}
                      </p>
                    </div>
                  )}
                  {userInfo.dreamCar && (
                    <div>
                      <span className="text-gray-400 text-sm">Dream Car:</span>
                      <p className="text-white">{userInfo.dreamCar}</p>
                    </div>
                  )}
                  {userInfo.dreamExperience && (
                    <div>
                      <span className="text-gray-400 text-sm">Dream Experience:</span>
                      <p className="text-white">{userInfo.dreamExperience}</p>
                    </div>
                  )}
                  {userInfo.spotifyPlaylistUrl && (
                    <div className="col-span-2">
                      <span className="text-gray-400 text-sm">Spotify Playlist:</span>
                      <p className="text-white">{userInfo.spotifyPlaylistUrl}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {vehicleInfo.make && vehicleInfo.model && (
                <div className="bg-gray-900/70 border border-blue-900/30 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-[#1982FC] mb-3 flex items-center">
                    <Car className="mr-2 h-5 w-5" />
                    Vehicle Information
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <span className="text-gray-400 text-sm">Make:</span>
                      <p className="text-white">{vehicleInfo.make}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Model:</span>
                      <p className="text-white">{vehicleInfo.model}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Year:</span>
                      <p className="text-white">{vehicleInfo.year}</p>
                    </div>
                    {vehicleInfo.trim && (
                      <div>
                        <span className="text-gray-400 text-sm">Trim:</span>
                        <p className="text-white">{vehicleInfo.trim}</p>
                      </div>
                    )}
                    {vehicleInfo.color && (
                      <div>
                        <span className="text-gray-400 text-sm">Color:</span>
                        <p className="text-white">{vehicleInfo.color}</p>
                      </div>
                    )}
                    {vehicleInfo.nickname && (
                      <div>
                        <span className="text-gray-400 text-sm">Nickname:</span>
                        <p className="text-white">{vehicleInfo.nickname}</p>
                      </div>
                    )}
                    {vehicleInfo.purchaseDate && (
                      <div>
                        <span className="text-gray-400 text-sm">Purchase Date:</span>
                        <p className="text-white">{vehicleInfo.purchaseDate}</p>
                      </div>
                    )}
                    {vehicleInfo.vin && (
                      <div className="col-span-2">
                        <span className="text-gray-400 text-sm">VIN:</span>
                        <p className="text-white">{vehicleInfo.vin}</p>
                      </div>
                    )}
                    {vehicleInfo.tireManufacturer && (
                      <div className="col-span-2">
                        <span className="text-gray-400 text-sm">Tires:</span>
                        <p className="text-white">
                          {vehicleInfo.tireManufacturer} {vehicleInfo.tireModel} {vehicleInfo.tireSize}
                        </p>
                      </div>
                    )}
                    {vehicleInfo.modifications && (
                      <div className="col-span-2">
                        <span className="text-gray-400 text-sm">Modifications:</span>
                        <p className="text-white whitespace-pre-line">{vehicleInfo.modifications}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gray-900/70 border border-blue-900/30 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">All Set!</h3>
              <p className="text-gray-300">
                You've completed your Paddock20 setup. Click "Finish" to enter your personalized automotive experience.
              </p>
              <p className="text-[#1982FC] mt-2 text-sm">
                You can edit this information anytime in your profile settings.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div></div>
          )}
          
          <Button 
            onClick={handleNextStep}
            className="bg-[#1982FC] hover:bg-[#1982FC]/80 text-white"
            disabled={step === 2 && (!vehicleInfo.make || !vehicleInfo.model || !vehicleInfo.year)}
          >
            {step === 3 ? (
              'Finish Setup'
            ) : (
              <>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;