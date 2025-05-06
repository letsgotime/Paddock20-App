import React, { useState } from 'react';
import { CornerDownRight, Thermometer, ArrowRight, Plus, Gauge, Trash2, Check, X } from 'lucide-react';
import TireTracker from './TireTracker';

// F1-style telemetry colors
const TELEMETRY_COLORS = {
  cold: '#3b82f6', // blue
  optimal: '#22c55e', // green
  hot: '#ef4444',   // red
  warning: '#f59e0b' // amber
};

function TireStatusIndicator({ status }) {
  const getStatusColor = () => {
    switch(status) {
      case 'new': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'worn': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor()}`}></div>
      <span className="capitalize">{status || 'Unknown'}</span>
    </div>
  );
}

function TireSetCard({ tire, onSelect, isSelected }) {
  if (!tire) return null;
  
  const wearPercentage = tire.currentMileage && tire.mileageLifeTarget 
    ? Math.min(100, Math.round((tire.currentMileage / tire.mileageLifeTarget) * 100))
    : 0;
  
  return (
    <div 
      className={`bg-gradient-to-r from-gray-900 to-black rounded-lg p-4 border ${
        isSelected ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-gray-700 hover:border-blue-500/50'
      } cursor-pointer transition-all`}
      onClick={() => onSelect(tire)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-white font-bold">{tire.brand} {tire.model}</h4>
          <p className="text-sm text-gray-400">{tire.type || 'All Season'}</p>
        </div>
        <TireStatusIndicator status={
          wearPercentage > 90 ? 'critical' :
          wearPercentage > 70 ? 'worn' :
          wearPercentage > 20 ? 'good' : 'new'
        } />
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Wear</span>
          <span>{wearPercentage}%</span>
        </div>
        <div className="bg-gray-700 h-2 w-full rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${
              wearPercentage > 90 ? 'bg-red-500' :
              wearPercentage > 70 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${wearPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-400">Size:</span>
          <span className="text-white ml-2">{tire.size || 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-400">Installed:</span>
          <span className="text-white ml-2">{tire.installDate || 'N/A'}</span>
        </div>
      </div>
      
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-gray-700 flex justify-end">
          <span className="text-green-400 text-sm flex items-center">
            Selected <Check size={14} className="ml-1" />
          </span>
        </div>
      )}
    </div>
  );
}

function TireAddForm({ onAdd, onCancel }) {
  const [newTire, setNewTire] = useState({
    brand: '',
    model: '',
    type: 'All Season',
    size: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    installDate: new Date().toISOString().split('T')[0],
    mileageLifeTarget: 50000,
    currentMileage: 0,
    lastTreadDepthCheck: new Date().toISOString().split('T')[0],
    treadDepth: 10, // in 32nds of an inch
    notes: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTire(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...newTire,
      id: Date.now(), // temporary ID for demo
      currentMileage: parseInt(newTire.currentMileage),
      mileageLifeTarget: parseInt(newTire.mileageLifeTarget),
      treadDepth: parseInt(newTire.treadDepth)
    });
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-blue-400 font-orbitron text-xl">Add New Tire Set</h3>
        <button 
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Brand</label>
            <input
              type="text"
              name="brand"
              value={newTire.brand}
              onChange={handleChange}
              className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
              placeholder="e.g. Michelin, Pirelli"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Model</label>
            <input
              type="text"
              name="model"
              value={newTire.model}
              onChange={handleChange}
              className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
              placeholder="e.g. Pilot Sport 4S"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Type</label>
            <select
              name="type"
              value={newTire.type}
              onChange={handleChange}
              className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
            >
              <option value="All Season">All Season</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
              <option value="Track">Track/Competition</option>
              <option value="All Terrain">All Terrain</option>
              <option value="Mud Terrain">Mud Terrain</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Size</label>
            <input
              type="text"
              name="size"
              value={newTire.size}
              onChange={handleChange}
              className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
              placeholder="e.g. 245/40R18"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Tread Depth (32nds)</label>
            <input
              type="number"
              name="treadDepth"
              value={newTire.treadDepth}
              onChange={handleChange}
              className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
              min="0"
              max="32"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Purchase Date</label>
            <input
              type="date"
              name="purchaseDate"
              value={newTire.purchaseDate}
              onChange={handleChange}
              className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Install Date</label>
            <input
              type="date"
              name="installDate"
              value={newTire.installDate}
              onChange={handleChange}
              className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Last Tread Check</label>
            <input
              type="date"
              name="lastTreadDepthCheck"
              value={newTire.lastTreadDepthCheck}
              onChange={handleChange}
              className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Expected Life (miles)</label>
            <input
              type="number"
              name="mileageLifeTarget"
              value={newTire.mileageLifeTarget}
              onChange={handleChange}
              className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
              min="0"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Current Mileage</label>
            <input
              type="number"
              name="currentMileage"
              value={newTire.currentMileage}
              onChange={handleChange}
              className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
              min="0"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-gray-300 text-sm mb-1">Notes</label>
          <textarea
            name="notes"
            value={newTire.notes}
            onChange={handleChange}
            className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
            rows="3"
            placeholder="Any special notes about these tires..."
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
          >
            Add Tire Set
          </button>
        </div>
      </form>
    </div>
  );
}

function TireTelemetry({ tireInfo }) {
  if (!tireInfo) return null;
  
  // Calculate remaining life percentage (inverted from wear percentage)
  const wearPercentage = tireInfo.currentMileage && tireInfo.mileageLifeTarget 
    ? Math.min(100, Math.round((tireInfo.currentMileage / tireInfo.mileageLifeTarget) * 100))
    : 0;
  
  const remainingLifePercentage = 100 - wearPercentage;
  
  // Get color based on remaining life
  const getLifeColor = (percentage) => {
    if (percentage > 70) return TELEMETRY_COLORS.optimal;
    if (percentage > 30) return TELEMETRY_COLORS.warning;
    return TELEMETRY_COLORS.hot;
  };
  
  // Simulated tire temperatures for demo
  const tireTemps = {
    frontLeft: { temp: 78, status: 'optimal' },
    frontRight: { temp: 83, status: 'hot' },
    rearLeft: { temp: 76, status: 'cold' },
    rearRight: { temp: 79, status: 'optimal' }
  };
  
  // Get temperature color
  const getTempColor = (status) => {
    return TELEMETRY_COLORS[status] || TELEMETRY_COLORS.optimal;
  };
  
  // Simulated tire pressures for demo (in PSI)
  const tirePressures = {
    frontLeft: { pressure: 32.5, status: 'optimal' },
    frontRight: { pressure: 31.8, status: 'optimal' },
    rearLeft: { pressure: 33.2, status: 'warning' },
    rearRight: { pressure: 32.0, status: 'optimal' }
  };
  
  return (
    <div className="space-y-6">
      {/* Overall tire health meter */}
      <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-blue-400 font-orbitron">TIRE LIFE TELEMETRY</h4>
          <div className="bg-black/30 px-3 py-1 rounded-full text-sm border border-gray-700">
            <span className="text-gray-400 mr-2">Remaining:</span>
            <span className="text-white font-mono">{remainingLifePercentage}%</span>
          </div>
        </div>
        
        <div className="h-8 bg-black border border-gray-800 rounded-full overflow-hidden relative">
          <div 
            className="h-full transition-all duration-500 ease-in-out"
            style={{ 
              width: `${remainingLifePercentage}%`, 
              background: `linear-gradient(90deg, ${getLifeColor(remainingLifePercentage)} 0%, ${getLifeColor(remainingLifePercentage)} 100%)` 
            }}
          ></div>
          
          {/* Markers for reference points */}
          <div className="absolute top-0 bottom-0 left-1/4 w-px bg-gray-700"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-700"></div>
          <div className="absolute top-0 bottom-0 left-3/4 w-px bg-gray-700"></div>
          
          {/* Percentage text at bottom of bar */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-gray-500 px-2">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
            <p className="text-xs text-gray-400 mb-1">ESTIMATED REMAINING</p>
            <p className="text-xl font-mono text-white">
              {tireInfo.mileageLifeTarget && tireInfo.currentMileage
                ? Math.max(0, tireInfo.mileageLifeTarget - tireInfo.currentMileage).toLocaleString()
                : 'N/A'} mi
            </p>
          </div>
          <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
            <p className="text-xs text-gray-400 mb-1">TREAD DEPTH</p>
            <p className="text-xl font-mono text-white">{tireInfo.treadDepth || 'N/A'}/32"</p>
          </div>
        </div>
      </div>
      
      {/* Tire temperature mapping */}
      <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-blue-400 font-orbitron">TEMPERATURE MAPPING</h4>
          <div className="flex items-center">
            <Thermometer size={16} className="text-blue-400 mr-1" />
            <span className="text-gray-400 text-sm">°F</span>
          </div>
        </div>
        
        <div className="relative h-48 mb-6">
          {/* Car outline */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-32 border-2 border-gray-700 rounded-xl"></div>
          </div>
          
          {/* Tire temperature indicators */}
          <div className="absolute top-6 left-12 transform -translate-x-full">
            <div className="w-16 h-8 rounded flex items-center justify-center" style={{ backgroundColor: getTempColor(tireTemps.frontLeft.status) }}>
              <span className="text-black font-medium">{tireTemps.frontLeft.temp}°</span>
            </div>
          </div>
          <div className="absolute top-6 right-12 transform translate-x-full">
            <div className="w-16 h-8 rounded flex items-center justify-center" style={{ backgroundColor: getTempColor(tireTemps.frontRight.status) }}>
              <span className="text-black font-medium">{tireTemps.frontRight.temp}°</span>
            </div>
          </div>
          <div className="absolute bottom-6 left-12 transform -translate-x-full">
            <div className="w-16 h-8 rounded flex items-center justify-center" style={{ backgroundColor: getTempColor(tireTemps.rearLeft.status) }}>
              <span className="text-black font-medium">{tireTemps.rearLeft.temp}°</span>
            </div>
          </div>
          <div className="absolute bottom-6 right-12 transform translate-x-full">
            <div className="w-16 h-8 rounded flex items-center justify-center" style={{ backgroundColor: getTempColor(tireTemps.rearRight.status) }}>
              <span className="text-black font-medium">{tireTemps.rearRight.temp}°</span>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: TELEMETRY_COLORS.cold }}></div>
            <span className="text-gray-300">Cold</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: TELEMETRY_COLORS.optimal }}></div>
            <span className="text-gray-300">Optimal</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: TELEMETRY_COLORS.hot }}></div>
            <span className="text-gray-300">Hot</span>
          </div>
        </div>
      </div>
      
      {/* Tire pressure mapping */}
      <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-blue-400 font-orbitron">PRESSURE MAPPING</h4>
          <div className="flex items-center">
            <Gauge size={16} className="text-blue-400 mr-1" />
            <span className="text-gray-400 text-sm">PSI</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 p-3 rounded-lg border border-gray-800 flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" 
                style={{ backgroundColor: getTempColor(tirePressures.frontLeft.status) }}>
              <span className="text-black font-bold text-sm">FL</span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Front Left</p>
              <p className="text-xl font-mono text-white">{tirePressures.frontLeft.pressure} PSI</p>
            </div>
          </div>
          <div className="bg-black/30 p-3 rounded-lg border border-gray-800 flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" 
                style={{ backgroundColor: getTempColor(tirePressures.frontRight.status) }}>
              <span className="text-black font-bold text-sm">FR</span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Front Right</p>
              <p className="text-xl font-mono text-white">{tirePressures.frontRight.pressure} PSI</p>
            </div>
          </div>
          <div className="bg-black/30 p-3 rounded-lg border border-gray-800 flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" 
                style={{ backgroundColor: getTempColor(tirePressures.rearLeft.status) }}>
              <span className="text-black font-bold text-sm">RL</span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Rear Left</p>
              <p className="text-xl font-mono text-white">{tirePressures.rearLeft.pressure} PSI</p>
            </div>
          </div>
          <div className="bg-black/30 p-3 rounded-lg border border-gray-800 flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" 
                style={{ backgroundColor: getTempColor(tirePressures.rearRight.status) }}>
              <span className="text-black font-bold text-sm">RR</span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Rear Right</p>
              <p className="text-xl font-mono text-white">{tirePressures.rearRight.pressure} PSI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TireManagementDashboard() {
  // Demo tire sets - in a real app, these would come from the database
  const [tireSets, setTireSets] = useState([
    {
      id: 1,
      brand: 'Michelin',
      model: 'Pilot Sport 4S',
      type: 'Summer',
      size: '245/40R18',
      purchaseDate: '2024-02-15',
      installDate: '2024-03-01',
      mileageLifeTarget: 30000,
      currentMileage: 3500,
      lastTreadDepthCheck: '2024-04-01',
      treadDepth: 10, // in 32nds of an inch
      notes: 'Performance summer tires installed for track days'
    },
    {
      id: 2,
      brand: 'Continental',
      model: 'ExtremeContact DWS06 Plus',
      type: 'All Season',
      size: '245/40R18',
      purchaseDate: '2023-10-10',
      installDate: '2023-11-01',
      mileageLifeTarget: 50000,
      currentMileage: 12500,
      lastTreadDepthCheck: '2024-03-15',
      treadDepth: 8,
      notes: 'All-season set for daily driving'
    }
  ]);
  
  // State for selected tire set and display mode
  const [selectedTireSet, setSelectedTireSet] = useState(tireSets[0]);
  const [isAddingTire, setIsAddingTire] = useState(false);
  const [activeTab, setActiveTab] = useState('telemetry'); // telemetry, history, or settings
  
  // Handle adding a new tire set
  const handleAddTireSet = (newTireSet) => {
    setTireSets([...tireSets, newTireSet]);
    setSelectedTireSet(newTireSet);
    setIsAddingTire(false);
  };
  
  // Toggle visibility of add tire form
  const toggleAddTireForm = () => {
    setIsAddingTire(!isAddingTire);
  };
  
  // Cancel adding a new tire
  const handleCancelAdd = () => {
    setIsAddingTire(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left sidebar - Tire sets */}
        <div className="md:w-1/3 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-blue-400 font-orbitron text-lg">Your Tire Sets</h3>
            <button 
              onClick={toggleAddTireForm}
              className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-lg flex items-center text-sm"
            >
              <Plus size={16} className="mr-1" /> Add Set
            </button>
          </div>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {tireSets.map(tire => (
              <TireSetCard 
                key={tire.id} 
                tire={tire} 
                onSelect={setSelectedTireSet} 
                isSelected={selectedTireSet?.id === tire.id} 
              />
            ))}
          </div>
        </div>
        
        {/* Main content area */}
        <div className="md:w-2/3">
          {isAddingTire ? (
            <TireAddForm 
              onAdd={handleAddTireSet}
              onCancel={handleCancelAdd}
            />
          ) : (
            <>
              {/* Tabs */}
              <div className="border-b border-gray-700 mb-6">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('telemetry')}
                    className={`px-4 py-2 border-b-2 text-sm font-medium ${
                      activeTab === 'telemetry' 
                        ? 'border-blue-500 text-blue-400' 
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Telemetry
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 border-b-2 text-sm font-medium ${
                      activeTab === 'history' 
                        ? 'border-green-500 text-green-400' 
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    History
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 border-b-2 text-sm font-medium ${
                      activeTab === 'settings' 
                        ? 'border-yellow-500 text-yellow-400' 
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Settings
                  </button>
                </div>
              </div>
              
              {/* Tab content */}
              {activeTab === 'telemetry' && (
                <TireTelemetry tireInfo={selectedTireSet} />
              )}
              
              {activeTab === 'history' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                    <h4 className="text-blue-400 font-orbitron mb-4">MAINTENANCE HISTORY</h4>
                    
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {/* Sample maintenance history items */}
                      <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
                        <div className="flex justify-between">
                          <span className="text-white font-medium">Rotation</span>
                          <span className="text-gray-400 text-sm">April 10, 2024</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">
                          Cross-rotated front to rear at 3,500 miles.
                        </p>
                      </div>
                      
                      <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
                        <div className="flex justify-between">
                          <span className="text-white font-medium">Pressure Check</span>
                          <span className="text-gray-400 text-sm">March 15, 2024</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">
                          Adjusted all tire pressures to 32 PSI cold.
                        </p>
                      </div>
                      
                      <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
                        <div className="flex justify-between">
                          <span className="text-white font-medium">Installation</span>
                          <span className="text-gray-400 text-sm">March 1, 2024</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">
                          New tires installed and balanced.
                        </p>
                      </div>
                    </div>
                    
                    <button className="mt-4 flex items-center text-blue-400 hover:text-blue-300 text-sm">
                      <Plus size={16} className="mr-1" /> Add Maintenance Record
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                    <h4 className="text-blue-400 font-orbitron mb-4">TREAD DEPTH TRACKING</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                      <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
                        <div className="text-xs text-gray-400 mb-1">FRONT LEFT</div>
                        <div className="text-xl font-mono text-white">10/32"</div>
                      </div>
                      <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
                        <div className="text-xs text-gray-400 mb-1">FRONT RIGHT</div>
                        <div className="text-xl font-mono text-white">9/32"</div>
                      </div>
                      <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
                        <div className="text-xs text-gray-400 mb-1">REAR LEFT</div>
                        <div className="text-xl font-mono text-white">10/32"</div>
                      </div>
                      <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
                        <div className="text-xs text-gray-400 mb-1">REAR RIGHT</div>
                        <div className="text-xl font-mono text-white">9/32"</div>
                      </div>
                    </div>
                    
                    <button className="mt-4 flex items-center text-blue-400 hover:text-blue-300 text-sm">
                      <Plus size={16} className="mr-1" /> Update Tread Measurements
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                    <h4 className="text-blue-400 font-orbitron mb-4">TIRE SETTINGS</h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">Optimal Tire Pressure (PSI)</label>
                          <input
                            type="number"
                            defaultValue="32"
                            className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">Rotation Interval (miles)</label>
                          <input
                            type="number"
                            defaultValue="5000"
                            className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">Minimum Tread Depth Warning (32nds)</label>
                          <input
                            type="number"
                            defaultValue="4"
                            className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">Tread Check Interval (miles)</label>
                          <input
                            type="number"
                            defaultValue="3000"
                            className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Tire Rotation Pattern</label>
                        <select
                          className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
                          defaultValue="cross"
                        >
                          <option value="cross">Cross (Front to opposite rear)</option>
                          <option value="forward">Forward (Back to front)</option>
                          <option value="directional">Directional (Same side)</option>
                          <option value="xpattern">X-Pattern (Cross both ways)</option>
                        </select>
                      </div>
                      
                      <div className="pt-4 flex justify-end">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
                          Save Settings
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg border border-gray-800">
                    <h4 className="text-blue-400 font-orbitron mb-4">DANGER ZONE</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-red-900/20 border border-red-900/30 p-4 rounded-lg">
                        <div>
                          <h5 className="text-white font-medium">Delete This Tire Set</h5>
                          <p className="text-gray-400 text-sm">
                            This action cannot be undone. All tire data will be permanently deleted.
                          </p>
                        </div>
                        <button className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center text-sm">
                          <Trash2 size={16} className="mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TireManagementDashboard;