import React, { useState } from 'react';
import { Sun, Shield, Droplets, Camera, Calendar, Upload, Maximize2, Download } from 'lucide-react';

/**
 * GlossTracker Component
 * Track and monitor vehicle paint gloss readings over time
 */
const GlossTracker = ({ vehicle }) => {
  const [selectedSection, setSelectedSection] = useState('hood');
  
  // Empty state data
  const glossData = {
    readings: [],
    lastReading: null,
    sections: {
      hood: { name: 'Hood', reading: 0, lastUpdated: null },
      roof: { name: 'Roof', reading: 0, lastUpdated: null },
      trunk: { name: 'Trunk', reading: 0, lastUpdated: null },
      driverDoor: { name: 'Driver Door', reading: 0, lastUpdated: null },
      passengerDoor: { name: 'Passenger Door', reading: 0, lastUpdated: null },
      driverRear: { name: 'Driver Rear', reading: 0, lastUpdated: null },
      passengerRear: { name: 'Passenger Rear', reading: 0, lastUpdated: null }
    },
    average: 0
  };

  // Sections list for rendering
  const sections = [
    { id: 'hood', name: 'Hood' },
    { id: 'roof', name: 'Roof' },
    { id: 'trunk', name: 'Trunk' },
    { id: 'driverDoor', name: 'Driver Door' },
    { id: 'passengerDoor', name: 'Passenger Door' },
    { id: 'driverRear', name: 'Driver Rear' },
    { id: 'passengerRear', name: 'Passenger Rear' }
  ];
  
  const renderCarDiagram = () => (
    <div className="relative w-full max-w-md mx-auto h-64 bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Car outline - simplified representation */}
      <svg viewBox="0 0 400 200" className="w-full h-full">
        <path 
          d="M50,100 L100,50 L300,50 L350,100 L350,150 L300,180 L100,180 L50,150 Z" 
          fill="#1f2937" 
          stroke="#374151" 
          strokeWidth="2"
        />
        
        {/* Hood - clickable section */}
        <path 
          d="M100,50 L300,50 L275,80 L125,80 Z" 
          fill={selectedSection === 'hood' ? '#3b82f6' : '#111827'} 
          stroke="#374151" 
          strokeWidth="1" 
          onClick={() => setSelectedSection('hood')}
          className="cursor-pointer hover:fill-blue-700"
        />
        
        {/* Roof */}
        <path 
          d="M125,80 L275,80 L265,110 L135,110 Z" 
          fill={selectedSection === 'roof' ? '#3b82f6' : '#111827'} 
          stroke="#374151" 
          strokeWidth="1"
          onClick={() => setSelectedSection('roof')}
          className="cursor-pointer hover:fill-blue-700"
        />
        
        {/* Trunk */}
        <path 
          d="M135,110 L265,110 L300,180 L100,180 Z" 
          fill={selectedSection === 'trunk' ? '#3b82f6' : '#111827'} 
          stroke="#374151" 
          strokeWidth="1"
          onClick={() => setSelectedSection('trunk')}
          className="cursor-pointer hover:fill-blue-700"
        />
        
        {/* Driver Door */}
        <path 
          d="M50,100 L125,80 L135,110 L100,180 L50,150 Z" 
          fill={selectedSection === 'driverDoor' ? '#3b82f6' : '#111827'} 
          stroke="#374151" 
          strokeWidth="1"
          onClick={() => setSelectedSection('driverDoor')}
          className="cursor-pointer hover:fill-blue-700"
        />
        
        {/* Passenger Door */}
        <path 
          d="M275,80 L350,100 L350,150 L300,180 L265,110 Z" 
          fill={selectedSection === 'passengerDoor' ? '#3b82f6' : '#111827'} 
          stroke="#374151" 
          strokeWidth="1"
          onClick={() => setSelectedSection('passengerDoor')}
          className="cursor-pointer hover:fill-blue-700"
        />
      </svg>
      
      {/* Section name overlay */}
      <div className="absolute bottom-3 right-3 bg-black/70 px-3 py-1 rounded-md">
        <span className="text-blue-400 font-medium">{glossData.sections[selectedSection].name}</span>
      </div>
    </div>
  );
  
  return (
    <div className="gloss-tracker">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-blue-400 font-orbitron text-xl">Gloss Measurement Tracker</h2>
        <div className="flex gap-2">
          <button className="text-xs bg-blue-900/40 text-blue-400 py-1 px-3 rounded-md flex items-center">
            <Camera className="h-3.5 w-3.5 mr-1" />
            Add Reading
          </button>
          <button className="text-xs bg-gray-800 text-gray-400 py-1 px-3 rounded-md flex items-center">
            <Download className="h-3.5 w-3.5 mr-1" />
            Export
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Current Gloss Section */}
        <div className="bg-gray-900/50 rounded-xl p-5 border border-blue-500/10">
          <h3 className="text-gray-300 font-medium mb-4">Current Gloss Index</h3>
          
          {glossData.average > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Overall Average</span>
                <span className={`text-xl font-bold ${
                  glossData.average >= 90 ? 'text-green-500' : 
                  glossData.average >= 70 ? 'text-blue-500' : 
                  glossData.average >= 50 ? 'text-yellow-500' : 'text-red-500'
                }`}>{glossData.average}%</span>
              </div>
              
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${
                  glossData.average >= 90 ? 'bg-green-500' : 
                  glossData.average >= 70 ? 'bg-blue-500' : 
                  glossData.average >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`} style={{ width: `${glossData.average}%` }}></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-black/40 p-3 rounded border border-gray-800">
                  <div className="text-gray-400 text-xs mb-1">Last Reading</div>
                  <div className="text-white">{glossData.lastReading ? new Date(glossData.lastReading).toLocaleDateString() : 'Never'}</div>
                </div>
                
                <div className="bg-black/40 p-3 rounded border border-gray-800">
                  <div className="text-gray-400 text-xs mb-1">Highest Section</div>
                  <div className="text-white">{Object.values(glossData.sections).reduce((max, section) => section.reading > max.reading ? section : max, { reading: 0, name: 'None' }).name}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-gray-300 text-lg mb-2">No Gloss Data</h3>
              <p className="text-gray-500 text-sm mb-4">Track your vehicle's paint gloss level over time</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm flex items-center mx-auto">
                <Camera className="h-4 w-4 mr-2" />
                Start Measuring
              </button>
            </div>
          )}
        </div>
        
        {/* Car Diagram Section */}
        <div className="bg-gray-900/50 rounded-xl p-5 border border-blue-500/10">
          <h3 className="text-gray-300 font-medium mb-4">Vehicle Diagram</h3>
          {renderCarDiagram()}
          
          {/* Section information */}
          <div className="mt-4 p-3 bg-black/40 rounded border border-gray-800">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Selected: {glossData.sections[selectedSection].name}</span>
              <span className={`text-lg font-bold ${
                glossData.sections[selectedSection].reading >= 90 ? 'text-green-500' : 
                glossData.sections[selectedSection].reading >= 70 ? 'text-blue-500' : 
                glossData.sections[selectedSection].reading >= 50 ? 'text-yellow-500' : 'text-gray-500'
              }`}>{glossData.sections[selectedSection].reading > 0 ? `${glossData.sections[selectedSection].reading}%` : 'No Data'}</span>
            </div>
            {glossData.sections[selectedSection].lastUpdated && (
              <div className="text-xs text-gray-500 mt-1">
                Last updated: {new Date(glossData.sections[selectedSection].lastUpdated).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Section Breakdown */}
      <div className="bg-gray-900/50 rounded-xl p-5 border border-blue-500/10 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-300 font-medium">Section Breakdown</h3>
          <div className="flex items-center text-xs text-gray-400">
            <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-1"></span> Excellent
            <span className="w-3 h-3 bg-blue-500 rounded-full inline-block ml-3 mr-1"></span> Good
            <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block ml-3 mr-1"></span> Fair
            <span className="w-3 h-3 bg-red-500 rounded-full inline-block ml-3 mr-1"></span> Poor
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sections.map(section => (
            <div 
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className={`p-3 rounded cursor-pointer transition-colors ${
                selectedSection === section.id ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-black/40 border border-gray-800 hover:border-blue-500/20'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-300">{section.name}</span>
                {glossData.sections[section.id].reading > 0 && (
                  <span className={`h-2 w-2 rounded-full ${
                    glossData.sections[section.id].reading >= 90 ? 'bg-green-500' : 
                    glossData.sections[section.id].reading >= 70 ? 'bg-blue-500' : 
                    glossData.sections[section.id].reading >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></span>
                )}
              </div>
              <div className="text-lg font-medium mt-1">
                {glossData.sections[section.id].reading > 0 ? (
                  <span className={
                    glossData.sections[section.id].reading >= 90 ? 'text-green-500' : 
                    glossData.sections[section.id].reading >= 70 ? 'text-blue-500' : 
                    glossData.sections[section.id].reading >= 50 ? 'text-yellow-500' : 'text-red-500'
                  }>{glossData.sections[section.id].reading}%</span>
                ) : (
                  <span className="text-gray-600">--</span>
                )}
              </div>
              {glossData.sections[section.id].lastUpdated ? (
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(glossData.sections[section.id].lastUpdated).toLocaleDateString()}
                </div>
              ) : (
                <div className="text-xs text-gray-600 mt-1">No readings</div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Action Section */}
      <div className="bg-gray-900/50 rounded-xl p-5 border border-blue-500/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/40 p-4 rounded border border-gray-800 flex flex-col items-center text-center">
            <Sun className="h-8 w-8 text-yellow-500 mb-2" />
            <h4 className="text-gray-300 font-medium mb-1">Log Sun Exposure</h4>
            <p className="text-gray-500 text-sm mb-3">Track how much sunlight your paint is exposed to</p>
            <button className="bg-yellow-600/80 hover:bg-yellow-600 text-white py-1.5 px-3 rounded-md text-sm mt-auto">
              Record Exposure
            </button>
          </div>
          
          <div className="bg-black/40 p-4 rounded border border-gray-800 flex flex-col items-center text-center">
            <Calendar className="h-8 w-8 text-blue-500 mb-2" />
            <h4 className="text-gray-300 font-medium mb-1">Schedule Polish</h4>
            <p className="text-gray-500 text-sm mb-3">Schedule your next paint correction/polish service</p>
            <button className="bg-blue-600/80 hover:bg-blue-600 text-white py-1.5 px-3 rounded-md text-sm mt-auto">
              Set Reminder
            </button>
          </div>
          
          <div className="bg-black/40 p-4 rounded border border-gray-800 flex flex-col items-center text-center">
            <Droplets className="h-8 w-8 text-green-500 mb-2" />
            <h4 className="text-gray-300 font-medium mb-1">Protection Status</h4>
            <p className="text-gray-500 text-sm mb-3">Add or update your paint protection products</p>
            <button className="bg-green-600/80 hover:bg-green-600 text-white py-1.5 px-3 rounded-md text-sm mt-auto">
              Update Protection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlossTracker;