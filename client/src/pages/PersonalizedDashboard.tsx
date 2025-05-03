import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import F1TelemetryWeatherStation from '../components/F1TelemetryWeatherStation';
import MoodEnergyTracker from '../components/MoodEnergyTracker.jsx';
import WorldClockPanel from '../components/WorldClockPanel';
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuthContext } from '../hooks/useAuthContext';
import { useToast } from "@/hooks/use-toast";

// Mock user data for demo purposes - this will be merged with actual user data when available
const mockUserData = {
  location: 'Charlotte, NC',
  memberLevel: 'Redline Racer',
  memberPoints: 752,
  pointsToNextLevel: 248,
  nextLevel: 'Grid King',
  memberSince: '2023-10-15',
  drivingStyle: 'Track Day Enthusiast',
  bio: 'From daily driver to weekend warrior. Building my dream garage one car at a time. Addicted to the rush of track days and the beauty of fine timepieces.',
  vehicles: [
    { id: 1, make: 'BMW', model: 'M3', year: 2009, nickname: 'E93', imageUrl: 'https://www.bmwusa.com/content/dam/bmwusa/M-Model-Vehicles/2018/BMW-M4-Convertible/BMW-MY18-MPerformance-Header-M3-Convertible-Desktop.jpg', mileage: 85720, lastServiceDate: '2025-03-15', healthScore: 92 },
    { id: 2, make: 'Audi', model: 'R8 V10', year: 2014, nickname: 'Iron Man', imageUrl: 'https://www.pngmart.com/files/22/Audi-R8-PNG-Photo.png', mileage: 42150, lastServiceDate: '2025-04-02', healthScore: 97 },
    { id: 3, make: 'BMW', model: 'M3', year: 2021, nickname: 'G80', imageUrl: 'https://www.ccarprice.com/products/BMW-M3-Competition-Sedan-2021.jpg', mileage: 18325, lastServiceDate: '2025-03-28', healthScore: 99 }
  ],
  watches: [
    { id: 1, brand: 'Rolex', model: 'Daytona', year: 2022, imageUrl: 'https://content.rolex.com/dam/2022-11/upright-bba-with-shadow/m126500ln-0001.png', purchaseDate: '2023-06-15', value: 38500 }
  ],
  upcomingEvents: [
    { id: 1, title: 'Carolina Cars & Coffee', date: '2025-05-03', location: 'Charlotte, NC', attending: 'confirmed', attendees: 187 },
    { id: 2, title: 'Track Day - VIR', date: '2025-05-15', location: 'Virginia International Raceway', attending: 'confirmed', attendees: 42 },
    { id: 3, title: 'Luxury Timepiece Exhibition', date: '2025-05-22', location: 'Ritz-Carlton, Charlotte', attending: 'pending', attendees: 65 }
  ],
  maintenanceAlerts: [
    { id: 1, vehicleId: 1, type: 'Oil Change', dueDate: '2025-05-10', priority: 'high', estimatedCost: 120 },
    { id: 2, vehicleId: 2, type: 'Tire Rotation', dueDate: '2025-05-05', priority: 'medium', estimatedCost: 85 }
  ],
  recentManifestationProgress: [
    { id: 1, goal: 'Beach House', progress: 3, target: 100, emoji: '🏡', targetAmount: 1250000, savedAmount: 37500, monthlyContribution: 2500, projectedDate: '2034-06-15' },
    { id: 2, goal: 'Patek Philippe', progress: 32, target: 100, emoji: '⌚', targetAmount: 72000, savedAmount: 23040, monthlyContribution: 1500, projectedDate: '2026-11-30' }
  ],
  dailyDisciplines: [
    { id: 1, type: 'Mental', streak: 12, lastCompleted: '2025-04-27', totalCompletions: 347 },
    { id: 2, type: 'Physical', streak: 8, lastCompleted: '2025-04-27', totalCompletions: 256 },
    { id: 3, type: 'Gratitude', streak: 21, lastCompleted: '2025-04-28', totalCompletions: 412 }
  ],
  recentActivity: [
    { id: 1, type: 'drive', description: 'Logged 183 mile drive in G80', date: '2025-04-26', details: { route: 'Blue Ridge Parkway', duration: '4.5 hours' } },
    { id: 2, type: 'maintenance', description: 'Added tire rotation for R8', date: '2025-04-24', details: { cost: 85, location: 'Performance Auto Care' } },
    { id: 3, type: 'manifestation', description: 'Updated Patek Philippe goal', date: '2025-04-22', details: { oldAmount: 70000, newAmount: 72000 } },
    { id: 4, type: 'event', description: 'RSVP\'d to Track Day at VIR', date: '2025-04-20', details: { eventDate: '2025-05-15', cost: 350 } },
    { id: 5, type: 'purchase', description: 'New racing harness for E93', date: '2025-04-18', details: { item: 'Schroth Profi II 6-point', cost: 429 } }
  ],
  badges: [
    { id: 1, name: 'Track Day Veteran', description: 'Completed 10+ track days', icon: '🏁', earnedDate: '2024-09-15', rarity: 'uncommon' },
    { id: 2, name: '1000 Mile Club', description: 'Logged over 1000 miles in your drives', icon: '🛣️', earnedDate: '2024-12-03', rarity: 'common' },
    { id: 3, name: 'Consistency Champion', description: 'Maintained a 20+ day streak in daily disciplines', icon: '🏆', earnedDate: '2025-04-26', rarity: 'rare' }
  ],
  driveStats: [
    { month: 'Nov', miles: 423 },
    { month: 'Dec', miles: 512 },
    { month: 'Jan', miles: 384 },
    { month: 'Feb', miles: 290 },
    { month: 'Mar', miles: 578 },
    { month: 'Apr', miles: 683 }
  ],
  manifestationHistory: [
    { month: 'Nov', amount: 16250 },
    { month: 'Dec', amount: 17750 },
    { month: 'Jan', amount: 19250 },
    { month: 'Feb', amount: 19500 },
    { month: 'Mar', amount: 21500 },
    { month: 'Apr', amount: 23040 }
  ],
  favoriteRoutes: [
    { id: 1, name: 'Blue Ridge Parkway Loop', distance: '187 miles', lastDriven: '2025-04-26', rating: 5 },
    { id: 2, name: 'Tail of the Dragon', distance: '11 miles', lastDriven: '2025-03-14', rating: 5 },
    { id: 3, name: 'Charlotte Skyline Drive', distance: '28 miles', lastDriven: '2025-04-15', rating: 4 }
  ]
};

const PersonalizedDashboard: React.FC = () => {
  const { toast } = useToast();
  
  // Authentication check - use try/catch to handle when auth context isn't available
  let userInfo = { user: null, isAuthenticated: false, displayName: 'Driver' };
  
  try {
    const authContext = useAuthContext();
    const user = authContext?.user;
    
    if (user) {
      userInfo = {
        user,
        isAuthenticated: true,
        displayName: user.fullName || user.username || 'Driver'
      };
    } else {
      // Show toast for unauthenticated users
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your dashboard",
        variant: "default",
        className: "bg-blue-700 border-blue-500",
      });
      
      // Return redirect component for unauthenticated users
      return <Navigate to="/auth" replace />;
    }
  } catch (error) {
    console.error('Auth context error:', error);
    
    // Show toast for context errors
    toast({
      title: "Authentication Error",
      description: "Please sign in to access your dashboard",
      variant: "default",
      className: "bg-blue-700 border-blue-500",
    });
    
    // Return redirect component for context errors
    return <Navigate to="/auth" replace />;
  }
  
  // Destructure for easier use in component
  const { user, displayName } = userInfo;
  
  // Component state
  const [userData, setUserData] = useState(mockUserData);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [mergedUserData, setMergedUserData] = useState({
    ...mockUserData, 
    name: displayName // Use authenticated user's name
  });
  
  // Load saved vehicle from onboarding
  useEffect(() => {
    const savedVehicleProfileString = localStorage.getItem('vehicleProfile');
    if (savedVehicleProfileString) {
      try {
        const savedVehicleProfile = JSON.parse(savedVehicleProfileString);
        if (savedVehicleProfile) {
          // Create a vehicle object from the saved profile
          const onboardedVehicle = {
            id: userData.vehicles.length + 1, // Generate a new ID
            make: savedVehicleProfile.make || '',
            model: savedVehicleProfile.model || '',
            year: parseInt(savedVehicleProfile.year) || new Date().getFullYear(),
            nickname: savedVehicleProfile.nickname || '',
            imageUrl: savedVehicleProfile.vehicleImage || '/favicon.png', // Fallback to app icon
            mileage: parseInt(savedVehicleProfile.mileage) || 0,
            lastServiceDate: new Date().toISOString().split('T')[0], // Today's date
            healthScore: 95 // Default good health
          };
          
          // Update userData with the onboarded vehicle
          setUserData(prevData => ({
            ...prevData,
            vehicles: [onboardedVehicle, ...prevData.vehicles]
          }));
          
          // Also update merged user data
          setMergedUserData(prevData => ({
            ...prevData,
            vehicles: [onboardedVehicle, ...prevData.vehicles]
          }));
          
          toast({
            title: "Vehicle Loaded",
            description: `Your ${onboardedVehicle.year} ${onboardedVehicle.make} ${onboardedVehicle.model} has been added to your garage`,
            variant: "default",
          });
        }
      } catch (error) {
        console.error('Error parsing saved vehicle:', error);
      }
    }
  }, []);

  // Update user data when authentication changes
  useEffect(() => {
    if (user) {
      setMergedUserData(prevData => ({
        ...prevData,
        name: user.fullName || user.username || 'Driver'
      }));
    }
  }, [user]);

  // Time-based greeting effect
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
          <h1 className="bts-header text-4xl mb-2">{greeting}, {mergedUserData.name}</h1>
          <p className="text-gray-400">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} | {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Member Profile Banner */}
        <div className="bts-card mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden border-2 border-green-400">
                {mergedUserData.name ? mergedUserData.name.charAt(0) : ''}
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <h2 className="bts-header text-2xl mr-3">{mergedUserData.name}</h2>
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs uppercase font-bold">{userData.memberLevel}</span>
                </div>
                <p className="text-gray-400 text-sm">{userData.location} • {userData.drivingStyle}</p>
                <p className="text-gray-500 text-xs mt-1">Member since {new Date(userData.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} • {userData.memberPoints} Points</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <div className="flex items-center mb-2">
                <span className="text-xs text-gray-400 mr-2">{userData.memberPoints} / 1000 Points • {userData.pointsToNextLevel} to {userData.nextLevel}</span>
                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500" 
                    style={{ width: `${(userData.memberPoints / 1000) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link to="/settings/profile" className="bts-button !py-1 !px-3 text-sm">Edit Profile</Link>
                <Link to="/membership" className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-1 rounded text-sm font-medium">Membership Benefits</Link>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-black/30 p-3 rounded-lg border border-gray-800">
            <p className="text-gray-300 text-sm italic">{userData.bio}</p>
          </div>
        </div>

        {/* Grid Layout for Dashboard Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weather Widget - Spans 2 columns on large screens */}
          <div className="lg:col-span-2 bts-card">
            <h2 className="bts-header-green mb-4">F1-Inspired Weather & Drive Conditions</h2>
            <F1TelemetryWeatherStation />
          </div>
          
          {/* World Clock Panel - Full Width */}
          <div className="lg:col-span-3 bts-card">
            <h2 className="bts-header-green mb-4">World Clocks</h2>
            <WorldClockPanel />
          </div>
          
          {/* Mood & Energy Tracker - Full Width */}
          <div className="lg:col-span-3 bts-card">
            <h2 className="bts-header-green mb-4">Mood & Energy Tracker</h2>
            <MoodEnergyTracker 
              moodEnergyData={{
                mood: 4,
                energy: 3,
                focus: 4,
                confidence: 3,
                comfort: 5,
                trackFamiliarity: 3,
                excitementFactor: 4,
                stressLevel: 2
              }}
              onChange={(data) => console.log('Mood/Energy updated:', data)}
              isEditing={false}
            />
          </div>

          {/* Quick Actions Widget */}
          <div className="bts-card">
            <h2 className="bts-header-green mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/drive-journal" className="flex flex-col items-center bg-black/40 rounded-lg p-3 transition hover:bg-black/60">
                <span className="text-2xl mb-2">📝</span>
                <span className="text-white text-sm">Log a Drive</span>
              </Link>
              <Link to="/maintenance-log" className="flex flex-col items-center bg-black/40 rounded-lg p-3 transition hover:bg-black/60">
                <span className="text-2xl mb-2">🔧</span>
                <span className="text-white text-sm">Log Service</span>
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
                <Link to={`/vehicle-mods/${vehicle.id}`} key={vehicle.id} className="block p-3 bg-black/40 rounded-lg transition hover:bg-black/60">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden mr-4 flex-shrink-0 border border-gray-700">
                      <img src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-medium">{vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}</h3>
                          <p className="text-gray-400 text-sm">{vehicle.nickname ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : ''}</p>
                        </div>
                        <div className="flex items-center bg-black/30 px-2 py-1 rounded">
                          <span 
                            className={`w-2 h-2 rounded-full mr-1 ${
                              vehicle.healthScore > 90 ? 'bg-green-400' : 
                              vehicle.healthScore > 70 ? 'bg-yellow-400' : 
                              'bg-red-400'
                            }`}
                          ></span>
                          <span className="text-xs font-mono">{vehicle.healthScore}/100</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-500">{vehicle.mileage?.toLocaleString() || 0} miles</span>
                        <span className="text-gray-500">Last service: {new Date(vehicle.lastServiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              <Link to="/garage-vault" className="flex items-center justify-center p-3 bg-black/20 rounded-lg border border-dashed border-gray-700 transition hover:bg-black/40">
                <span className="text-green-400">+ Add Vehicle</span>
              </Link>
            </div>
          </div>
          
          {/* Watchbox Teaser */}
          <div className="bts-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="bts-header-green">Timepiece Collection</h2>
              <Link to="/tires-timepieces" className="text-sm text-green-400 hover:underline">View All</Link>
            </div>
            {userData.watches.length > 0 ? (
              <div className="space-y-4">
                {userData.watches.map(watch => (
                  <div key={watch.id} className="block p-3 bg-black/40 rounded-lg hover:bg-black/60 transition">
                    <Link to="/tires-timepieces" className="block">
                      <div className="flex items-center">
                        <div className="w-16 h-16 rounded-lg overflow-hidden mr-4 flex-shrink-0 border border-gray-700 bg-gray-900">
                          {watch.imageUrl && <img src={watch.imageUrl} alt={`${watch.brand} ${watch.model}`} className="w-full h-full object-contain" />}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-white font-medium">{watch.brand} {watch.model}</h3>
                              <p className="text-gray-400 text-sm">{watch.year}</p>
                            </div>
                            <div className="bg-black/30 px-2 py-1 rounded">
                              <span className="text-xs font-mono text-blue-300">${(watch.value || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="mt-3 pt-2 border-t border-gray-800 flex justify-between text-xs">
                      <span className="text-gray-500">Added: {new Date(watch.purchaseDate || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <Link to="/tires-timepieces" className="text-blue-400 hover:underline">View Details</Link>
                    </div>
                  </div>
                ))}
                <Link to="/tires-timepieces" className="flex items-center justify-center p-3 bg-black/20 rounded-lg border border-dashed border-gray-700 transition hover:bg-black/40">
                  <span className="text-green-400">+ Add Timepiece</span>
                </Link>
              </div>
            ) : (
              <div className="text-center p-6 bg-black/20 rounded-lg">
                <p className="text-gray-400">No timepieces added yet</p>
                <Link to="/tires-timepieces" className="mt-2 text-sm text-green-400 hover:underline block">Add Timepiece</Link>
              </div>
            )}
          </div>

          {/* Daily Disciplines */}
          <div className="bts-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="bts-header-green">Daily Disciplines</h2>
              <Link to="/daily-disciplines" className="text-sm text-green-400 hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {userData.dailyDisciplines.map(discipline => (
                <div key={discipline.id} className="p-3 bg-black/40 rounded-lg transition">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-white font-medium">{discipline.type}</h3>
                      <div className="flex items-center text-xs mt-1">
                        <span className="text-green-400 mr-2">🔥 {discipline.streak} day streak</span>
                        <span className="text-gray-500">{discipline.totalCompletions} total</span>
                      </div>
                    </div>
                    <Link to="/daily-disciplines" className="bg-black/30 hover:bg-black/50 px-3 py-2 rounded-lg text-white text-sm transition">Complete</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Drive Stats Chart */}
          <div className="lg:col-span-2 bts-card">
            <h2 className="bts-header-green mb-4">Driving Stats</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userData.driveStats}>
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} 
                    itemStyle={{ color: '#E5E7EB' }}
                    labelStyle={{ color: '#E5E7EB' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="miles" 
                    name="Miles" 
                    stroke="#08c519" 
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2, fill: '#000' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#08c519' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Manifestation Goals */}
          <div className="lg:col-span-3 bts-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="bts-header-green">Manifestation Goals</h2>
              <Link to="/manifestation-station" className="text-sm text-green-400 hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userData.recentManifestationProgress.map(goal => (
                <div key={goal.id} className="p-4 bg-black/30 rounded-lg border border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{goal.emoji}</span>
                      <h3 className="text-white font-medium">{goal.goal}</h3>
                    </div>
                    <span className="text-green-400 text-xs font-mono">${goal.savedAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}</span>
                  </div>
                  <Progress value={goal.progress} className="h-2 bg-gray-800" />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>${goal.monthlyContribution.toLocaleString()}/month</span>
                    <span>ETA: {new Date(goal.projectedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <Link to="/manifestation-station" className="bts-button">Set New Goal</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedDashboard;