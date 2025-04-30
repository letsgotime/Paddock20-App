import React, { useState, useEffect } from 'react';
import WeatherStation from '../components/WeatherStation';
import WorldClock from '../components/WorldClock';
import WeatherVehicleImpactAnalyzer from '../components/WeatherVehicleImpactAnalyzer';
import { 
  Cloud, Sun, Wind, CloudRain, Droplets, Thermometer, 
  Clock, Calendar, AlertTriangle, MapPin, Car, Navigation,
  Wrench, Gauge, Activity, Check, Snowflake, Disc, Settings,
  Timer, ArrowUp, BarChart, Zap, Flame, ChevronsUp, Hammer
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as vehicleDataService from '../services/vehicleDataService';

const WeatherPage = () => {
  const [showWeatherAlert, setShowWeatherAlert] = useState(false);
  const [weatherAlertData, setWeatherAlertData] = useState(null);
  const [carDrivingTips, setCarDrivingTips] = useState([]);
  const [showCarTips, setShowCarTips] = useState(false);
  const [selectedWeatherTab, setSelectedWeatherTab] = useState('current');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dayProgress, setDayProgress] = useState(0);
  
  // Auto enthusiast specific data
  const [surfaceTemp, setSurfaceTemp] = useState(75); // Default value in F
  const [trackGripLevel, setTrackGripLevel] = useState(85); // Default value as percentage
  const [tirePressureRecommendations, setTirePressureRecommendations] = useState({
    front: { cold: 32, hot: 35 },
    rear: { cold: 30, hot: 33 },
    adjustmentNeeded: false
  });
  const [lugNutTorqueSettings, setLugNutTorqueSettings] = useState({
    standard: 100, // ft-lbs
    aluminum: 80, // ft-lbs
    recommended: 95, // ft-lbs
    weatherAdjusted: false
  });
  const [selectedVehicleType, setSelectedVehicleType] = useState('sports'); // sports, luxury, track, SUV
  
  // Vehicle-specific data from the user's garage
  const [userVehicles, setUserVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleModifications, setVehicleModifications] = useState([]);
  const [tireHeatingTrends, setTireHeatingTrends] = useState({
    frontLeft: { current: 72, optimal: 85, heatRate: 4.2 }, // F per minute
    frontRight: { current: 73, optimal: 85, heatRate: 4.3 },
    rearLeft: { current: 70, optimal: 82, heatRate: 3.8 },
    rearRight: { current: 71, optimal: 82, heatRate: 3.9 }
  });
  const [engineWarmUpTime, setEngineWarmUpTime] = useState({
    ambientTemp: 68, // F
    targetTemp: 190, // F
    estimatedMinutes: 4.5, // minutes
    weatherAdjustment: 0.8 // multiplier (< 1 means faster warmup, > 1 means slower)
  });
  const [engineCooldownTime, setEngineCooldownTime] = useState({
    currentTemp: 210, // F
    targetTemp: 100, // F
    estimatedMinutes: 28, // minutes
    weatherAdjustment: 1.2 // multiplier (< 1 means faster cooldown, > 1 means slower)
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Calculate day progress percentage (0-100%)
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      
      const totalDayMs = endOfDay.getTime() - startOfDay.getTime();
      const elapsedMs = now.getTime() - startOfDay.getTime();
      setDayProgress((elapsedMs / totalDayMs) * 100);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Check for weather alerts
  useEffect(() => {
    const fetchWeatherAlerts = async () => {
      try {
        const response = await fetch('/api/weather-alerts');
        if (response.ok) {
          const data = await response.json();
          if (data && data.alerts && data.alerts.length > 0) {
            setWeatherAlertData(data);
            setShowWeatherAlert(true);
            
            // Generate car driving tips based on alert type
            generateDrivingTips(data.alerts[0].event);
          }
        }
      } catch (error) {
        console.error('Error fetching weather alerts:', error);
      }
    };
    
    fetchWeatherAlerts();
    
    // Refresh alerts every 30 minutes
    const alertInterval = setInterval(fetchWeatherAlerts, 30 * 60 * 1000);
    
    return () => clearInterval(alertInterval);
  }, []);
  
  // Load user's vehicles and modifications
  useEffect(() => {
    const loadUserVehicles = async () => {
      try {
        // Get all user vehicles
        const vehicles = await vehicleDataService.getVehicles();
        setUserVehicles(vehicles);
        
        // Select the first vehicle by default if available
        if (vehicles.length > 0) {
          setSelectedVehicle(vehicles[0]);
          
          // Load modifications for the selected vehicle
          const mods = await vehicleDataService.getModifications(vehicles[0].id);
          setVehicleModifications(mods);
          
          // Calculate vehicle-specific metrics based on weather and mods
          calculateVehicleWeatherMetrics(vehicles[0], mods);
        }
      } catch (error) {
        console.error('Error loading vehicle data:', error);
      }
    };
    
    loadUserVehicles();
  }, []);
  
  // Recalculate vehicle metrics when weather or selected vehicle changes
  const calculateVehicleWeatherMetrics = (vehicle, modifications) => {
    if (!vehicle) return;
    
    // Get current temperature from weather data or use default
    const currentTemp = 68; // this would normally come from weather API
    const humidity = 45; // this would normally come from weather API
    const isRaining = false; // this would normally come from weather API
    
    // Find tire modifications
    const tireModification = modifications.find(mod => 
      mod.category?.toLowerCase().includes('tire') || 
      mod.type?.toLowerCase().includes('tire') ||
      mod.name?.toLowerCase().includes('tire')
    );
    
    // Calculate tire heating trends based on tire type and weather
    let newTireHeatingTrends = { ...tireHeatingTrends };
    
    // Adjust for tire type if modification exists
    if (tireModification) {
      const tireName = tireModification.name || '';
      
      // Performance tires heat up faster than all-season
      if (tireName.toLowerCase().includes('performance') || tireName.toLowerCase().includes('sport')) {
        newTireHeatingTrends.frontLeft.heatRate += 1.5;
        newTireHeatingTrends.frontRight.heatRate += 1.5;
        newTireHeatingTrends.rearLeft.heatRate += 1.2;
        newTireHeatingTrends.rearRight.heatRate += 1.2;
        newTireHeatingTrends.frontLeft.optimal += 5; // Performance tires work better at higher temps
        newTireHeatingTrends.frontRight.optimal += 5;
        newTireHeatingTrends.rearLeft.optimal += 5;
        newTireHeatingTrends.rearRight.optimal += 5;
      }
      // Winter/snow tires work better at lower temperatures
      else if (tireName.toLowerCase().includes('winter') || tireName.toLowerCase().includes('snow')) {
        newTireHeatingTrends.frontLeft.heatRate -= 0.8;
        newTireHeatingTrends.frontRight.heatRate -= 0.8;
        newTireHeatingTrends.rearLeft.heatRate -= 0.8;
        newTireHeatingTrends.rearRight.heatRate -= 0.8;
        newTireHeatingTrends.frontLeft.optimal -= 15; // Winter tires better at lower temps
        newTireHeatingTrends.frontRight.optimal -= 15;
        newTireHeatingTrends.rearLeft.optimal -= 15;
        newTireHeatingTrends.rearRight.optimal -= 15;
      }
    }
    
    // Adjust for current weather conditions
    if (isRaining) {
      // Wet conditions reduce heat buildup and optimal temperature
      newTireHeatingTrends.frontLeft.heatRate *= 0.7;
      newTireHeatingTrends.frontRight.heatRate *= 0.7;
      newTireHeatingTrends.rearLeft.heatRate *= 0.7;
      newTireHeatingTrends.rearRight.heatRate *= 0.7;
      newTireHeatingTrends.frontLeft.optimal -= 8;
      newTireHeatingTrends.frontRight.optimal -= 8;
      newTireHeatingTrends.rearLeft.optimal -= 8;
      newTireHeatingTrends.rearRight.optimal -= 8;
    }
    
    // Cold weather effects on tire temperature
    if (currentTemp < 50) {
      newTireHeatingTrends.frontLeft.heatRate *= 0.8;
      newTireHeatingTrends.frontRight.heatRate *= 0.8;
      newTireHeatingTrends.rearLeft.heatRate *= 0.8;
      newTireHeatingTrends.rearRight.heatRate *= 0.8;
      
      // Current temps start much lower
      const tempDiff = 50 - currentTemp;
      newTireHeatingTrends.frontLeft.current -= tempDiff * 0.5;
      newTireHeatingTrends.frontRight.current -= tempDiff * 0.5;
      newTireHeatingTrends.rearLeft.current -= tempDiff * 0.5;
      newTireHeatingTrends.rearRight.current -= tempDiff * 0.5;
    }
    
    // Update state with new calculations
    setTireHeatingTrends(newTireHeatingTrends);
    
    // Calculate engine warm-up time based on weather and engine modifications
    let newEngineWarmUp = { ...engineWarmUpTime };
    newEngineWarmUp.ambientTemp = currentTemp;
    
    // Cold weather dramatically increases warm-up time
    if (currentTemp < 32) {
      newEngineWarmUp.weatherAdjustment = 1.8; // 80% longer warmup
      newEngineWarmUp.estimatedMinutes = 6 * newEngineWarmUp.weatherAdjustment;
    } else if (currentTemp < 50) {
      newEngineWarmUp.weatherAdjustment = 1.4; // 40% longer warmup
      newEngineWarmUp.estimatedMinutes = 5 * newEngineWarmUp.weatherAdjustment;
    } else if (currentTemp > 90) {
      newEngineWarmUp.weatherAdjustment = 0.7; // 30% shorter warmup
      newEngineWarmUp.estimatedMinutes = 3.5 * newEngineWarmUp.weatherAdjustment;
    } else {
      newEngineWarmUp.weatherAdjustment = 1.0; // normal
      newEngineWarmUp.estimatedMinutes = 4.5;
    }
    
    // Update engine warmup based on engine modifications
    const engineMod = modifications.find(mod => 
      mod.category?.toLowerCase().includes('engine') || 
      mod.type?.toLowerCase().includes('engine')
    );
    
    if (engineMod) {
      // Turbo engines tend to warm up a bit faster
      if (engineMod.name?.toLowerCase().includes('turbo')) {
        newEngineWarmUp.estimatedMinutes *= 0.9; // 10% quicker
      }
      // Performance exhausts can improve warm-up times
      if (engineMod.name?.toLowerCase().includes('exhaust')) {
        newEngineWarmUp.estimatedMinutes *= 0.95; // 5% quicker
      }
    }
    
    setEngineWarmUpTime(newEngineWarmUp);
    
    // Calculate engine cooldown time based on weather
    let newEngineCooldown = { ...engineCooldownTime };
    
    // Cooldown depends a lot on ambient temperature
    newEngineCooldown.weatherAdjustment = (currentTemp > 85) ? 1.3 : 
                                          (currentTemp < 40) ? 0.8 : 1.0;
                                          
    // Humidity affects cooldown rates
    if (humidity > 80) {
      newEngineCooldown.weatherAdjustment *= 0.9; // high humidity improves cooling
    }
    
    newEngineCooldown.estimatedMinutes = 28 * newEngineCooldown.weatherAdjustment;
    
    setEngineCooldownTime(newEngineCooldown);
  };

  const generateDrivingTips = (alertType) => {
    let tips = [];
    
    // Default tips for any weather
    const defaultTips = [
      "Maintain at least a 3-second following distance",
      "Ensure your windshield wipers are functioning properly",
      "Check tire pressure and tread depth regularly",
      "Turn on headlights for better visibility"
    ];
    
    // Weather-specific tips
    if (alertType) {
      const lowerCaseAlert = alertType.toLowerCase();
      
      if (lowerCaseAlert.includes('rain') || lowerCaseAlert.includes('flood')) {
        tips = [
          "Reduce speed by at least 5-10 mph below the speed limit",
          "Avoid puddles which may hide potholes or debris",
          "Test brakes lightly after driving through standing water",
          "Use headlights, not hazard lights, for better visibility",
          "Turn off cruise control to maintain better control"
        ];
      } else if (lowerCaseAlert.includes('wind')) {
        tips = [
          "Keep both hands firmly on the steering wheel",
          "Be especially careful when passing large vehicles",
          "Watch for flying debris or downed tree branches",
          "Park away from trees or power lines",
          "Avoid driving high-profile vehicles if wind exceeds 45mph"
        ];
      } else if (lowerCaseAlert.includes('snow') || lowerCaseAlert.includes('ice')) {
        tips = [
          "Accelerate and decelerate slowly to maintain traction",
          "Increase following distance to 8-10 seconds",
          "Avoid using cruise control or lane-keeping assistance",
          "Don't stop when going uphill if possible",
          "Clear all snow from your vehicle including headlights and roof"
        ];
      } else if (lowerCaseAlert.includes('fog')) {
        tips = [
          "Use low beam headlights or fog lights if equipped",
          "Reduce speed to match visibility conditions",
          "Use the right edge of the road as a guide rather than centerlines",
          "Avoid sudden stops - watch for tail lights ahead",
          "Turn off music and reduce distractions to focus on driving"
        ];
      } else if (lowerCaseAlert.includes('heat')) {
        tips = [
          "Check cooling system and fluid levels before driving",
          "Park in shaded areas when possible to reduce interior temperatures",
          "Consider window tinting or sunshades to reduce solar heat gain",
          "Avoid extended idling which can overheat the engine",
          "Keep an eye on temperature gauge during stop-and-go traffic"
        ];
      } else {
        tips = defaultTips;
      }
    } else {
      tips = defaultTips;
    }
    
    setCarDrivingTips(tips);
    setShowCarTips(true);
  };

  // Format time as HH:MM:SS
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: true 
    });
  };

  // Format date as day, month, date, year
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pt-6 pb-24">
      <div className="container mx-auto px-4">
        {/* Page Header with Day Progress Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <h1 className="text-3xl font-orbitron text-green-500 mb-2 md:mb-0">WEATHER COMMAND CENTER</h1>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <span className="text-xl font-mono">{formatTime(currentTime)}</span>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-2">
            <p className="text-gray-400 mb-2 md:mb-0">{formatDate(currentTime)}</p>
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Day Progress:</span>
              <div className="w-40 h-3 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                  style={{ width: `${dayProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Weather Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mt-6 bg-gray-900/50 p-2 rounded-lg">
            <button 
              className={`px-4 py-2 rounded-md flex items-center ${
                selectedWeatherTab === 'current' 
                  ? 'bg-blue-900/70 text-white' 
                  : 'bg-gray-800/70 text-gray-400 hover:bg-gray-700/70'
              }`}
              onClick={() => setSelectedWeatherTab('current')}
            >
              <Thermometer className="h-4 w-4 mr-2" />
              Current Weather
            </button>
            <button 
              className={`px-4 py-2 rounded-md flex items-center ${
                selectedWeatherTab === 'world-time' 
                  ? 'bg-blue-900/70 text-white' 
                  : 'bg-gray-800/70 text-gray-400 hover:bg-gray-700/70'
              }`}
              onClick={() => setSelectedWeatherTab('world-time')}
            >
              <Clock className="h-4 w-4 mr-2" />
              World Time Zones
            </button>
            <button 
              className={`px-4 py-2 rounded-md flex items-center ${
                selectedWeatherTab === 'driving-tips' 
                  ? 'bg-blue-900/70 text-white' 
                  : 'bg-gray-800/70 text-gray-400 hover:bg-gray-700/70'
              }`}
              onClick={() => setSelectedWeatherTab('driving-tips')}
            >
              <Car className="h-4 w-4 mr-2" />
              Driving Conditions
            </button>
            <button 
              className={`px-4 py-2 rounded-md flex items-center ${
                selectedWeatherTab === 'vehicle-specific' 
                  ? 'bg-green-900/70 text-white' 
                  : 'bg-gray-800/70 text-gray-400 hover:bg-gray-700/70'
              }`}
              onClick={() => setSelectedWeatherTab('vehicle-specific')}
            >
              <Gauge className="h-4 w-4 mr-2" />
              My Vehicle Telemetry
            </button>
            <Link 
              to="/route-planner" 
              className="px-4 py-2 rounded-md bg-green-900/60 text-white flex items-center hover:bg-green-800/80 ml-auto"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Plan Drive Route
            </Link>
          </div>
        </div>
        
        {/* Weather Alert Banner (if active) */}
        {showWeatherAlert && weatherAlertData && (
          <div className="mb-8 bg-red-900/30 border border-red-800/50 rounded-lg p-4 animate-pulse">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-red-400 font-bold text-lg mb-1">
                  {weatherAlertData.alerts[0].event}
                </h3>
                <p className="text-gray-300 mb-2">{weatherAlertData.alerts[0].description}</p>
                <div className="flex text-sm text-gray-400">
                  <p className="mr-4">
                    <strong>Issued:</strong> {new Date(weatherAlertData.alerts[0].start * 1000).toLocaleString()}
                  </p>
                  <p>
                    <strong>Expires:</strong> {new Date(weatherAlertData.alerts[0].end * 1000).toLocaleString()}
                  </p>
                </div>
              </div>
              <button 
                className="ml-auto text-gray-400 hover:text-white p-1"
                onClick={() => setShowWeatherAlert(false)}
                aria-label="Dismiss alert"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Main Content - Conditional based on selected tab */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Always visible */}
          <div className={`${
            selectedWeatherTab === 'world-time' ? 'lg:col-span-5' : 'lg:col-span-8'
          }`}>
            {selectedWeatherTab === 'current' && (
              <WeatherStation expanded={true} />
            )}
            
            {selectedWeatherTab === 'driving-tips' && (
              <div className="bg-gradient-to-b from-gray-900 to-black p-6 rounded-xl border border-blue-500/20">
                <h2 className="text-2xl font-orbitron text-green-500 mb-4">CAR & DRIVING CONDITIONS</h2>
                <p className="text-gray-300 mb-6">
                  Current driving conditions and vehicle recommendations based on the latest weather data.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                    <h3 className="text-blue-400 font-medium mb-3 flex items-center">
                      <Car className="h-5 w-5 mr-2" />
                      Vehicle Systems to Check
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="bg-blue-900/30 p-1 rounded-md mr-3 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium text-white">Tire Pressure</span>
                          <p className="text-sm text-gray-400">Ensure all tires are at the recommended PSI for current weather</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-900/30 p-1 rounded-md mr-3 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium text-white">Wiper Blades</span>
                          <p className="text-sm text-gray-400">Verify wipers are in good condition and washer fluid is full</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-900/30 p-1 rounded-md mr-3 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium text-white">Lighting Systems</span>
                          <p className="text-sm text-gray-400">Check all exterior lights are functioning properly</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-900/30 p-1 rounded-md mr-3 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium text-white">Braking System</span>
                          <p className="text-sm text-gray-400">Test brakes gently to ensure proper function</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                    <h3 className="text-blue-400 font-medium mb-3 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Weather Impact on Driving
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-32 text-gray-400">Visibility</div>
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '80%' }}></div>
                        </div>
                        <div className="w-12 text-right text-green-500 font-medium">Good</div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-32 text-gray-400">Road Grip</div>
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '75%' }}></div>
                        </div>
                        <div className="w-12 text-right text-green-500 font-medium">Good</div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-32 text-gray-400">Wind Impact</div>
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500" style={{ width: '50%' }}></div>
                        </div>
                        <div className="w-12 text-right text-yellow-500 font-medium">Medium</div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-32 text-gray-400">Comfort</div>
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '90%' }}></div>
                        </div>
                        <div className="w-12 text-right text-green-500 font-medium">Great</div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <div className="flex items-center mb-2">
                          <MapPin className="h-4 w-4 text-blue-400 mr-2" />
                          <span className="text-gray-300">Recommended Speed Adjustments</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          Maintain normal speed on highways. Reduce speed by 5-10mph on winding roads due to moderate wind conditions.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Weather-specific Driving Tips */}
                <div className="bg-gray-900/60 p-5 rounded-lg border border-blue-900/30">
                  <h3 className="text-xl text-blue-400 font-orbitron mb-4">TODAY'S DRIVING TIPS</h3>
                  
                  <ul className="space-y-3">
                    {carDrivingTips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <div className="bg-green-900/20 text-green-500 p-1 rounded-md mr-3 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="text-gray-200">{tip}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Weather Station Component with expanded mode */}
            {selectedWeatherTab === 'world-time' && (
              <WeatherStation expanded={false} />
            )}
            
            {/* Vehicle-Specific Weather Impacts Tab */}
            {selectedWeatherTab === 'vehicle-specific' && (
              <div className="bg-gradient-to-b from-gray-900 to-black p-6 rounded-xl border border-green-500/20">
                <h2 className="text-2xl font-orbitron text-green-500 mb-4">YOUR VEHICLE TELEMETRY</h2>
                <p className="text-gray-300 mb-6">
                  Weather impact on your specific vehicle based on your stored modifications and the current conditions.
                </p>
                
                {userVehicles.length > 0 ? (
                  <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div className="flex items-center">
                        <Car className="h-6 w-6 text-green-400 mr-3" />
                        <div>
                          <h3 className="text-xl font-medium">
                            {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {vehicleModifications.length > 0 
                              ? `${vehicleModifications.length} modification${vehicleModifications.length !== 1 ? 's' : ''} installed` 
                              : 'No modifications recorded'}
                          </p>
                        </div>
                      </div>
                      
                      <select 
                        className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 w-full md:w-auto"
                        value={selectedVehicle?.id}
                        onChange={(e) => {
                          const vehicle = userVehicles.find(v => v.id === e.target.value);
                          if (vehicle) {
                            setSelectedVehicle(vehicle);
                            vehicleDataService.getModifications(vehicle.id).then(mods => {
                              setVehicleModifications(mods);
                              calculateVehicleWeatherMetrics(vehicle, mods);
                            });
                          }
                        }}
                      >
                        {userVehicles.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.year} {v.make} {v.model}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Weather Vehicle Impact Analyzer */}
                    <div className="mb-6">
                      <WeatherVehicleImpactAnalyzer 
                        vehicle={selectedVehicle}
                        modifications={vehicleModifications}
                        weatherData={{
                          main: { temp: 68, humidity: 45 }, // This would be from actual weather API
                          weather: [{ main: 'Clear' }], // This would be from actual weather API
                          wind: { speed: 5 }  // This would be from actual weather API
                        }}
                        tireHeatingTrends={tireHeatingTrends}
                        engineWarmUpTime={engineWarmUpTime}
                        engineCooldownTime={engineCooldownTime}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {/* Tire Heating Trends Card */}
                      <div className="bg-black/40 rounded-lg overflow-hidden border border-blue-900/20">
                        <div className="px-4 py-3 bg-gradient-to-r from-gray-900 to-blue-900/30 flex items-center">
                          <Flame className="h-5 w-5 text-orange-500 mr-2" />
                          <h4 className="text-lg font-medium">Tire Heating Analysis</h4>
                        </div>
                        
                        <div className="p-4">
                          <p className="text-sm text-gray-400 mb-4">
                            Based on your {vehicleModifications.find(m => 
                              m.category?.toLowerCase().includes('tire') || 
                              m.name?.toLowerCase().includes('tire')
                            )?.name || 'stock tires'} and current weather conditions
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Front Left */}
                            <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-800">
                              <div className="flex justify-between items-center mb-1">
                                <div className="text-sm text-gray-400">Front Left</div>
                                <div className="flex items-center text-xs">
                                  <ChevronsUp className="h-3 w-3 text-red-400 mr-1" />
                                  <span className="text-red-400">{tireHeatingTrends.frontLeft.heatRate.toFixed(1)}°/min</span>
                                </div>
                              </div>
                              
                              <div className="flex items-end">
                                <div className="text-2xl font-medium">{tireHeatingTrends.frontLeft.current.toFixed(1)}°</div>
                                <div className="text-xs text-gray-500 ml-1 mb-1">/ {tireHeatingTrends.frontLeft.optimal}° optimal</div>
                              </div>
                              
                              <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    tireHeatingTrends.frontLeft.current < tireHeatingTrends.frontLeft.optimal * 0.8
                                      ? 'bg-blue-500' 
                                      : tireHeatingTrends.frontLeft.current > tireHeatingTrends.frontLeft.optimal * 1.1
                                        ? 'bg-red-500'
                                        : 'bg-green-500'
                                  }`}
                                  style={{ 
                                    width: `${Math.min((tireHeatingTrends.frontLeft.current / tireHeatingTrends.frontLeft.optimal) * 100, 100)}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Front Right */}
                            <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-800">
                              <div className="flex justify-between items-center mb-1">
                                <div className="text-sm text-gray-400">Front Right</div>
                                <div className="flex items-center text-xs">
                                  <ChevronsUp className="h-3 w-3 text-red-400 mr-1" />
                                  <span className="text-red-400">{tireHeatingTrends.frontRight.heatRate.toFixed(1)}°/min</span>
                                </div>
                              </div>
                              
                              <div className="flex items-end">
                                <div className="text-2xl font-medium">{tireHeatingTrends.frontRight.current.toFixed(1)}°</div>
                                <div className="text-xs text-gray-500 ml-1 mb-1">/ {tireHeatingTrends.frontRight.optimal}° optimal</div>
                              </div>
                              
                              <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    tireHeatingTrends.frontRight.current < tireHeatingTrends.frontRight.optimal * 0.8
                                      ? 'bg-blue-500' 
                                      : tireHeatingTrends.frontRight.current > tireHeatingTrends.frontRight.optimal * 1.1
                                        ? 'bg-red-500'
                                        : 'bg-green-500'
                                  }`}
                                  style={{ 
                                    width: `${Math.min((tireHeatingTrends.frontRight.current / tireHeatingTrends.frontRight.optimal) * 100, 100)}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Rear Left */}
                            <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-800">
                              <div className="flex justify-between items-center mb-1">
                                <div className="text-sm text-gray-400">Rear Left</div>
                                <div className="flex items-center text-xs">
                                  <ChevronsUp className="h-3 w-3 text-orange-400 mr-1" />
                                  <span className="text-orange-400">{tireHeatingTrends.rearLeft.heatRate.toFixed(1)}°/min</span>
                                </div>
                              </div>
                              
                              <div className="flex items-end">
                                <div className="text-2xl font-medium">{tireHeatingTrends.rearLeft.current.toFixed(1)}°</div>
                                <div className="text-xs text-gray-500 ml-1 mb-1">/ {tireHeatingTrends.rearLeft.optimal}° optimal</div>
                              </div>
                              
                              <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    tireHeatingTrends.rearLeft.current < tireHeatingTrends.rearLeft.optimal * 0.8
                                      ? 'bg-blue-500' 
                                      : tireHeatingTrends.rearLeft.current > tireHeatingTrends.rearLeft.optimal * 1.1
                                        ? 'bg-red-500'
                                        : 'bg-green-500'
                                  }`}
                                  style={{ 
                                    width: `${Math.min((tireHeatingTrends.rearLeft.current / tireHeatingTrends.rearLeft.optimal) * 100, 100)}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Rear Right */}
                            <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-800">
                              <div className="flex justify-between items-center mb-1">
                                <div className="text-sm text-gray-400">Rear Right</div>
                                <div className="flex items-center text-xs">
                                  <ChevronsUp className="h-3 w-3 text-orange-400 mr-1" />
                                  <span className="text-orange-400">{tireHeatingTrends.rearRight.heatRate.toFixed(1)}°/min</span>
                                </div>
                              </div>
                              
                              <div className="flex items-end">
                                <div className="text-2xl font-medium">{tireHeatingTrends.rearRight.current.toFixed(1)}°</div>
                                <div className="text-xs text-gray-500 ml-1 mb-1">/ {tireHeatingTrends.rearRight.optimal}° optimal</div>
                              </div>
                              
                              <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    tireHeatingTrends.rearRight.current < tireHeatingTrends.rearRight.optimal * 0.8
                                      ? 'bg-blue-500' 
                                      : tireHeatingTrends.rearRight.current > tireHeatingTrends.rearRight.optimal * 1.1
                                        ? 'bg-red-500'
                                        : 'bg-green-500'
                                  }`}
                                  style={{ 
                                    width: `${Math.min((tireHeatingTrends.rearRight.current / tireHeatingTrends.rearRight.optimal) * 100, 100)}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-400 border-t border-gray-800 pt-3 mt-2">
                            <strong>Today's conditions:</strong> {
                              tireHeatingTrends.frontLeft.current < tireHeatingTrends.frontLeft.optimal * 0.7
                                ? "Tires will take longer to reach optimal temperature. Consider extended warm-up driving before aggressive cornering."
                                : tireHeatingTrends.frontLeft.current > tireHeatingTrends.frontLeft.optimal * 0.9
                                  ? "Tires will reach optimal temperature quickly. Monitor for overheating during extended high-speed driving."
                                  : "Ideal conditions for balanced tire heating. Maintain consistent driving style for even wear."
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Engine Timing Analysis Card */}
                      <div className="bg-black/40 rounded-lg overflow-hidden border border-blue-900/20">
                        <div className="px-4 py-3 bg-gradient-to-r from-gray-900 to-blue-900/30 flex items-center">
                          <Timer className="h-5 w-5 text-blue-500 mr-2" />
                          <h4 className="text-lg font-medium">Engine Timing Analysis</h4>
                        </div>
                        
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Engine Warm-Up */}
                            <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-800">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-white flex items-center">
                                  <ArrowUp className="h-4 w-4 text-amber-500 mr-2" />
                                  Engine Warm-Up Time
                                </h5>
                                <div className="text-xl font-mono text-amber-500">
                                  {engineWarmUpTime.estimatedMinutes.toFixed(1)} min
                                </div>
                              </div>
                              
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Ambient: {engineWarmUpTime.ambientTemp}°F</span>
                                <span>Target: {engineWarmUpTime.targetTemp}°F</span>
                              </div>
                              
                              <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-amber-500" 
                                  style={{ width: `${Math.min(engineWarmUpTime.ambientTemp / engineWarmUpTime.targetTemp * 100, 100)}%` }}>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-400">
                                {engineWarmUpTime.weatherAdjustment < 0.9 
                                  ? "Current warm weather accelerates engine warm-up." 
                                  : engineWarmUpTime.weatherAdjustment > 1.2
                                    ? "Cold weather significantly extends warm-up time."
                                    : "Normal warm-up conditions."}
                                {' '}
                                {engineMod ? `Your ${engineMod.name} modification affects warm-up characteristics.` : ''}
                              </p>
                            </div>
                            
                            {/* Engine Cooldown */}
                            <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-800">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-white flex items-center">
                                  <Snowflake className="h-4 w-4 text-blue-500 mr-2" />
                                  Engine Cooldown Time
                                </h5>
                                <div className="text-xl font-mono text-blue-500">
                                  {engineCooldownTime.estimatedMinutes.toFixed(1)} min
                                </div>
                              </div>
                              
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>From: {engineCooldownTime.currentTemp}°F</span>
                                <span>To: {engineCooldownTime.targetTemp}°F</span>
                              </div>
                              
                              <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
                                <div className="h-full bg-gradient-to-r from-red-500 to-blue-500" 
                                  style={{ width: '100%' }}>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-400">
                                {engineCooldownTime.weatherAdjustment > 1.2 
                                  ? "Hot ambient conditions extend cooling time." 
                                  : engineCooldownTime.weatherAdjustment < 0.9
                                    ? "Cool weather accelerates engine cooling."
                                    : "Standard cooling conditions."}
                                {' '}After driving, allow {Math.ceil(engineCooldownTime.estimatedMinutes)} minutes before covering vehicle.
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 bg-blue-900/20 p-3 rounded-lg">
                            <h5 className="text-blue-400 flex items-center text-sm mb-2">
                              <Zap className="h-4 w-4 mr-2" />
                              Engine Performance Notes
                            </h5>
                            <p className="text-sm text-gray-300">
                              {engineWarmUpTime.ambientTemp < 40 
                                ? "Cold starting requires extended warm-up. Consider using block heater if equipped." 
                                : engineWarmUpTime.ambientTemp > 90
                                  ? "Hot weather increases risk of vapor lock in carbureted engines. Monitor temperature gauges closely."
                                  : "Current temperatures are optimal for engine performance."}
                              {' '}
                              {vehicleModifications.some(m => m.name?.toLowerCase().includes('turbo'))
                                ? "Your turbo modification will benefit from gentle driving until oil temperature is at operating level."
                                : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-gray-900/40 p-4 rounded-lg border border-gray-800">
                      <h4 className="flex items-center text-green-400 font-medium mb-3">
                        <Settings className="h-5 w-5 mr-2" />
                        Weather-Adjusted Vehicle Settings
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-black/30 p-3 rounded-lg">
                          <h5 className="text-sm text-gray-300 mb-2">Tire Pressure Recommendation</h5>
                          <div className="grid grid-cols-2 gap-2 text-center mb-2">
                            <div>
                              <div className="text-xs text-gray-500">Front</div>
                              <div className="text-lg font-medium">{tirePressureRecommendations.front.cold} psi</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Rear</div>
                              <div className="text-lg font-medium">{tirePressureRecommendations.rear.cold} psi</div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">
                            {tirePressureRecommendations.adjustmentNeeded 
                              ? "Current weather conditions suggest pressure adjustment."
                              : "Standard pressure is optimal for today's conditions."
                            }
                          </p>
                        </div>
                        
                        <div className="bg-black/30 p-3 rounded-lg">
                          <h5 className="text-sm text-gray-300 mb-2">Lug Nut Torque Setting</h5>
                          <div className="text-center mb-2">
                            <div className="text-lg font-medium">{lugNutTorqueSettings.recommended} ft-lbs</div>
                            <div className="text-xs text-gray-500">
                              {lugNutTorqueSettings.weatherAdjusted ? "Weather adjusted" : "Standard setting"}
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">
                            Always use a calibrated torque wrench in a star pattern.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 bg-gray-900/30 rounded-lg text-center">
                    <Car className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-xl font-medium text-gray-400 mb-2">No Vehicles Found</h3>
                    <p className="text-gray-500 mb-6">Add your vehicles in the Garage Vault to see personalized weather metrics.</p>
                    
                    <Link 
                      to="/garage-vault" 
                      className="px-4 py-2 bg-green-900/30 text-green-500 rounded border border-green-900/50 inline-flex items-center hover:bg-green-900/50 transition-colors"
                    >
                      <Car className="h-4 w-4 mr-2" />
                      Go to Garage Vault
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Right Column - Variable content based on selected tab */}
          <div className={`${
            selectedWeatherTab === 'world-time' ? 'lg:col-span-7' : 'lg:col-span-4'
          }`}>
            {selectedWeatherTab === 'current' && (
              <>
                {/* World Clock */}
                <div className="mb-8">
                  <WorldClock compact={true} />
                </div>
                
                {/* Supplementary Weather Info */}
                <div className="bg-gray-900/30 p-5 rounded-xl border border-blue-900/20">
                  <h3 className="text-xl font-medium text-blue-400 mb-4">Track & Surface Analytics</h3>
                  
                  {/* Vehicle type selector */}
                  <div className="mb-6 pb-4 border-b border-gray-800">
                    <label className="block text-gray-400 text-sm mb-2">Vehicle Type</label>
                    <div className="flex flex-wrap gap-2">
                      {['sports', 'luxury', 'track', 'SUV'].map(type => (
                        <button
                          key={type}
                          className={`px-3 py-1.5 text-sm rounded ${
                            selectedVehicleType === type
                              ? 'bg-green-900 text-green-400 border border-green-800'
                              : 'bg-gray-800 text-gray-400 border border-gray-700'
                          }`}
                          onClick={() => setSelectedVehicleType(type)}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Surface Temperature Analysis */}
                    <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-white font-medium flex items-center">
                          <Thermometer className="h-5 w-5 text-blue-400 mr-2" />
                          Surface Temperature
                        </h4>
                        <span className="text-xl text-blue-400 font-orbitron">{surfaceTemp}°F</span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Cold</span>
                          <span>Optimal</span>
                          <span>Hot</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden relative">
                          <div className="absolute inset-0 flex">
                            <div className="bg-blue-600" style={{ width: '33%' }}></div>
                            <div className="bg-green-600" style={{ width: '34%' }}></div>
                            <div className="bg-red-600" style={{ width: '33%' }}></div>
                          </div>
                          <div 
                            className="absolute h-full w-1 bg-white"
                            style={{ 
                              left: `${Math.min(Math.max((surfaceTemp - 32) / (130 - 32) * 100, 0), 100)}%`,
                              transform: 'translateX(-50%)'
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-300">
                        <div><strong>Driving Impact:</strong> Optimal surface temperature for performance tires. Expect good traction and predictable handling.</div>
                        <div className="mt-1"><strong>Tire Life Impact:</strong> Moderate wear expected at this temperature. Rotate tires every 5,000-7,000 miles.</div>
                      </div>
                    </div>
                    
                    {/* Track Grip Level */}
                    <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-white font-medium flex items-center">
                          <Disc className="h-5 w-5 text-blue-400 mr-2" />
                          Track Grip Level
                        </h4>
                        <span className="text-xl text-green-500 font-orbitron">{trackGripLevel}%</span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Low</span>
                          <span>Medium</span>
                          <span>High</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" 
                            style={{ width: `${trackGripLevel}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-300">
                        <div><strong>Driver Notes:</strong> Excellent grip conditions. Perfect for spirited driving or performance testing.</div>
                        <div className="mt-1"><strong>Line Choice:</strong> Standard racing line is optimal. No need for alternate wet lines.</div>
                      </div>
                    </div>
                    
                    {/* Tire Pressure Recommendations */}
                    <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium flex items-center">
                          <Gauge className="h-5 w-5 text-blue-400 mr-2" />
                          Tire Pressure Settings
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          tirePressureRecommendations.adjustmentNeeded 
                            ? 'bg-yellow-900/50 text-yellow-400' 
                            : 'bg-green-900/50 text-green-400'
                        }`}>
                          {tirePressureRecommendations.adjustmentNeeded ? 'Adjustment Recommended' : 'Optimal'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-gray-900 rounded p-2">
                          <div className="text-xs text-gray-400 mb-1">Front Tires (PSI)</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-center">
                              <div className="text-xs text-gray-500">Cold</div>
                              <div className="text-lg text-white font-medium">{tirePressureRecommendations.front.cold}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500">Hot</div>
                              <div className="text-lg text-white font-medium">{tirePressureRecommendations.front.hot}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-900 rounded p-2">
                          <div className="text-xs text-gray-400 mb-1">Rear Tires (PSI)</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-center">
                              <div className="text-xs text-gray-500">Cold</div>
                              <div className="text-lg text-white font-medium">{tirePressureRecommendations.rear.cold}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500">Hot</div>
                              <div className="text-lg text-white font-medium">{tirePressureRecommendations.rear.hot}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-300">
                        <p><strong>Weather Impact:</strong> Current temperature/humidity requires no adjustment from standard settings.</p>
                        <p className="mt-1"><strong>Performance Note:</strong> Check tire temperatures across tread after spirited driving to ensure even wear pattern.</p>
                      </div>
                    </div>
                    
                    {/* Lug Nut Torque Settings */}
                    <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium flex items-center">
                          <Wrench className="h-5 w-5 text-blue-400 mr-2" />
                          Lug Nut Torque Settings
                        </h4>
                        <span className="text-xl text-blue-400 font-orbitron">{lugNutTorqueSettings.recommended} ft-lbs</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-gray-900 rounded p-2 text-center">
                          <div className="text-xs text-gray-400 mb-1">Standard Wheels</div>
                          <div className="text-lg text-white font-medium">{lugNutTorqueSettings.standard} ft-lbs</div>
                        </div>
                        
                        <div className="bg-gray-900 rounded p-2 text-center">
                          <div className="text-xs text-gray-400 mb-1">Aluminum Wheels</div>
                          <div className="text-lg text-white font-medium">{lugNutTorqueSettings.aluminum} ft-lbs</div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-300">
                        <div><strong>Weather Advisory:</strong> {lugNutTorqueSettings.weatherAdjusted ? 
                          'Torque settings adjusted for current temperature conditions.' : 
                          'Standard torque settings are appropriate for current conditions.'}
                        </div>
                        <div className="mt-1"><strong>Track Day Protocol:</strong> Re-check torque after first heat cycle if participating in high-performance driving.</div>
                      </div>
                      
                      <div className="mt-3 p-2 bg-blue-900/20 rounded text-sm">
                        <div className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <p className="text-blue-300">Always use a calibrated torque wrench in a star pattern when tightening lug nuts.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {selectedWeatherTab === 'world-time' && (
              <div className="bg-gradient-to-b from-gray-900 to-black p-6 rounded-xl border border-blue-500/20">
                <h2 className="text-2xl font-orbitron text-green-500 mb-4">GLOBAL RACE TRACK TIME</h2>
                <p className="text-gray-300 mb-6">
                  Monitor time across major international racing venues and car capitals. Perfect for planning international calls, race viewing, or auction participation.
                </p>
                
                {/* Full World Clock Component */}
                <WorldClock />
                
                {/* Race Track Times Section */}
                <div className="mt-8 pt-6 border-t border-gray-800/50">
                  <h3 className="text-xl text-blue-400 font-medium mb-4">F1 Race Schedule Countdown</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-black/30 rounded-lg border border-green-900/30">
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center">
                          <span className="text-white font-medium">Monaco Grand Prix</span>
                          <span className="ml-2 text-xs bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded">NEXT RACE</span>
                        </div>
                        <span className="text-gray-400">May 26, 2025</span>
                      </div>
                      <div className="flex space-x-3 mt-3">
                        <div className="flex-1 bg-gray-900 p-2 rounded text-center">
                          <div className="text-xl font-mono text-green-500">28</div>
                          <div className="text-xs text-gray-400">DAYS</div>
                        </div>
                        <div className="flex-1 bg-gray-900 p-2 rounded text-center">
                          <div className="text-xl font-mono text-green-500">14</div>
                          <div className="text-xs text-gray-400">HOURS</div>
                        </div>
                        <div className="flex-1 bg-gray-900 p-2 rounded text-center">
                          <div className="text-xl font-mono text-green-500">22</div>
                          <div className="text-xs text-gray-400">MINUTES</div>
                        </div>
                        <div className="flex-1 bg-gray-900 p-2 rounded text-center">
                          <div className="text-xl font-mono text-green-500">07</div>
                          <div className="text-xs text-gray-400">SECONDS</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-black/30 rounded-lg border border-gray-800/30">
                      <div className="flex justify-between mb-2">
                        <span className="text-white font-medium">Canadian Grand Prix</span>
                        <span className="text-gray-400">June 8, 2025</span>
                      </div>
                      <div className="flex space-x-3 mt-3">
                        <div className="flex-1 bg-gray-900 p-2 rounded text-center">
                          <div className="text-xl font-mono text-blue-500">41</div>
                          <div className="text-xs text-gray-400">DAYS</div>
                        </div>
                        <div className="flex-1 bg-gray-900 p-2 rounded text-center">
                          <div className="text-xl font-mono text-blue-500">08</div>
                          <div className="text-xs text-gray-400">HOURS</div>
                        </div>
                        <div className="flex-1 bg-gray-900 p-2 rounded text-center">
                          <div className="text-xl font-mono text-blue-500">35</div>
                          <div className="text-xs text-gray-400">MINUTES</div>
                        </div>
                        <div className="flex-1 bg-gray-900 p-2 rounded text-center">
                          <div className="text-xl font-mono text-blue-500">42</div>
                          <div className="text-xs text-gray-400">SECONDS</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {selectedWeatherTab === 'driving-tips' && (
              <div className="space-y-6">
                <div className="bg-gray-900/30 p-5 rounded-xl border border-blue-900/20">
                  <h3 className="text-xl font-medium text-blue-400 mb-4">Weather-Specific Car Care</h3>
                  
                  <div className="space-y-4">
                    <div className="p-3 bg-black/30 rounded-lg">
                      <h4 className="text-white flex items-center">
                        <Sun className="h-4 w-4 text-yellow-500 mr-2" />
                        Sunny Day Tips
                      </h4>
                      <ul className="mt-2 text-sm text-gray-300 space-y-1">
                        <li>• Use UV protectant on dashboard and interior surfaces</li>
                        <li>• Check A/C system before high temperature days</li>
                        <li>• Park in shade when possible to protect interior</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-black/30 rounded-lg">
                      <h4 className="text-white flex items-center">
                        <CloudRain className="h-4 w-4 text-blue-500 mr-2" />
                        Rainy Day Tips
                      </h4>
                      <ul className="mt-2 text-sm text-gray-300 space-y-1">
                        <li>• Apply rain repellent to windshield monthly</li>
                        <li>• Replace wiper blades every 6-12 months</li>
                        <li>• Check tire tread for adequate wet traction</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-black/30 rounded-lg">
                      <h4 className="text-white flex items-center">
                        <Wind className="h-4 w-4 text-cyan-500 mr-2" />
                        Windy Day Tips
                      </h4>
                      <ul className="mt-2 text-sm text-gray-300 space-y-1">
                        <li>• Keep both hands firmly on steering wheel</li>
                        <li>• Be cautious when opening doors to prevent damage</li>
                        <li>• Park away from trees and construction sites</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900/30 p-5 rounded-xl border border-blue-900/20">
                  <h3 className="text-xl font-medium text-blue-400 mb-4">Seasonal Maintenance</h3>
                  
                  <div className="relative pl-8 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-900/50">
                    <div className="relative mb-6">
                      <div className="absolute left-[-30px] top-0 w-6 h-6 rounded-full bg-green-900/30 border border-green-500/50 flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <h4 className="text-green-500 font-medium">Spring</h4>
                      <ul className="mt-2 text-sm text-gray-300 space-y-1">
                        <li>• Check and replace winter-worn wiper blades</li>
                        <li>• Inspect suspension after winter pothole season</li>
                        <li>• Clean undercarriage to remove winter salt buildup</li>
                      </ul>
                    </div>
                    
                    <div className="relative mb-6">
                      <div className="absolute left-[-30px] top-0 w-6 h-6 rounded-full bg-yellow-900/30 border border-yellow-500/50 flex items-center justify-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      <h4 className="text-yellow-500 font-medium">Summer</h4>
                      <ul className="mt-2 text-sm text-gray-300 space-y-1">
                        <li>• Check A/C system performance and refrigerant</li>
                        <li>• Monitor coolant levels and cooling system</li>
                        <li>• Apply UV protection to interior surfaces</li>
                      </ul>
                    </div>
                    
                    <div className="relative mb-6">
                      <div className="absolute left-[-30px] top-0 w-6 h-6 rounded-full bg-orange-900/30 border border-orange-500/50 flex items-center justify-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      </div>
                      <h4 className="text-orange-500 font-medium">Fall</h4>
                      <ul className="mt-2 text-sm text-gray-300 space-y-1">
                        <li>• Test battery and charging system</li>
                        <li>• Check heater and defrost functionality</li>
                        <li>• Apply rain repellent for wet season</li>
                      </ul>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute left-[-30px] top-0 w-6 h-6 rounded-full bg-blue-900/30 border border-blue-500/50 flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <h4 className="text-blue-500 font-medium">Winter</h4>
                      <ul className="mt-2 text-sm text-gray-300 space-y-1">
                        <li>• Switch to winter tires when temp drops below 45°F</li>
                        <li>• Check antifreeze concentration and condition</li>
                        <li>• Replace wiper blades with winter-specific ones</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;