import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import F1TelemetryWeatherStation from '../components/F1TelemetryWeatherStation';
import MoodEnergyTracker from '../components/MoodEnergyTracker.jsx';
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Mock user data for demo purposes
const mockUserData = {
  name: 'Alex',
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

        {/* Member Profile Banner */}
        <div className="bts-card mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden border-2 border-green-400">
                {userData.name.charAt(0)}
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <h2 className="bts-header text-2xl mr-3">{userData.name}</h2>
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
          
          {/* Mood & Energy Tracker - Full Width */}
          <div className="lg:col-span-3 bts-card">
            <h2 className="bts-header-green mb-4">Mood & Energy Tracker</h2>
            <MoodEnergyTracker />
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
              <Link to="/hustle-planner" className="text-sm text-green-400 hover:underline">Update</Link>
            </div>
            <div className="space-y-3">
              {userData.dailyDisciplines.map(discipline => {
                const isCompletedToday = new Date(discipline.lastCompleted).toDateString() === new Date().toDateString();
                return (
                  <div key={discipline.id} className="p-3 bg-black/40 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="mr-3 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                          {discipline.type === 'Mental' && <span>🧠</span>}
                          {discipline.type === 'Physical' && <span>💪</span>}
                          {discipline.type === 'Gratitude' && <span>🙏</span>}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{discipline.type}</h3>
                          <p className="text-gray-400 text-xs">
                            {discipline.streak} day{discipline.streak !== 1 ? 's' : ''} streak
                          </p>
                        </div>
                      </div>
                      {isCompletedToday ? (
                        <span className="text-green-400 text-2xl">✓</span>
                      ) : (
                        <Link to="/hustle-planner" className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs uppercase">
                          Complete
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
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

          {/* Drive Stats & Analytics */}
          <div className="bts-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="bts-header-green">Drive Analytics</h2>
              <Link to="/drive-journal" className="text-sm text-green-400 hover:underline">View History</Link>
            </div>
            <div className="bg-black/30 p-3 rounded-lg mb-4 border border-gray-800">
              <h3 className="text-white text-sm mb-2">Monthly Mileage - 6 Month Trend</h3>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userData.driveStats}>
                    <XAxis dataKey="month" stroke="#374151" tick={{ fill: '#9CA3AF' }} tickLine={{ stroke: '#374151' }} />
                    <YAxis stroke="#374151" tick={{ fill: '#9CA3AF' }} tickLine={{ stroke: '#374151' }} />
                    <Tooltip 
                      contentStyle={{ background: '#111111', border: '1px solid #374151' }}
                      labelStyle={{ color: '#E5E7EB' }}
                      formatter={(value) => [`${value} miles`, 'Distance']}
                    />
                    <Line type="monotone" dataKey="miles" stroke="#22c55e" strokeWidth={2} dot={{ stroke: '#22c55e', strokeWidth: 2, r: 3, fill: '#1F2937' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/30 p-3 rounded-lg border border-gray-800 flex flex-col">
                <span className="text-gray-400 text-xs">This Month</span>
                <span className="text-green-400 text-xl font-medium mt-1">683 miles</span>
                <span className="text-xs text-green-300 mt-1">↑ 18% from last month</span>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-gray-800 flex flex-col">
                <span className="text-gray-400 text-xs">2025 Total</span>
                <span className="text-blue-400 text-xl font-medium mt-1">1,935 miles</span>
                <span className="text-xs text-blue-300 mt-1">37% of yearly goal</span>
              </div>
            </div>
            <h3 className="text-white text-sm mb-2">Favorite Routes</h3>
            <div className="space-y-2">
              {userData.favoriteRoutes.map(route => (
                <div key={route.id} className="p-3 bg-black/40 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center">
                        <h4 className="text-white text-sm font-medium">{route.name}</h4>
                        <div className="ml-2 flex items-center">
                          {[...Array(route.rating)].map((_, i) => (
                            <span key={i} className="text-yellow-400 text-xs">★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs">{route.distance}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 text-xs">Last driven</span>
                      <p className="text-gray-300 text-xs">{new Date(route.lastDriven).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bts-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="bts-header-green">Recent Activity</h2>
            </div>
            <div className="space-y-2">
              {userData.recentActivity.map(activity => (
                <div key={activity.id} className="p-3 bg-black/40 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-800 mr-3 flex-shrink-0">
                      {activity.type === 'drive' && <span>🚗</span>}
                      {activity.type === 'maintenance' && <span>🔧</span>}
                      {activity.type === 'manifestation' && <span>⭐</span>}
                      {activity.type === 'event' && <span>📅</span>}
                      {activity.type === 'purchase' && <span>🛒</span>}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <p className="text-white text-sm">{activity.description}</p>
                        <p className="text-gray-500 text-xs ml-2">{new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                      {activity.details && (
                        <div className="mt-1 text-xs px-2 py-1 bg-black/30 rounded border border-gray-800">
                          {activity.type === 'drive' && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Route: {activity.details?.route || 'Custom route'}</span>
                              <span className="text-gray-400">Duration: {activity.details?.duration || '0 min'}</span>
                            </div>
                          )}
                          {activity.type === 'maintenance' && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">At: {activity.details?.location || 'Unknown'}</span>
                              <span className="text-gray-400">Cost: ${activity.details?.cost || 0}</span>
                            </div>
                          )}
                          {activity.type === 'purchase' && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">{activity.details?.item || 'Item'}</span>
                              <span className="text-gray-400">Cost: ${activity.details?.cost || 0}</span>
                            </div>
                          )}
                          {activity.type === 'event' && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Date: {new Date(activity.details?.eventDate || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              <span className="text-gray-400">Fee: ${activity.details?.cost || 0}</span>
                            </div>
                          )}
                          {activity.type === 'manifestation' && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Previous: ${activity.details?.oldAmount?.toLocaleString() || 0}</span>
                              <span className="text-gray-400">New: ${activity.details?.newAmount?.toLocaleString() || 0}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance Alerts */}
          <div className="bts-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="bts-header-green">Maintenance Alerts</h2>
              <Link to="/garage-vault" className="text-sm text-green-400 hover:underline">View All</Link>
            </div>
            {userData.maintenanceAlerts.length > 0 ? (
              <div className="space-y-3">
                {userData.maintenanceAlerts.map(alert => {
                  const vehicle = getVehicleById(alert.vehicleId);
                  return (
                    <Link to={`/vehicle-mods/${alert.vehicleId}`} key={alert.id} className="block p-3 bg-black/40 rounded-lg hover:bg-black/60 transition">
                      <div className="flex justify-between">
                        <h3 className="text-white font-medium">{alert.type}</h3>
                        <span className="text-red-400 text-sm">
                          Due: {new Date(alert.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{vehicle?.nickname || `${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`}</p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-6 bg-black/20 rounded-lg">
                <p className="text-gray-400">No maintenance alerts</p>
              </div>
            )}
          </div>

          {/* Paddock Badges */}
          <div className="bts-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="bts-header-green">Paddock Badges</h2>
              <Link to="/membership" className="text-sm text-green-400 hover:underline">All Badges</Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {userData.badges.map(badge => (
                <div key={badge.id} className="flex flex-col items-center p-3 bg-black/40 rounded-lg">
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <p className="text-white text-xs text-center font-medium">{badge.name}</p>
                </div>
              ))}
            </div>
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
                      <div className="flex items-center">
                        <span className="mr-2 text-lg">{goal.emoji}</span>
                        <h3 className="text-white font-medium">{goal.goal}</h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-blue-400 text-sm font-medium">{goal.progress}%</span>
                        <span className="text-xs text-gray-500">Target: ${goal.targetAmount?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2.5 rounded-full" 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-3 pt-2 border-t border-gray-800 text-xs">
                      <div>
                        <span className="text-gray-400">Saved: </span>
                        <span className="text-blue-300 font-mono">${goal.savedAmount?.toLocaleString() || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Monthly: </span>
                        <span className="text-green-400 font-mono">${goal.monthlyContribution?.toLocaleString() || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">ETA: </span>
                        <span className="text-amber-400">{new Date(goal.projectedDate || new Date()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {userData.manifestationHistory.length > 0 && (
                  <div className="bg-black/30 p-3 rounded-lg mt-4">
                    <h3 className="text-gray-400 text-xs mb-2">Patek Philippe Savings History</h3>
                    <div className="h-28">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userData.manifestationHistory}>
                          <XAxis dataKey="month" stroke="#374151" tick={{ fill: '#9CA3AF' }} tickLine={{ stroke: '#374151' }} />
                          <YAxis stroke="#374151" tick={{ fill: '#9CA3AF' }} tickLine={{ stroke: '#374151' }} tickFormatter={(value) => `$${value/1000}k`} />
                          <Tooltip 
                            contentStyle={{ background: '#111111', border: '1px solid #374151' }}
                            labelStyle={{ color: '#E5E7EB' }}
                            formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                          />
                          <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} dot={{ stroke: '#3B82F6', strokeWidth: 2, r: 3, fill: '#1F2937' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
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