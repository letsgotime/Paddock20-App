import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import F1MotorsportWeatherStation from '../components/F1MotorsportWeatherStation';

// Mock user data for demo purposes
const mockUserData = {
  name: 'Alex',
  vehicles: [
    { id: 1, make: 'BMW', model: 'M3', year: 2009, nickname: 'E93', imageUrl: 'https://www.bmwusa.com/content/dam/bmwusa/M-Model-Vehicles/2018/BMW-M4-Convertible/BMW-MY18-MPerformance-Header-M3-Convertible-Desktop.jpg' },
    { id: 2, make: 'Audi', model: 'R8 V10', year: 2014, nickname: 'Iron Man', imageUrl: 'https://www.pngmart.com/files/22/Audi-R8-PNG-Photo.png' },
    { id: 3, make: 'BMW', model: 'M3', year: 2021, nickname: 'G80', imageUrl: 'https://www.ccarprice.com/products/BMW-M3-Competition-Sedan-2021.jpg' }
  ],
  upcomingEvents: [
    { id: 1, title: 'Carolina Cars & Coffee', date: '2025-05-03', location: 'Charlotte, NC' },
    { id: 2, title: 'Track Day - VIR', date: '2025-05-15', location: 'Virginia International Raceway' }
  ],
  maintenanceAlerts: [
    { id: 1, vehicleId: 1, type: 'Oil Change', dueDate: '2025-05-10' },
    { id: 2, vehicleId: 2, type: 'Tire Rotation', dueDate: '2025-05-05' }
  ],
  recentManifestationProgress: [
    { id: 1, goal: 'Beach House', progress: 3, target: 100 },
    { id: 2, goal: 'Patek Philippe', progress: 32, target: 100 }
  ]
};

const PersonalizedDashboard: React.FC = () => {
  const [userData, setUserData] = useState(mockUserData);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Update greeting based on time of day
    const hours = currentTime.getHours();
    if (hours < 12) {
      setGreeting('Good Morning');
    } else if (hours < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Get vehicle by ID
  const getVehicleById = (id: number) => {
    return userData.vehicles.find(vehicle => vehicle.id === id);
  };

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="bts-header text-4xl mb-2">{greeting}, {userData.name}</h1>
          <p className="text-gray-400">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} | {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Grid Layout for Dashboard Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weather Widget - Spans 2 columns on large screens */}
          <div className="lg:col-span-2 bts-card">
            <h2 className="bts-header-green mb-4">Current Weather & Drive Conditions</h2>
            <F1MotorsportWeatherStation />
          </div>

          {/* Quick Actions Widget */}
          <div className="bts-card">
            <h2 className="bts-header-green mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/drive-journal" className="flex flex-col items-center bg-black/40 rounded-lg p-3 transition hover:bg-black/60">
                <span className="text-2xl mb-2">📝</span>
                <span className="text-white text-sm">Log a Drive</span>
              </Link>
              <Link to="/garage-vault" className="flex flex-col items-center bg-black/40 rounded-lg p-3 transition hover:bg-black/60">
                <span className="text-2xl mb-2">🔧</span>
                <span className="text-white text-sm">Add Service</span>
              </Link>
              <Link to="/route-planner" className="flex flex-col items-center bg-black/40 rounded-lg p-3 transition hover:bg-black/60">
                <span className="text-2xl mb-2">🛣️</span>
                <span className="text-white text-sm">Plan Route</span>
              </Link>
              <Link to="/events" className="flex flex-col items-center bg-black/40 rounded-lg p-3 transition hover:bg-black/60">
                <span className="text-2xl mb-2">📅</span>
                <span className="text-white text-sm">View Events</span>
              </Link>
            </div>
          </div>

          {/* Your Vehicles */}
          <div className="bts-card">
            <h2 className="bts-header-green mb-4">Your Garage</h2>
            <div className="space-y-4">
              {userData.vehicles.map(vehicle => (
                <Link to={`/vehicle/${vehicle.id}`} key={vehicle.id} className="flex items-center p-3 bg-black/40 rounded-lg transition hover:bg-black/60">
                  <div className="w-16 h-16 rounded-lg overflow-hidden mr-4 flex-shrink-0 border border-gray-700">
                    <img src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}</h3>
                    <p className="text-gray-400 text-sm">{vehicle.nickname ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : ''}</p>
                  </div>
                </Link>
              ))}
              <Link to="/garage-vault" className="flex items-center justify-center p-3 bg-black/20 rounded-lg border border-dashed border-gray-700 transition hover:bg-black/40">
                <span className="text-green-400">+ Add Vehicle</span>
              </Link>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bts-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="bts-header-green">Upcoming Events</h2>
              <Link to="/events" className="text-sm text-green-400 hover:underline">View All</Link>
            </div>
            {userData.upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {userData.upcomingEvents.map(event => (
                  <div key={event.id} className="p-3 bg-black/40 rounded-lg">
                    <div className="flex justify-between">
                      <h3 className="text-white font-medium">{event.title}</h3>
                      <span className="text-amber-400 text-sm">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{event.location}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-black/20 rounded-lg">
                <p className="text-gray-400">No upcoming events</p>
                <Link to="/events" className="mt-2 text-sm text-green-400 hover:underline block">Find Events</Link>
              </div>
            )}
          </div>

          {/* Maintenance Alerts */}
          <div className="bts-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="bts-header-green">Maintenance Alerts</h2>
              <Link to="/maintenance" className="text-sm text-green-400 hover:underline">View All</Link>
            </div>
            {userData.maintenanceAlerts.length > 0 ? (
              <div className="space-y-3">
                {userData.maintenanceAlerts.map(alert => {
                  const vehicle = getVehicleById(alert.vehicleId);
                  return (
                    <div key={alert.id} className="p-3 bg-black/40 rounded-lg">
                      <div className="flex justify-between">
                        <h3 className="text-white font-medium">{alert.type}</h3>
                        <span className="text-red-400 text-sm">
                          Due: {new Date(alert.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{vehicle?.nickname || `${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-6 bg-black/20 rounded-lg">
                <p className="text-gray-400">No maintenance alerts</p>
              </div>
            )}
          </div>

          {/* Manifestation Progress */}
          <div className="bts-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="bts-header-green">Manifestation Progress</h2>
              <Link to="/manifestation-station" className="text-sm text-green-400 hover:underline">Full Details</Link>
            </div>
            {userData.recentManifestationProgress.length > 0 ? (
              <div className="space-y-4">
                {userData.recentManifestationProgress.map(goal => (
                  <div key={goal.id} className="p-3 bg-black/40 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-white font-medium">{goal.goal}</h3>
                      <span className="text-blue-400 text-sm">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-500 h-2.5 rounded-full" 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-black/20 rounded-lg">
                <p className="text-gray-400">No active manifestation goals</p>
                <Link to="/manifestation-station" className="mt-2 text-sm text-green-400 hover:underline block">Create a Goal</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedDashboard;