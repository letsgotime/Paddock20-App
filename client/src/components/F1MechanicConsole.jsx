import React, { useState } from 'react';
import {
  Gauge,
  Wrench,
  ArrowRight,
  ChevronRight,
  RotateCw,
  CheckCircle,
  Timer,
  BarChart4,
  Upload,
  FileImage,
  FileVideo,
  FileText,
  FileAudio,
  Car,
  Thermometer,
  BadgeAlert,
  ArrowUpDown,
  History,
  Calendar,
  GaugeCircle,
  Shield,
  Users,
  Maximize,
  Copy,
  Plus,
  Plane,
  Tv,
  Badge
} from 'lucide-react';

// F1-style telemetry colors
const TELEMETRY_COLORS = {
  cold: '#3b82f6', // blue
  optimal: '#22c55e', // green
  hot: '#ef4444',   // red
  warning: '#f59e0b', // amber
  neutral: '#6b7280' // gray
};

const F1MechanicConsole = ({ vehicle, compact = false }) => {
  const [activeTab, setActiveTab] = useState('torque');
  const [expandedSection, setExpandedSection] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  
  // Torque specifications - sample data
  const torqueSpecs = {
    wheelLugNuts: {
      spec: '95-100',
      unit: 'ft-lb',
      lastChecked: '2025-04-28',
      status: 'optimal'
    },
    caliper: {
      spec: '85',
      unit: 'ft-lb',
      lastChecked: '2025-04-15',
      status: 'needs-check'
    },
    cylinderHeadBolts: {
      spec: '65-70',
      unit: 'ft-lb',
      lastChecked: '2025-01-10',
      status: 'optimal'
    },
    sparkPlugs: {
      spec: '18-22',
      unit: 'ft-lb',
      lastChecked: '2025-03-01',
      status: 'needs-check'
    },
    oilDrainPlug: {
      spec: '30',
      unit: 'ft-lb',
      lastChecked: '2025-04-02',
      status: 'optimal'
    }
  };
  
  // Tire pressure specifications - sample data
  const tirePressureSpecs = {
    frontLeft: {
      current: 32.5,
      recommended: 33,
      unit: 'psi',
      status: 'optimal',
      lastChecked: '2025-05-01'
    },
    frontRight: {
      current: 31.8,
      recommended: 33,
      unit: 'psi',
      status: 'warning',
      lastChecked: '2025-05-01'
    },
    rearLeft: {
      current: 35.2,
      recommended: 35,
      unit: 'psi',
      status: 'optimal',
      lastChecked: '2025-05-01'
    },
    rearRight: {
      current: 34.7,
      recommended: 35,
      unit: 'psi',
      status: 'optimal',
      lastChecked: '2025-05-01'
    }
  };
  
  // Maintenance records - sample data
  const maintenanceRecords = [
    {
      id: 1,
      type: 'Tire Rotation',
      date: '2025-04-15',
      mileage: 25430,
      technician: 'Self',
      notes: 'Rotated tires front to back, cross-pattern',
      media: ['tire-rotation.jpg']
    },
    {
      id: 2,
      type: 'Oil Change',
      date: '2025-04-02',
      mileage: 24950,
      technician: 'QuickLube',
      notes: 'Used 5W-30 synthetic, new filter',
      media: ['oil-change.jpg', 'receipt.pdf']
    },
    {
      id: 3,
      type: 'Brake Inspection',
      date: '2025-03-18',
      mileage: 24500,
      technician: 'Self',
      notes: 'Front pads at 60%, rear at 75%. Rotors good condition.',
      media: ['brake-pads-front.jpg', 'brake-inspection.mp4']
    }
  ];
  
  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'optimal': return TELEMETRY_COLORS.optimal;
      case 'warning': return TELEMETRY_COLORS.warning;
      case 'critical': return TELEMETRY_COLORS.hot;
      case 'cold': return TELEMETRY_COLORS.cold;
      case 'needs-check': return TELEMETRY_COLORS.warning;
      default: return TELEMETRY_COLORS.neutral;
    }
  };
  
  // Calculate pressure variance
  const getPressureVariance = (current, recommended) => {
    const difference = current - recommended;
    return difference.toFixed(1);
  };
  
  // Handling media upload
  const handleUpload = (type) => {
    setIsUploading(true);
    // Simulate file selection dialog
    setTimeout(() => {
      // Simulate upload completion
      const newFile = {
        id: Date.now(),
        name: `${type}-${Date.now()}.${type === 'image' ? 'jpg' : type === 'video' ? 'mp4' : type === 'audio' ? 'mp3' : 'pdf'}`,
        type: type,
        date: new Date().toISOString().split('T')[0]
      };
      
      setMediaFiles(prev => [...prev, newFile]);
      setIsUploading(false);
    }, 1500);
  };
  
  // Toggle expanded section
  const toggleExpand = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  const renderTorqueSpecs = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-blue-400 font-orbitron text-sm uppercase">Torque Specifications</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Ft-Lb</span>
            <Wrench size={16} className="text-blue-400" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(torqueSpecs).map(([key, spec]) => (
            <div 
              key={key} 
              className="bg-black/30 border border-gray-800 rounded-md p-3 hover:border-blue-500/30 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  </h4>
                  <div className="flex items-center mt-1">
                    <span 
                      className="inline-block w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: getStatusColor(spec.status) }}
                    ></span>
                    <span className="text-xs text-gray-400">Last check: {spec.lastChecked}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-mono text-lg">{spec.spec}</div>
                  <div className="text-xs text-gray-400">{spec.unit}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex justify-between items-center">
            <h4 className="text-white font-medium">Record New Measurements</h4>
            <button className="text-green-400 hover:text-green-300 flex items-center text-sm">
              <CheckCircle size={16} className="mr-1" /> Save to Log
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Component</label>
              <select className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white text-sm">
                <option value="">Select Component</option>
                <option value="wheelLugNuts">Wheel Lug Nuts</option>
                <option value="caliper">Caliper</option>
                <option value="cylinderHeadBolts">Cylinder Head Bolts</option>
                <option value="sparkPlugs">Spark Plugs</option>
                <option value="oilDrainPlug">Oil Drain Plug</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-400 text-xs mb-1">Measurement (ft-lb)</label>
              <input 
                type="number" 
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white text-sm" 
                placeholder="Enter value"
              />
            </div>
          </div>
          
          <div className="mt-3">
            <label className="block text-gray-400 text-xs mb-1">Notes</label>
            <textarea 
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white text-sm"
              rows="2"
              placeholder="Add measurement notes..."
            ></textarea>
          </div>
          
          <div className="mt-3 flex">
            <div className="flex space-x-2">
              <button className="flex items-center justify-center h-8 w-8 rounded-md bg-gray-800 hover:bg-blue-900/30 border border-gray-700 text-gray-300">
                <FileImage size={16} />
              </button>
              <button className="flex items-center justify-center h-8 w-8 rounded-md bg-gray-800 hover:bg-blue-900/30 border border-gray-700 text-gray-300">
                <FileVideo size={16} />
              </button>
              <button className="flex items-center justify-center h-8 w-8 rounded-md bg-gray-800 hover:bg-blue-900/30 border border-gray-700 text-gray-300">
                <FileAudio size={16} />
              </button>
              <button className="flex items-center justify-center h-8 w-8 rounded-md bg-gray-800 hover:bg-blue-900/30 border border-gray-700 text-gray-300">
                <FileText size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderTirePressure = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-blue-400 font-orbitron text-sm uppercase">Tire Pressure Telemetry</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">PSI</span>
            <Gauge size={16} className="text-blue-400" />
          </div>
        </div>
        
        <div className="relative h-64 border border-gray-800 rounded-lg bg-black/30 p-4">
          {/* Car outline */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-40 border border-gray-700 rounded-xl"></div>
          </div>
          
          {/* Tire pressure indicators */}
          {/* Front Left */}
          <div className="absolute top-10 left-10 transform -translate-x-1/2 -translate-y-1/2">
            <div 
              className="w-16 h-16 rounded-full flex flex-col items-center justify-center" 
              style={{ 
                backgroundColor: `${getStatusColor(tirePressureSpecs.frontLeft.status)}30`, 
                borderColor: getStatusColor(tirePressureSpecs.frontLeft.status),
                borderWidth: '2px'
              }}
            >
              <span className="text-white font-mono text-lg">{tirePressureSpecs.frontLeft.current}</span>
              <span className="text-xs text-gray-400">PSI</span>
            </div>
            <div className="text-center mt-1">
              <div className="text-xs font-medium text-white">Front Left</div>
              <div className="text-xs text-gray-400">
                Target: {tirePressureSpecs.frontLeft.recommended}
              </div>
              <div className={`text-xs ${getPressureVariance(tirePressureSpecs.frontLeft.current, tirePressureSpecs.frontLeft.recommended) < 0 ? 'text-blue-400' : 'text-yellow-400'}`}>
                {getPressureVariance(tirePressureSpecs.frontLeft.current, tirePressureSpecs.frontLeft.recommended) > 0 ? '+' : ''}
                {getPressureVariance(tirePressureSpecs.frontLeft.current, tirePressureSpecs.frontLeft.recommended)} PSI
              </div>
            </div>
          </div>
          
          {/* Front Right */}
          <div className="absolute top-10 right-10 transform translate-x-1/2 -translate-y-1/2">
            <div 
              className="w-16 h-16 rounded-full flex flex-col items-center justify-center" 
              style={{ 
                backgroundColor: `${getStatusColor(tirePressureSpecs.frontRight.status)}30`, 
                borderColor: getStatusColor(tirePressureSpecs.frontRight.status),
                borderWidth: '2px'
              }}
            >
              <span className="text-white font-mono text-lg">{tirePressureSpecs.frontRight.current}</span>
              <span className="text-xs text-gray-400">PSI</span>
            </div>
            <div className="text-center mt-1">
              <div className="text-xs font-medium text-white">Front Right</div>
              <div className="text-xs text-gray-400">
                Target: {tirePressureSpecs.frontRight.recommended}
              </div>
              <div className={`text-xs ${getPressureVariance(tirePressureSpecs.frontRight.current, tirePressureSpecs.frontRight.recommended) < 0 ? 'text-blue-400' : 'text-yellow-400'}`}>
                {getPressureVariance(tirePressureSpecs.frontRight.current, tirePressureSpecs.frontRight.recommended) > 0 ? '+' : ''}
                {getPressureVariance(tirePressureSpecs.frontRight.current, tirePressureSpecs.frontRight.recommended)} PSI
              </div>
            </div>
          </div>
          
          {/* Rear Left */}
          <div className="absolute bottom-10 left-10 transform -translate-x-1/2 translate-y-1/2">
            <div 
              className="w-16 h-16 rounded-full flex flex-col items-center justify-center" 
              style={{ 
                backgroundColor: `${getStatusColor(tirePressureSpecs.rearLeft.status)}30`, 
                borderColor: getStatusColor(tirePressureSpecs.rearLeft.status),
                borderWidth: '2px'
              }}
            >
              <span className="text-white font-mono text-lg">{tirePressureSpecs.rearLeft.current}</span>
              <span className="text-xs text-gray-400">PSI</span>
            </div>
            <div className="text-center mt-1">
              <div className="text-xs font-medium text-white">Rear Left</div>
              <div className="text-xs text-gray-400">
                Target: {tirePressureSpecs.rearLeft.recommended}
              </div>
              <div className={`text-xs ${getPressureVariance(tirePressureSpecs.rearLeft.current, tirePressureSpecs.rearLeft.recommended) < 0 ? 'text-blue-400' : 'text-green-400'}`}>
                {getPressureVariance(tirePressureSpecs.rearLeft.current, tirePressureSpecs.rearLeft.recommended) > 0 ? '+' : ''}
                {getPressureVariance(tirePressureSpecs.rearLeft.current, tirePressureSpecs.rearLeft.recommended)} PSI
              </div>
            </div>
          </div>
          
          {/* Rear Right */}
          <div className="absolute bottom-10 right-10 transform translate-x-1/2 translate-y-1/2">
            <div 
              className="w-16 h-16 rounded-full flex flex-col items-center justify-center" 
              style={{ 
                backgroundColor: `${getStatusColor(tirePressureSpecs.rearRight.status)}30`, 
                borderColor: getStatusColor(tirePressureSpecs.rearRight.status),
                borderWidth: '2px'
              }}
            >
              <span className="text-white font-mono text-lg">{tirePressureSpecs.rearRight.current}</span>
              <span className="text-xs text-gray-400">PSI</span>
            </div>
            <div className="text-center mt-1">
              <div className="text-xs font-medium text-white">Rear Right</div>
              <div className="text-xs text-gray-400">
                Target: {tirePressureSpecs.rearRight.recommended}
              </div>
              <div className={`text-xs ${getPressureVariance(tirePressureSpecs.rearRight.current, tirePressureSpecs.rearRight.recommended) < 0 ? 'text-blue-400' : 'text-green-400'}`}>
                {getPressureVariance(tirePressureSpecs.rearRight.current, tirePressureSpecs.rearRight.recommended) > 0 ? '+' : ''}
                {getPressureVariance(tirePressureSpecs.rearRight.current, tirePressureSpecs.rearRight.recommended)} PSI
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex justify-between items-center">
            <h4 className="text-white font-medium">Update Tire Pressure</h4>
            <div className="text-xs text-gray-400">Last checked: {tirePressureSpecs.frontLeft.lastChecked}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Position</label>
              <select className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white text-sm">
                <option value="">Select Position</option>
                <option value="frontLeft">Front Left</option>
                <option value="frontRight">Front Right</option>
                <option value="rearLeft">Rear Left</option>
                <option value="rearRight">Rear Right</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-400 text-xs mb-1">Pressure (PSI)</label>
              <input 
                type="number" 
                step="0.1"
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white text-sm" 
                placeholder="Enter value"
              />
            </div>
          </div>
          
          <div className="mt-3 flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md text-sm flex items-center">
              <CheckCircle size={16} className="mr-1" /> Save Measurement
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderMediaUpload = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-blue-400 font-orbitron text-sm uppercase">Media Archives</h3>
          <div className="text-xs text-gray-400">{mediaFiles.length} files</div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            className="bg-black/30 border border-gray-800 rounded-md p-3 hover:border-blue-500/30 transition-colors flex flex-col items-center justify-center"
            onClick={() => handleUpload('image')}
            disabled={isUploading}
          >
            <FileImage size={24} className="text-blue-400 mb-2" />
            <span className="text-white font-medium">Upload Image</span>
            <span className="text-xs text-gray-400 mt-1">JPEG, PNG, etc.</span>
          </button>
          
          <button 
            className="bg-black/30 border border-gray-800 rounded-md p-3 hover:border-blue-500/30 transition-colors flex flex-col items-center justify-center"
            onClick={() => handleUpload('video')}
            disabled={isUploading}
          >
            <FileVideo size={24} className="text-purple-400 mb-2" />
            <span className="text-white font-medium">Upload Video</span>
            <span className="text-xs text-gray-400 mt-1">MP4, MOV, etc.</span>
          </button>
          
          <button 
            className="bg-black/30 border border-gray-800 rounded-md p-3 hover:border-blue-500/30 transition-colors flex flex-col items-center justify-center"
            onClick={() => handleUpload('document')}
            disabled={isUploading}
          >
            <FileText size={24} className="text-green-400 mb-2" />
            <span className="text-white font-medium">Upload Document</span>
            <span className="text-xs text-gray-400 mt-1">PDF, receipts, etc.</span>
          </button>
          
          <button 
            className="bg-black/30 border border-gray-800 rounded-md p-3 hover:border-blue-500/30 transition-colors flex flex-col items-center justify-center"
            onClick={() => handleUpload('audio')}
            disabled={isUploading}
          >
            <FileAudio size={24} className="text-yellow-400 mb-2" />
            <span className="text-white font-medium">Voice Notes</span>
            <span className="text-xs text-gray-400 mt-1">MP3, WAV, etc.</span>
          </button>
        </div>
        
        {isUploading && (
          <div className="bg-blue-950/30 border border-blue-800/50 rounded-md p-3 mt-3">
            <div className="flex items-center">
              <Upload size={16} className="text-blue-400 mr-2 animate-pulse" />
              <span className="text-blue-400">Uploading media...</span>
            </div>
            <div className="mt-2 bg-gray-800 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-2/3 animate-pulse"></div>
            </div>
          </div>
        )}
        
        {mediaFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="text-white font-medium mb-2">Recent Uploads</h4>
            <div className="max-h-48 overflow-y-auto border border-gray-800 rounded-md">
              {mediaFiles.map(file => (
                <div 
                  key={file.id} 
                  className="flex items-center justify-between p-2 hover:bg-gray-800/50 border-b border-gray-800 last:border-b-0"
                >
                  <div className="flex items-center">
                    {file.type === 'image' && <FileImage size={16} className="text-blue-400 mr-2" />}
                    {file.type === 'video' && <FileVideo size={16} className="text-purple-400 mr-2" />}
                    {file.type === 'audio' && <FileAudio size={16} className="text-yellow-400 mr-2" />}
                    {file.type === 'document' && <FileText size={16} className="text-green-400 mr-2" />}
                    <span className="text-white text-sm">{file.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{file.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderServiceRecords = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-blue-400 font-orbitron text-sm uppercase">Maintenance Records</h3>
          <button className="text-white bg-blue-600 hover:bg-blue-500 rounded-md py-1 px-3 text-xs flex items-center">
            <Plus size={14} className="mr-1" /> Add Record
          </button>
        </div>
        
        <div className="space-y-3">
          {maintenanceRecords.map(record => (
            <div 
              key={record.id} 
              className="bg-black/30 border border-gray-800 rounded-md p-3 hover:border-blue-500/30 transition-colors relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-white font-medium">{record.type}</h4>
                  <div className="flex flex-col space-y-1 mt-1">
                    <div className="flex items-center text-xs">
                      <Calendar size={12} className="text-gray-400 mr-1" />
                      <span className="text-gray-400">{record.date}</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <GaugeCircle size={12} className="text-gray-400 mr-1" />
                      <span className="text-gray-400">{record.mileage.toLocaleString()} miles</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <Users size={12} className="text-gray-400 mr-1" />
                      <span className="text-gray-400">{record.technician}</span>
                    </div>
                  </div>
                </div>
                <div className="flex mt-1">
                  {record.media.length > 0 && (
                    <div className="flex -space-x-2">
                      {record.media.slice(0, 3).map((item, i) => (
                        <div 
                          key={i} 
                          className="w-7 h-7 rounded-full overflow-hidden border border-gray-800 flex items-center justify-center bg-gray-800"
                        >
                          {item.endsWith('.jpg') || item.endsWith('.png') ? (
                            <FileImage size={14} className="text-blue-400" />
                          ) : item.endsWith('.mp4') ? (
                            <FileVideo size={14} className="text-purple-400" />
                          ) : item.endsWith('.mp3') ? (
                            <FileAudio size={14} className="text-yellow-400" />
                          ) : (
                            <FileText size={14} className="text-green-400" />
                          )}
                        </div>
                      ))}
                      {record.media.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                          <span className="text-xs text-white">+{record.media.length - 3}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-gray-800">
                <p className="text-sm text-gray-300 truncate max-w-xs">{record.notes}</p>
                <button 
                  className="text-blue-400 hover:text-blue-300"
                  onClick={() => toggleExpand(record.id)}
                >
                  {expandedSection === record.id ? (
                    <Maximize size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              </div>
              
              {expandedSection === record.id && (
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <h5 className="text-white text-sm font-medium mb-2">Detailed Notes</h5>
                  <p className="text-gray-300 text-sm">{record.notes}</p>
                  
                  {record.media.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-white text-sm font-medium mb-2">Media Files</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {record.media.map((item, i) => (
                          <div key={i} className="bg-gray-800 rounded-md p-2 flex items-center justify-between">
                            <div className="flex items-center">
                              {item.endsWith('.jpg') || item.endsWith('.png') ? (
                                <FileImage size={14} className="text-blue-400 mr-2" />
                              ) : item.endsWith('.mp4') ? (
                                <FileVideo size={14} className="text-purple-400 mr-2" />
                              ) : item.endsWith('.mp3') ? (
                                <FileAudio size={14} className="text-yellow-400 mr-2" />
                              ) : (
                                <FileText size={14} className="text-green-400 mr-2" />
                              )}
                              <span className="text-sm text-white truncate max-w-[100px]">{item}</span>
                            </div>
                            <Copy size={14} className="text-gray-400 hover:text-white cursor-pointer" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
            </div>
          ))}
        </div>
        
        <div className="flex justify-center pt-2">
          <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
            <History size={14} className="mr-1" /> View Complete History
          </button>
        </div>
      </div>
    );
  };
  
  // Render the component content
  const renderContent = () => {
    switch(activeTab) {
      case 'torque':
        return renderTorqueSpecs();
      case 'tirePressure':
        return renderTirePressure();
      case 'media':
        return renderMediaUpload();
      case 'records':
        return renderServiceRecords();
      default:
        return renderTorqueSpecs();
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg border border-gray-800 overflow-hidden">
      {/* Header with racing-inspired styling */}
      <div className="bg-black border-b border-gray-800 p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-400" />
            <div>
              <h2 className="text-blue-400 font-orbitron text-base uppercase">F1 Mechanic Console</h2>
              <p className="text-xs text-gray-400">Advanced Maintenance Telemetry</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Badge variant="outline" className="text-green-400 border-green-500/30 mr-2 flex items-center">
              <Timer size={12} className="mr-1" /> LIVE
            </Badge>
            <span className="text-white bg-gray-800 px-2 py-1 rounded text-xs">
              {vehicle?.activeVehicle?.make} {vehicle?.activeVehicle?.model}
            </span>
          </div>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="flex border-b border-gray-800 bg-black/50">
        <button 
          className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'torque' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('torque')}
        >
          <Wrench size={16} className="mr-2" /> 
          Torque Specs
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'tirePressure' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('tirePressure')}
        >
          <Gauge size={16} className="mr-2" /> 
          Tire Pressure
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'media' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('media')}
        >
          <Upload size={16} className="mr-2" /> 
          Media
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'records' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('records')}
        >
          <BadgeAlert size={16} className="mr-2" /> 
          Records
        </button>
      </div>
      
      {/* Content area */}
      <div className="p-4">
        {renderContent()}
      </div>
      
      {/* Footer */}
      <div className="bg-black border-t border-gray-800 p-2 flex justify-between items-center text-xs">
        <div className="text-gray-400">
          Data Refresh: <span className="text-green-400 font-mono">15 sec</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-blue-400 hover:text-blue-300 flex items-center">
            <ArrowUpDown size={12} className="mr-1" /> Export
          </button>
          <button className="text-blue-400 hover:text-blue-300 flex items-center">
            <RotateCw size={12} className="mr-1" /> Refresh
          </button>
          <button className="text-green-400 hover:text-green-300 flex items-center">
            <BarChart4 size={12} className="mr-1" /> Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default F1MechanicConsole;