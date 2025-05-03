import React, { useState, useEffect } from "react";
import { 
  Car, 
  User, 
  GaugeCircle, 
  Calendar, 
  Map, 
  Droplets, 
  Wind, 
  Thermometer, 
  ArrowRight,
  Settings,
  Plus
} from "lucide-react";
import { useVehicle } from "../contexts/VehicleContext";
import { Link } from "react-router-dom";
import { getWeatherData } from "../services/openWeatherService";
import { useUserProfileStore } from "../services/userProfileService";

const NewDashboardPage = () => {
  const { profile } = useUserProfileStore();
  const { vehicles, activeVehicle, setActiveVehicle } = useVehicle();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const location = { lat: 33.9964, lon: -84.2919 }; // Default location (Roswell)
        const data = await getWeatherData(location, 'imperial');
        setWeatherData(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  const formatDate = () => {
    const date = new Date();
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#080808] to-[#121214] border-b border-blue-900/30 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-blue-400">PADDOCK20</h1>
              <span className="text-xs px-1.5 py-0.5 bg-[#08c519] text-black rounded font-bold">BETA</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">{formatDate()}</div>
              <div className="w-px h-6 bg-gray-700"></div>
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-400 mr-2" />
                <Link to="/new-profile" className="text-sm font-medium hover:text-blue-400 transition-colors">
                  {profile?.displayName || "Gavin Brooks"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with padding for fixed header */}
      <div className="pt-16 container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {profile?.displayName?.split(' ')[0] || "Driver"}
          </h2>
          <p className="text-gray-400">
            Track your vehicles, plan drives, and connect with the automotive community.
          </p>
        </div>

        {/* Vehicle Selector */}
        <div className="bg-[#111115] rounded-xl p-4 mb-8 border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-blue-400">Your Vehicles</h3>
            <Link to="/vehicle/add" className="flex items-center text-sm text-[#08c519] hover:text-[#05a314]">
              <Plus className="h-4 w-4 mr-1" />
              Add Vehicle
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <div 
                  key={vehicle.id} 
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    activeVehicle?.id === vehicle.id 
                      ? 'bg-blue-900/20 border border-blue-500/30' 
                      : 'bg-black/30 border border-gray-800 hover:border-gray-700'
                  }`}
                  onClick={() => setActiveVehicle(vehicle)}
                >
                  <div className="h-14 w-14 bg-gray-800 rounded-md flex items-center justify-center mr-4 overflow-hidden">
                    {vehicle.vehicle_image ? (
                      <img 
                        src={vehicle.vehicle_image} 
                        alt={vehicle.make + ' ' + vehicle.model} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Car className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {vehicle.mileage.toLocaleString()} miles
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-black/30 border border-gray-800 rounded-lg p-6 text-center">
                <Car className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <h4 className="text-lg font-medium mb-2">No vehicles added yet</h4>
                <p className="text-gray-400 mb-4">Add your first vehicle to get started with tracking and metrics</p>
                <Link 
                  to="/vehicle/add" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Vehicle
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Vehicle */}
          {activeVehicle && (
            <div className="bg-[#111115] rounded-xl border border-gray-800 md:col-span-2 overflow-hidden">
              <div className="bg-[#08080c] p-4 border-b border-gray-800">
                <h3 className="text-lg font-medium text-white">
                  {activeVehicle.nickname || `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`}
                </h3>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  <div className="bg-black/30 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <div className="text-sm flex items-center">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                      {activeVehicle.status || 'Ready'}
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Mileage</div>
                    <div className="text-sm">{activeVehicle.mileage.toLocaleString()} mi</div>
                  </div>
                  
                  <div className="bg-black/30 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Last Service</div>
                    <div className="text-sm">{activeVehicle.last_service || 'N/A'}</div>
                  </div>
                  
                  <div className="bg-black/30 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Engine</div>
                    <div className="text-sm">{activeVehicle.engine_type || 'Gasoline'}</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Link 
                    to="/maintenance" 
                    className="flex items-center px-3 py-2 bg-blue-800/20 hover:bg-blue-800/30 rounded-md text-sm text-blue-400 border border-blue-800/30 transition-colors"
                  >
                    <GaugeCircle className="h-4 w-4 mr-2" />
                    Maintenance Log
                  </Link>
                  
                  <Link 
                    to="/drive-journal" 
                    className="flex items-center px-3 py-2 bg-blue-800/20 hover:bg-blue-800/30 rounded-md text-sm text-blue-400 border border-blue-800/30 transition-colors"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Drive Journal
                  </Link>
                  
                  <Link 
                    to="/routes" 
                    className="flex items-center px-3 py-2 bg-blue-800/20 hover:bg-blue-800/30 rounded-md text-sm text-blue-400 border border-blue-800/30 transition-colors"
                  >
                    <Map className="h-4 w-4 mr-2" />
                    Route Planner
                  </Link>
                  
                  <Link 
                    to={`/vehicle/${activeVehicle.id}/edit`} 
                    className="flex items-center px-3 py-2 bg-gray-800/30 hover:bg-gray-800/50 rounded-md text-sm text-gray-400 border border-gray-700/30 transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Vehicle
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Weather Card */}
          <div className="bg-[#111115] rounded-xl border border-gray-800">
            <div className="bg-[#08080c] p-4 border-b border-gray-800">
              <h3 className="text-lg font-medium text-white">Current Weather</h3>
            </div>
            
            <div className="p-5">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : weatherData ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-2xl font-bold">
                        {Math.round(weatherData.main.temp)}°F
                      </div>
                      <div className="text-gray-400 capitalize">
                        {weatherData.weather[0].description}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {weatherData.name}
                      </div>
                    </div>
                    
                    <div>
                      <img 
                        src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} 
                        alt={weatherData.weather[0].description}
                        className="h-16 w-16"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/30 p-2 rounded-lg flex items-center">
                      <Droplets className="h-4 w-4 text-blue-400 mr-2" />
                      <div className="text-sm">
                        <span className="text-gray-400">Humidity:</span> {weatherData.main.humidity}%
                      </div>
                    </div>
                    
                    <div className="bg-black/30 p-2 rounded-lg flex items-center">
                      <Wind className="h-4 w-4 text-blue-400 mr-2" />
                      <div className="text-sm">
                        <span className="text-gray-400">Wind:</span> {Math.round(weatherData.wind.speed)} mph
                      </div>
                    </div>
                    
                    <div className="bg-black/30 p-2 rounded-lg flex items-center">
                      <Thermometer className="h-4 w-4 text-blue-400 mr-2" />
                      <div className="text-sm">
                        <span className="text-gray-400">Feels like:</span> {Math.round(weatherData.main.feels_like)}°F
                      </div>
                    </div>
                    
                    <Link 
                      to="/weather" 
                      className="bg-blue-900/20 p-2 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-900/30 transition-colors"
                    >
                      <span className="text-sm mr-1">Detailed Weather</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <p>Unable to fetch weather data</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Upcoming Events */}
          <div className="bg-[#111115] rounded-xl border border-gray-800 md:col-span-3">
            <div className="bg-[#08080c] p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Upcoming Events</h3>
              <Link to="/events" className="text-sm text-blue-400 flex items-center hover:text-blue-300">
                <span>View All</span>
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>
            
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Demo Events */}
                <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-blue-900/30 text-blue-400 rounded px-2 py-1 text-xs font-medium">
                      Track Day
                    </div>
                    <div className="text-sm text-gray-400">May 15</div>
                  </div>
                  <h4 className="font-medium text-white mb-1">Road Atlanta Open Track</h4>
                  <p className="text-sm text-gray-400 mb-3">Full day session with instructor time available</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">Braselton, GA</div>
                    <Link to="/events/1" className="text-sm text-blue-400 hover:text-blue-300">Details</Link>
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-green-900/30 text-green-400 rounded px-2 py-1 text-xs font-medium">
                      Cars & Coffee
                    </div>
                    <div className="text-sm text-gray-400">May 12</div>
                  </div>
                  <h4 className="font-medium text-white mb-1">Caffeine & Octane</h4>
                  <p className="text-sm text-gray-400 mb-3">Monthly meetup with featured European cars</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">Alpharetta, GA</div>
                    <Link to="/events/2" className="text-sm text-blue-400 hover:text-blue-300">Details</Link>
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-purple-900/30 text-purple-400 rounded px-2 py-1 text-xs font-medium">
                      Mountain Run
                    </div>
                    <div className="text-sm text-gray-400">May 22</div>
                  </div>
                  <h4 className="font-medium text-white mb-1">Tail of the Dragon</h4>
                  <p className="text-sm text-gray-400 mb-3">Group drive through 318 curves in 11 miles</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">Deals Gap, NC</div>
                    <Link to="/events/3" className="text-sm text-blue-400 hover:text-blue-300">Details</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-gray-800 py-2 px-4 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xs text-gray-500">
            PADDOCK20™ Powered by GoTime Motorsports
          </div>
          <div className="text-xs text-[#08c519]">
            {/* Dynamic tag based on what's happening */}
            BETA • Build 2025.05.03
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDashboardPage;