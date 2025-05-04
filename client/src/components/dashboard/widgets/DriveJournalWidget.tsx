import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight, PlusCircle, Car } from 'lucide-react';

// Sample drive data for demonstration
const recentDrives = [
  {
    id: 1,
    title: 'Sunday Morning Canyon Run',
    date: 'May 2, 2025',
    location: 'Blue Ridge Mountains',
    distance: '78 miles',
    duration: '2h 15m',
    vehicle: 'Porsche 911 Carrera GTS',
    photos: 12,
    notes: 'Perfect weather conditions with dry roads and moderate traffic.',
  },
  {
    id: 2,
    title: 'Coffee Run Meet',
    date: 'April 28, 2025',
    location: 'Atlanta Motorsports Park',
    distance: '32 miles',
    duration: '45m',
    vehicle: 'BMW M3 Competition',
    photos: 8,
    notes: 'Met with the local car club for our monthly coffee and cars.',
  },
  {
    id: 3,
    title: 'Mountain Cruise',
    date: 'April 25, 2025',
    location: 'North Georgia Mountains',
    distance: '112 miles',
    duration: '3h 30m',
    vehicle: 'Porsche 911 Carrera GTS',
    photos: 15,
    notes: 'Extended drive through the mountains with stops at scenic overlooks.',
  }
];

const DriveJournalWidget: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'recent' | 'planned'>('recent');
  
  return (
    <div className="h-full">
      {/* Widget Header Tabs */}
      <div className="flex border-b border-blue-900/30 mb-4">
        <button
          onClick={() => setActiveTab('recent')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'recent'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Recent Drives
        </button>
        <button
          onClick={() => setActiveTab('planned')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'planned'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Planned Routes
        </button>
      </div>
      
      {/* Drive List */}
      <div className="space-y-4 mb-4">
        {activeTab === 'recent' ? (
          <>
            {recentDrives.map(drive => (
              <div 
                key={drive.id}
                className="p-3 rounded-lg bg-black/40 border border-blue-900/30 hover:border-blue-700/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-blue-300 font-medium">{drive.title}</h3>
                  <span className="text-xs text-gray-400">{drive.date}</span>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400 mb-2">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{drive.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Car className="h-3 w-3 mr-1" />
                    <span>{drive.vehicle}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <div className="flex space-x-3 text-gray-500">
                    <span>{drive.distance}</span>
                    <span>|</span>
                    <span>{drive.duration}</span>
                    <span>|</span>
                    <span>{drive.photos} photos</span>
                  </div>
                  <button 
                    className="text-blue-400 hover:text-blue-300 flex items-center"
                    onClick={() => navigate(`/drive-journal/${drive.id}`)}
                  >
                    <span>Details</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <Calendar className="h-12 w-12 text-blue-800/60" />
            </div>
            <h3 className="text-blue-400 font-medium mb-2">Plan Your Next Adventure</h3>
            <p className="text-gray-500 text-sm mb-4">
              Use our route planner to map out your next drive with weather insights,
              points of interest, and optimal road conditions.
            </p>
            <button
              onClick={() => navigate('/route-planner')}
              className="flex items-center justify-center space-x-2 mx-auto bg-blue-900/50 hover:bg-blue-800/60 text-blue-300 px-4 py-2 rounded-md"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Route</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Action Footer */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/drive-journal')}
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
        >
          <span>View All Drives</span>
          <ArrowRight className="h-3 w-3 ml-1" />
        </button>
        
        <button
          onClick={() => navigate('/drive-journal/new')}
          className="text-sm bg-green-900/30 hover:bg-green-800/40 text-green-400 px-3 py-1 rounded flex items-center space-x-1"
        >
          <PlusCircle className="h-3 w-3" />
          <span>Log Drive</span>
        </button>
      </div>
    </div>
  );
};

export default DriveJournalWidget;