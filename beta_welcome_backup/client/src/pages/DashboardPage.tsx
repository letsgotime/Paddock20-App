import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WeatherStation from '../components/WeatherStation';
import WorldClockPanel from '../components/WorldClockPanel';
import { useAuth } from '../hooks/useAuth';
import { useVehicle } from '../hooks/useVehicle';
import { useUserProfileStore } from '../services/userProfileService';
import { 
  Calendar, BarChart3, Car, Map, Settings, Bell, Shield, ChevronRight, 
  MessageSquare, HeartHandshake, Star, Wrench, Award, Trophy, 
  FileText, Activity, Clock, User, Cloud
} from 'lucide-react';

// Define interface types for dashboard components
interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  type: 'drive' | 'maintenance' | 'event' | 'track';
  description?: string;
}

interface RecentDrive {
  id: number;
  date: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: number;
  vehicle?: string;
}

interface MaintenanceAlert {
  id: number;
  vehicle: string;
  serviceDue: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  mileage?: number;
}

function DashboardPage() {
  // Get user data from auth hook
  const { user } = useAuth();
  const userName = user?.username || '';
  
  // Get vehicle data
  const { vehicles, selectedVehicle: activeVehicle } = useVehicle();
  
  // Get user profile data
  const { profile } = useUserProfileStore();
  
  // State for dashboard components
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [recentDrives, setRecentDrives] = useState<RecentDrive[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([]);
  
  // Dashboard layout
  const [dashboardLayout] = useState<string[]>([
    'weather', 'world_clock', 'vehicles', 'drives', 'events', 'stats', 'maintenance'
  ]);

  // Load data from profile and vehicles when they change
  useEffect(() => {
    if (profile) {
      console.log('Loading data from user profile into dashboard');
      
      // Load events from profile if available
      if (profile.events && profile.events.length > 0) {
        const mappedEvents = profile.events.map(event => ({
          id: parseInt(event.id) || Math.floor(Math.random() * 1000),
          title: event.name || '',
          date: event.date || new Date().toISOString(),
          type: (event.type || 'event') as 'drive' | 'maintenance' | 'event' | 'track',
          description: event.location || ''
        }));
        setUpcomingEvents(mappedEvents);
      }
      
      // Load drives from profile if available
      if (profile.drives && profile.drives.length > 0) {
        const mappedDrives = profile.drives.map(drive => {
          // Extract route information to use as start/end locations
          let startLocation = '';
          let endLocation = '';
          
          if (drive.route) {
            const routeParts = drive.route.split(' to ');
            if (routeParts.length >= 2) {
              startLocation = routeParts[0];
              endLocation = routeParts[1];
            } else {
              startLocation = drive.route;
            }
          }
          
          return {
            id: parseInt(drive.id) || Math.floor(Math.random() * 1000),
            date: drive.date || new Date().toISOString(),
            startLocation,
            endLocation,
            distance: drive.distance || 0,
            duration: drive.duration || 0,
            vehicle: activeVehicle ? `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}` : ''
          };
        });
        setRecentDrives(mappedDrives);
      }
    }
    
    // Load maintenance alerts from vehicles if available
    if (vehicles && vehicles.length > 0) {
      const maintenanceItems: MaintenanceAlert[] = [];
      
      vehicles.forEach(vehicle => {
        // Get maintenance items from vehicle maintenance records
        if (vehicle.maintenanceItems && vehicle.maintenanceItems.length > 0) {
          vehicle.maintenanceItems
            .filter(item => !item.completed) // Only include incomplete maintenance
            .forEach(item => {
              maintenanceItems.push({
                id: parseInt(item.id) || Math.floor(Math.random() * 1000),
                vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                serviceDue: item.name,
                dueDate: item.date,
                priority: 'medium', // Default priority
                mileage: 0 // Default mileage
              });
            });
        }
      });
      
      setMaintenanceAlerts(maintenanceItems);
    }
  }, [profile, vehicles, activeVehicle]);

  return (
    <div className="dashboard bg-black text-white">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {userName}</h1>
            {profile && (
              <p className="text-gray-400">
                {profile.membershipLevel === 'premium' && <span className="text-blue-400 mr-1">⭐</span>}
                {profile.membershipLevel === 'elite' && <span className="text-yellow-400 mr-1">⭐⭐⭐</span>}
                Member since {new Date(profile.memberSince).toLocaleDateString()}
              </p>
            )}
          </div>
          
          {profile && profile.statistics && (
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Drives: {profile.statistics.totalDrives || 0}</p>
              <p className="text-sm text-gray-400">Total Miles: {profile.statistics.totalMiles || 0}</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Weather Widget */}
          {dashboardLayout.includes('weather') && (
            <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
              <h2 className="text-xl flex items-center gap-2 mb-4">
                <Cloud className="h-5 w-5" /> Weather Station
              </h2>
              <WeatherStation />
            </div>
          )}
          
          {/* World Clock */}
          {dashboardLayout.includes('world_clock') && (
            <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
              <h2 className="text-xl flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5" /> World Clock
              </h2>
              <WorldClockPanel />
            </div>
          )}
          
          {/* Vehicles */}
          {dashboardLayout.includes('vehicles') && (
            <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
              <h2 className="text-xl flex items-center gap-2 mb-4">
                <Car className="h-5 w-5" /> My Vehicles
              </h2>
              <div className="space-y-3">
                {vehicles.length > 0 ? (
                  vehicles.map(vehicle => (
                    <div key={vehicle.id} className="bg-gray-800 p-3 rounded flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                        <p className="text-sm text-gray-400">{vehicle.nickname || ''}</p>
                      </div>
                      <Link to={`/vehicles/${vehicle.id}`} className="text-blue-400 hover:text-blue-300">
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400">No vehicles added yet</p>
                    <Link to="/vehicles/add" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
                      Add your first vehicle
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Recent Drives */}
          {dashboardLayout.includes('drives') && (
            <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
              <h2 className="text-xl flex items-center gap-2 mb-4">
                <Map className="h-5 w-5" /> Recent Drives
              </h2>
              <div className="space-y-3">
                {recentDrives.length > 0 ? (
                  recentDrives.map(drive => (
                    <div key={drive.id} className="bg-gray-800 p-3 rounded">
                      <p className="font-semibold">
                        {drive.startLocation} {drive.endLocation ? `→ ${drive.endLocation}` : ''}
                      </p>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>{new Date(drive.date).toLocaleDateString()}</span>
                        <span>{drive.distance} miles</span>
                      </div>
                      {drive.vehicle && <p className="text-sm text-gray-500 mt-1">{drive.vehicle}</p>}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400">No drives recorded yet</p>
                    <Link to="/drives/add" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
                      Record your first drive
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Upcoming Events */}
          {dashboardLayout.includes('events') && (
            <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
              <h2 className="text-xl flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5" /> Upcoming Events
              </h2>
              <div className="space-y-3">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map(event => (
                    <div key={event.id} className="bg-gray-800 p-3 rounded">
                      <div className="flex justify-between">
                        <p className="font-semibold">{event.title}</p>
                        <span className="px-2 py-1 text-xs rounded bg-blue-900 text-blue-200">
                          {event.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400">No upcoming events</p>
                    <Link to="/events" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
                      Browse events
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Statistics */}
          {dashboardLayout.includes('stats') && (
            <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
              <h2 className="text-xl flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5" /> Activity Statistics
              </h2>
              <div className="space-y-3">
                {profile && profile.statistics ? (
                  <div>
                    <div className="bg-gray-800 p-3 rounded mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Total Distance</span>
                        <span className="text-sm font-bold">{profile.statistics.totalMiles || 0} miles</span>
                      </div>
                      <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full" 
                          style={{ width: `${Math.min(100, (profile.statistics.totalMiles || 0) / 30)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Drive Count</span>
                        <span className="text-sm font-bold">{profile.statistics.totalDrives || 0}</span>
                      </div>
                      <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 h-full" 
                          style={{ width: `${Math.min(100, (profile.statistics.totalDrives || 0) / 1.5)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Events Attended</span>
                        <span className="text-sm font-bold">{profile.statistics.eventsAttended || 0}</span>
                      </div>
                      <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-purple-500 h-full" 
                          style={{ width: `${Math.min(100, (profile.statistics.eventsAttended || 0) / 0.5)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Goals Completed</span>
                        <span className="text-sm font-bold">{profile.statistics.goalsCompleted || 0}</span>
                      </div>
                      <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-yellow-500 h-full" 
                          style={{ width: `${Math.min(100, (profile.statistics.goalsCompleted || 0) / 0.5)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400">No statistics available</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Profile Summary */}
          <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
            <h2 className="text-xl flex items-center gap-2 mb-4">
              <User className="h-5 w-5" /> Profile Summary
            </h2>
            <div className="space-y-3">
              {profile ? (
                <div className="bg-gray-800 p-3 rounded">
                  <div className="flex items-center mb-2">
                    {profile.avatar && (
                      <img 
                        src={profile.avatar} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full mr-3"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{profile.displayName || profile.username}</p>
                      <p className="text-sm text-gray-400">{profile.location || 'No location set'}</p>
                    </div>
                  </div>
                  {profile.bio && (
                    <p className="text-sm text-gray-300 mt-2">{profile.bio}</p>
                  )}
                  {profile.statistics && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="text-center p-2 bg-gray-700 rounded">
                        <p className="text-xl font-bold">{profile.statistics.totalDrives || 0}</p>
                        <p className="text-xs text-gray-400">Drives</p>
                      </div>
                      <div className="text-center p-2 bg-gray-700 rounded">
                        <p className="text-xl font-bold">{profile.statistics.eventsAttended || 0}</p>
                        <p className="text-xs text-gray-400">Events</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">Profile not loaded</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Maintenance Alerts */}
          {dashboardLayout.includes('maintenance') && (
            <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
              <h2 className="text-xl flex items-center gap-2 mb-4">
                <Wrench className="h-5 w-5" /> Maintenance Alerts
              </h2>
              <div className="space-y-3">
                {maintenanceAlerts.length > 0 ? (
                  maintenanceAlerts.map(alert => (
                    <div key={alert.id} className="bg-gray-800 p-3 rounded border-l-4 border-yellow-500">
                      <p className="font-semibold">{alert.serviceDue}</p>
                      <p className="text-sm text-gray-400">{alert.vehicle}</p>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Due: {new Date(alert.dueDate).toLocaleDateString()}</span>
                        {alert.mileage && <span className="text-gray-500">{alert.mileage} miles</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400">No maintenance alerts</p>
                    <Link to="/maintenance" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
                      Schedule maintenance
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;