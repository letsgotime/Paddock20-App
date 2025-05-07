import React from 'react';
import { useVehicle } from '@/hooks/useVehicle';
import { Droplets, Calendar, CheckCircle, PlusCircle, AlertTriangle } from 'lucide-react';

const GlossTrackerWidget: React.FC = () => {
  const { vehicles, activeVehicle } = useVehicle();
  
  // Get the currently displayed vehicle
  const displayVehicle = activeVehicle || (vehicles.length > 0 ? vehicles[0] : null);
  
  // Format date as relative time
  const getRelativeTimeString = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Calculate gloss quality value and get appropriate color
  const getGlossQualityInfo = (quality: number) => {
    let color = '';
    let status = '';
    
    if (quality >= 90) {
      color = 'text-green-500';
      status = 'Excellent';
    } else if (quality >= 75) {
      color = 'text-green-400';
      status = 'Very Good';
    } else if (quality >= 60) {
      color = 'text-yellow-500';
      status = 'Good';
    } else if (quality >= 45) {
      color = 'text-orange-500';
      status = 'Fair';
    } else {
      color = 'text-red-500';
      status = 'Poor';
    }
    
    return { color, status };
  };
  
  // Sample detailing history for the vehicle
  const detailingHistory = displayVehicle ? [
    {
      id: '1',
      date: '2025-05-01',
      type: 'Maintenance Wash',
      glossRating: 82,
      products: ['GoTime Clean Shampoo', 'GoTime Spray Wax'],
      notes: 'Quick maintenance wash to remove pollen and light dust'
    },
    {
      id: '2',
      date: '2025-04-15',
      type: 'Full Detail',
      glossRating: 92,
      products: ['GoTime Clean Shampoo', 'GoTime Clay Bar', 'GoTime Sealant'],
      notes: 'Complete detail with paint correction and ceramic coating touch-up'
    },
    {
      id: '3',
      date: '2025-03-28',
      type: 'Maintenance Wash',
      glossRating: 85,
      products: ['GoTime Clean Shampoo', 'GoTime Quick Detailer'],
      notes: 'Basic wash to remove road grime and salt'
    }
  ] : [];
  
  // When a detailing session needs to be scheduled based on last detail date
  const needsDetailingSession = () => {
    if (!detailingHistory.length) return true;
    
    const lastDetailDate = new Date(detailingHistory[0].date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastDetailDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffDays > 14; // Needs detailing if more than 2 weeks since last session
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-blue-300 font-semibold">
          {displayVehicle ? 'Gloss Tracker' : 'No Vehicle Selected'}
        </h3>
        
        {displayVehicle && (
          <button 
            className="flex items-center text-xs bg-blue-900/40 hover:bg-blue-800/50 text-blue-300 rounded px-2 py-1"
          >
            <PlusCircle className="h-3 w-3 mr-1" />
            <span>Add Session</span>
          </button>
        )}
      </div>
      
      {displayVehicle ? (
        <>
          {/* Current Gloss Status */}
          {detailingHistory.length > 0 && (
            <div className="bg-blue-950/20 rounded-lg p-3 mb-3 border border-blue-900/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Droplets className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-sm font-medium text-white">Current Gloss</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-400">
                    Updated {getRelativeTimeString(detailingHistory[0].date)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-end">
                <span className="text-2xl font-bold text-blue-300 mr-2">
                  {detailingHistory[0].glossRating}%
                </span>
                
                {(() => {
                  const { color, status } = getGlossQualityInfo(detailingHistory[0].glossRating);
                  return <span className={`text-sm ${color}`}>{status}</span>;
                })()}
              </div>
              
              {/* Gloss score bar */}
              <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                  style={{ width: `${detailingHistory[0].glossRating}%` }}
                ></div>
              </div>
              
              {/* Detailing alert */}
              {needsDetailingSession() && (
                <div className="mt-2 flex items-center text-xs text-yellow-500">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  <span>Due for maintenance detail</span>
                </div>
              )}
            </div>
          )}
          
          {/* Detailing History */}
          <div className="flex-1 overflow-y-auto">
            <h4 className="text-xs font-medium text-gray-400 uppercase mb-2">Recent Detailing Sessions</h4>
            
            {detailingHistory.length > 0 ? (
              <div className="space-y-2">
                {detailingHistory.map(session => (
                  <div 
                    key={session.id}
                    className="p-2 bg-blue-950/20 rounded border border-blue-900/30 hover:bg-blue-900/20 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-blue-300">{session.type}</h5>
                        <p className="text-xs text-gray-400">{new Date(session.date).toLocaleDateString()}</p>
                      </div>
                      
                      <div className={`text-sm font-medium ${getGlossQualityInfo(session.glossRating).color}`}>
                        {session.glossRating}%
                      </div>
                    </div>
                    
                    {session.products.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {session.products.map((product, idx) => (
                          <span 
                            key={idx}
                            className="px-1.5 py-0.5 bg-blue-900/30 rounded text-xs text-blue-300"
                          >
                            {product}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {session.notes && (
                      <p className="mt-1 text-xs text-gray-400 italic">
                        "{session.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No detailing sessions recorded</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="bg-blue-900/30 rounded-full p-3 mb-2">
            <Droplets className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-gray-400 text-sm">
            Select a vehicle to track detailing sessions
          </p>
        </div>
      )}
    </div>
  );
};

export default GlossTrackerWidget;