import React from 'react';

interface DrivingModeSelectorProps {
  selectedMode: string;
  onModeChange: (mode: string) => void;
  vehicleType: string;
}

interface DrivingMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  vehicleTypes: string[];
  torqueAdjustment: number;
  throttleResponse: string;
  suspensionSetting: string;
  tractionControl: string;
  idealConditions: string;
}

const DrivingModeSelector: React.FC<DrivingModeSelectorProps> = ({
  selectedMode,
  onModeChange,
  vehicleType
}) => {
  // Driving modes database
  const drivingModes: DrivingMode[] = [
    {
      id: 'comfort',
      name: 'Comfort',
      description: 'Optimized for smooth, refined driving with softer suspension settings and progressive throttle response.',
      icon: '🛋️',
      color: 'bg-emerald-900',
      vehicleTypes: ['Luxury', 'SUV', 'Sedan', 'All'],
      torqueAdjustment: -15,
      throttleResponse: 'Progressive',
      suspensionSetting: 'Soft',
      tractionControl: 'Full',
      idealConditions: 'Daily driving, passengers, poor road conditions'
    },
    {
      id: 'eco',
      name: 'Eco',
      description: 'Maximizes fuel efficiency with dulled throttle response and early upshifts to reduce consumption.',
      icon: '🌱',
      color: 'bg-green-900',
      vehicleTypes: ['Hybrid', 'Economy', 'SUV', 'Sedan', 'All'],
      torqueAdjustment: -25,
      throttleResponse: 'Dulled',
      suspensionSetting: 'Standard',
      tractionControl: 'Full',
      idealConditions: 'Highway cruising, city driving, maximizing range'
    },
    {
      id: 'sport',
      name: 'Sport',
      description: 'Enhanced throttle response, firmer suspension, and more aggressive shift patterns for spirited driving.',
      icon: '🏎️',
      color: 'bg-blue-900',
      vehicleTypes: ['Sports', 'Sedan', 'Coupe', 'All'],
      torqueAdjustment: 10,
      throttleResponse: 'Sharp',
      suspensionSetting: 'Firm',
      tractionControl: 'Reduced',
      idealConditions: 'Winding roads, spirited driving, dry conditions'
    },
    {
      id: 'sport-plus',
      name: 'Sport+',
      description: 'Maximum performance with track-oriented suspension, immediate throttle response and minimal driver aids.',
      icon: '⚡',
      color: 'bg-purple-900',
      vehicleTypes: ['Sports', 'Supercar', 'Hypercar'],
      torqueAdjustment: 20,
      throttleResponse: 'Immediate',
      suspensionSetting: 'Track',
      tractionControl: 'Minimal',
      idealConditions: 'Track use, performance driving, ideal conditions'
    },
    {
      id: 'track',
      name: 'Track',
      description: 'Full performance mode with race-tuned settings, launch control and optimized for lap times.',
      icon: '🏁',
      color: 'bg-red-900',
      vehicleTypes: ['Supercar', 'Hypercar', 'Race'],
      torqueAdjustment: 25,
      throttleResponse: 'Race',
      suspensionSetting: 'Race',
      tractionControl: 'Competition',
      idealConditions: 'Race track use only, professional drivers'
    },
    {
      id: 'individual',
      name: 'Individual',
      description: 'Custom settings configured to your exact preferences and driving style.',
      icon: '⚙️',
      color: 'bg-amber-900',
      vehicleTypes: ['All'],
      torqueAdjustment: 0,
      throttleResponse: 'Custom',
      suspensionSetting: 'Custom',
      tractionControl: 'Custom',
      idealConditions: 'Custom driving experience'
    },
    {
      id: 'wet',
      name: 'Wet',
      description: 'Optimized for slippery conditions with dulled throttle response and maximum traction control.',
      icon: '💧',
      color: 'bg-cyan-900',
      vehicleTypes: ['All'],
      torqueAdjustment: -20,
      throttleResponse: 'Dampened',
      suspensionSetting: 'Comfort',
      tractionControl: 'Maximum',
      idealConditions: 'Rain, snow, slippery surfaces'
    }
  ];
  
  // Filter modes based on vehicle type
  const compatibleModes = drivingModes.filter(mode => 
    mode.vehicleTypes.includes(vehicleType) || mode.vehicleTypes.includes('All')
  );
  
  // Find selected mode details
  const selectedModeDetails = drivingModes.find(mode => mode.id === selectedMode) || drivingModes[0];
  
  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <h3 className="text-blue-400 font-medium text-lg mb-4">Driving Mode</h3>
      
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 mb-4">
        {compatibleModes.map(mode => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`p-3 rounded-lg text-center transition-all ${
              selectedMode === mode.id 
                ? `${mode.color} border-2 border-blue-400 shadow-lg` 
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <div className="text-2xl mb-1">{mode.icon}</div>
            <div className={`text-sm font-medium ${
              selectedMode === mode.id ? 'text-white' : 'text-gray-300'
            }`}>
              {mode.name}
            </div>
          </button>
        ))}
      </div>
      
      <div className={`${selectedModeDetails.color} p-4 rounded-lg`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{selectedModeDetails.icon}</span>
            <h4 className="text-white text-lg font-semibold">{selectedModeDetails.name} Mode</h4>
          </div>
          <div className="bg-black bg-opacity-30 px-3 py-1 rounded-full text-xs text-white">
            {selectedModeDetails.vehicleTypes.includes(vehicleType) ? 'Optimized' : 'Compatible'}
          </div>
        </div>
        
        <p className="text-white text-sm mb-4">{selectedModeDetails.description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-black bg-opacity-30 p-2 rounded">
            <div className="text-gray-300 mb-1">Torque</div>
            <div className="text-white font-medium">
              {selectedModeDetails.torqueAdjustment > 0 ? '+' : ''}
              {selectedModeDetails.torqueAdjustment}%
            </div>
          </div>
          
          <div className="bg-black bg-opacity-30 p-2 rounded">
            <div className="text-gray-300 mb-1">Throttle</div>
            <div className="text-white font-medium">{selectedModeDetails.throttleResponse}</div>
          </div>
          
          <div className="bg-black bg-opacity-30 p-2 rounded">
            <div className="text-gray-300 mb-1">Suspension</div>
            <div className="text-white font-medium">{selectedModeDetails.suspensionSetting}</div>
          </div>
          
          <div className="bg-black bg-opacity-30 p-2 rounded">
            <div className="text-gray-300 mb-1">Traction</div>
            <div className="text-white font-medium">{selectedModeDetails.tractionControl}</div>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-white bg-black bg-opacity-30 p-2 rounded">
          <span className="text-gray-300">Optimal for:</span> {selectedModeDetails.idealConditions}
        </div>
      </div>
    </div>
  );
};

export default DrivingModeSelector;