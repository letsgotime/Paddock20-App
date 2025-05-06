import React, { useState } from 'react';
import { X, Car, Info, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  betaRole?: 'user' | 'tester';
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, betaRole = 'user' }) => {
  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState({
    make: '',
    model: '',
    year: currentYear.toString(),
    trim: '',
    color: '',
    nickname: ''
  });

  if (!isOpen) return null;

  const updateVehicle = (field: string, value: string) => {
    setVehicle(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    // Save vehicle info and complete onboarding
    localStorage.setItem('paddock20_onboarding_completed', 'true');
    localStorage.setItem('paddock20_vehicle', JSON.stringify(vehicle));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-gray-900 to-black border border-blue-900/40 rounded-lg max-w-2xl w-full md:w-3/4 lg:w-2/3 p-6 relative mx-auto my-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white" 
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-orbitron text-[#1982FC] mb-1">
            {step === 1 ? 'Welcome to Your Garage' : 
             step === 2 ? 'Tell Us About Your Vehicle' :
             'Almost Ready!'}
          </h2>
          <p className="text-gray-300">
            {step === 1 ? 'Let\'s set up your first vehicle to get started.' : 
             step === 2 ? 'Enter your vehicle details below.' :
             'Just a few more details and you\'re ready to go!'}
          </p>
        </div>
        
        <div className="space-y-6">
          {step === 1 && (
            <div className="bg-gray-900/70 border border-blue-900/30 rounded-lg p-5">
              <div className="flex items-center justify-center mb-6">
                <Car className="h-16 w-16 text-[#1982FC]" />
              </div>
              <h3 className="text-lg font-medium text-[#1982FC] mb-3 text-center">Your Garage Vault</h3>
              <p className="text-gray-300 text-center mb-4">
                Track vehicles, maintenance records, and performance in your personal garage.
              </p>
              <p className="text-gray-400 text-sm text-center mb-6">
                Let's add your first vehicle to get started.
              </p>
              <Button 
                onClick={handleNextStep}
                className="w-full bg-[#1982FC] hover:bg-[#1982FC]/80 text-white"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Vehicle
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make" className="text-gray-200">Make</Label>
                  <Input 
                    id="make" 
                    value={vehicle.make}
                    onChange={(e) => updateVehicle('make', e.target.value)}
                    className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                    placeholder="e.g. Honda"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-gray-200">Model</Label>
                  <Input 
                    id="model" 
                    value={vehicle.model}
                    onChange={(e) => updateVehicle('model', e.target.value)}
                    className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                    placeholder="e.g. Civic"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-gray-200">Year</Label>
                  <Select 
                    value={vehicle.year} 
                    onValueChange={(value) => updateVehicle('year', value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trim" className="text-gray-200">Trim (Optional)</Label>
                  <Input 
                    id="trim" 
                    value={vehicle.trim}
                    onChange={(e) => updateVehicle('trim', e.target.value)}
                    className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                    placeholder="e.g. Sport"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color" className="text-gray-200">Color (Optional)</Label>
                  <Input 
                    id="color" 
                    value={vehicle.color}
                    onChange={(e) => updateVehicle('color', e.target.value)}
                    className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                    placeholder="e.g. Blue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nickname" className="text-gray-200">Nickname (Optional)</Label>
                  <Input 
                    id="nickname" 
                    value={vehicle.nickname}
                    onChange={(e) => updateVehicle('nickname', e.target.value)}
                    className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                    placeholder="e.g. The Beast"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-gray-900/70 border border-blue-900/30 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Info className="h-5 w-5 text-[#1982FC] flex-shrink-0" />
                  <h3 className="text-lg font-medium text-[#1982FC]">Your Beta Status</h3>
                </div>
                <p className="text-gray-300 pl-8">
                  {betaRole === 'tester' 
                    ? 'You\'re enrolled as a Beta Tester with premium access to all features and priority support.'
                    : 'You\'re enrolled as a Beta User with access to all current beta features.'}
                </p>
              </div>
              
              {vehicle.make && vehicle.model && (
                <div className="bg-gray-900/70 border border-blue-900/30 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-[#1982FC] mb-3">Vehicle Summary</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <span className="text-gray-400 text-sm">Make:</span>
                      <p className="text-white">{vehicle.make}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Model:</span>
                      <p className="text-white">{vehicle.model}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Year:</span>
                      <p className="text-white">{vehicle.year}</p>
                    </div>
                    {vehicle.trim && (
                      <div>
                        <span className="text-gray-400 text-sm">Trim:</span>
                        <p className="text-white">{vehicle.trim}</p>
                      </div>
                    )}
                    {vehicle.color && (
                      <div>
                        <span className="text-gray-400 text-sm">Color:</span>
                        <p className="text-white">{vehicle.color}</p>
                      </div>
                    )}
                    {vehicle.nickname && (
                      <div>
                        <span className="text-gray-400 text-sm">Nickname:</span>
                        <p className="text-white">{vehicle.nickname}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between pt-4">
            {step > 1 ? (
              <Button 
                variant="outline" 
                onClick={handlePrevStep}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Back
              </Button>
            ) : (
              <div></div> // Empty div for flex spacing
            )}
            
            <Button 
              onClick={handleNextStep}
              className="bg-[#1982FC] hover:bg-[#1982FC]/80 text-white"
              disabled={step === 2 && (!vehicle.make || !vehicle.model || !vehicle.year)}
            >
              {step === 3 ? 'Complete Setup' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;