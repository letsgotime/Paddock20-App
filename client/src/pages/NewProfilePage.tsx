import React, { useState, useEffect } from "react";
import { 
  User, 
  Car, 
  Calendar, 
  MapPin, 
  Settings, 
  Star, 
  Award,
  Clock,
  BarChart3,
  Camera,
  Flag,
  PlusCircle,
  ChevronRight,
  Edit,
  LayoutDashboard
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUserProfileStore } from "../services/userProfileService";
import { useVehicle } from "../contexts/VehicleContext";

const NewProfilePage = () => {
  const { profile } = useUserProfileStore();
  const { vehicles, activeVehicle } = useVehicle();
  const [activeTab, setActiveTab] = useState("overview");

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return dateString;
    }
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
              <Link to="/new-dashboard" className="text-gray-400 hover:text-white flex items-center">
                <LayoutDashboard className="h-5 w-5 mr-1" />
                <span className="text-sm hidden sm:inline">Dashboard</span>
              </Link>
              <Link to="/settings" className="text-gray-400 hover:text-white">
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with padding for fixed header */}
      <div className="pt-16 container mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-[#111115] rounded-xl overflow-hidden border border-gray-800 mb-6">
          <div className="bg-gradient-to-r from-blue-900/30 to-black h-36 relative">
            <div className="absolute -bottom-16 left-8 h-32 w-32 rounded-full bg-gray-800 border-4 border-[#0a0a0a] overflow-hidden">
              {profile?.profileImage ? (
                <img 
                  src={profile.profileImage} 
                  alt={profile?.displayName || "User"} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-900">
                  <User className="h-14 w-14 text-gray-400" />
                </div>
              )}
            </div>
            <button className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-md transition-colors">
              <Edit className="h-4 w-4" />
            </button>
          </div>
          
          <div className="pt-16 pb-5 px-8">
            <h2 className="text-2xl font-bold">{profile?.displayName || "Gavin Brooks"}</h2>
            <p className="text-gray-400 flex items-center mt-1">
              <MapPin className="h-4 w-4 inline mr-1.5" />
              Atlanta, GA
            </p>
            <p className="text-gray-400 flex items-center mt-1">
              <Calendar className="h-4 w-4 inline mr-1.5" />
              Member since {formatDate(profile?.memberSince || "2023-01-01")}
            </p>
            
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="bg-blue-900/20 border border-blue-900/40 rounded-md px-3 py-2 flex items-center">
                <Car className="h-4 w-4 text-blue-400 mr-1.5" />
                <span className="text-sm">{vehicles.length || 0} Vehicles</span>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-900/40 rounded-md px-3 py-2 flex items-center">
                <Clock className="h-4 w-4 text-blue-400 mr-1.5" />
                <span className="text-sm">{profile?.statistics?.totalDrives || 0} Drives</span>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-900/40 rounded-md px-3 py-2 flex items-center">
                <BarChart3 className="h-4 w-4 text-blue-400 mr-1.5" />
                <span className="text-sm">{profile?.statistics?.totalMiles.toLocaleString() || 0} Miles</span>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-900/40 rounded-md px-3 py-2 flex items-center">
                <Award className="h-4 w-4 text-blue-400 mr-1.5" />
                <span className="text-sm">{profile?.statistics?.achievements || 0} Achievements</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Tabs */}
        <div className="bg-[#111115] rounded-xl border border-gray-800 overflow-hidden mb-6">
          <div className="border-b border-gray-800 flex overflow-x-auto">
            <button
              className={`px-5 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === "overview" 
                  ? "text-blue-400 border-b-2 border-blue-500" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            
            <button
              className={`px-5 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === "vehicles" 
                  ? "text-blue-400 border-b-2 border-blue-500" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("vehicles")}
            >
              Vehicles
            </button>
            
            <button
              className={`px-5 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === "drives" 
                  ? "text-blue-400 border-b-2 border-blue-500" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("drives")}
            >
              Drive History
            </button>
            
            <button
              className={`px-5 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === "gallery" 
                  ? "text-blue-400 border-b-2 border-blue-500" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("gallery")}
            >
              Gallery
            </button>
            
            <button
              className={`px-5 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === "achievements" 
                  ? "text-blue-400 border-b-2 border-blue-500" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("achievements")}
            >
              Achievements
            </button>
          </div>
          
          <div className="p-5">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium mb-4">Driver Overview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Summary Stats */}
                  <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
                    <h4 className="font-medium mb-3 flex items-center">
                      <BarChart3 className="h-4 w-4 text-blue-400 mr-2" />
                      Statistics
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Drives</span>
                        <span>{profile?.statistics?.totalDrives || 0}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Miles</span>
                        <span>{profile?.statistics?.totalMiles?.toLocaleString() || 0}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg. Drive Time</span>
                        <span>{profile?.statistics?.avgDriveTime || 0} min</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Goals Completed</span>
                        <span>{profile?.statistics?.goalsCompleted || 0}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Events Attended</span>
                        <span>{profile?.statistics?.eventsAttended || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Primary Vehicle */}
                  {activeVehicle && (
                    <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
                      <h4 className="font-medium mb-3 flex items-center">
                        <Car className="h-4 w-4 text-blue-400 mr-2" />
                        Primary Vehicle
                      </h4>
                      
                      <div className="flex items-center mb-3">
                        <div className="h-14 w-14 bg-gray-800 rounded flex items-center justify-center mr-3 overflow-hidden">
                          {activeVehicle.vehicle_image ? (
                            <img 
                              src={activeVehicle.vehicle_image} 
                              alt={activeVehicle.make + ' ' + activeVehicle.model} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Car className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        
                        <div>
                          <p className="font-medium">{activeVehicle.nickname || `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`}</p>
                          <p className="text-sm text-gray-400">{activeVehicle.mileage.toLocaleString()} miles</p>
                        </div>
                      </div>
                      
                      <Link 
                        to="/garage-vault" 
                        className="flex items-center justify-center w-full bg-blue-900/20 hover:bg-blue-900/30 border border-blue-900/40 rounded py-2 mt-2 text-sm text-blue-400 transition-colors"
                      >
                        View All Vehicles
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </div>
                  )}
                  
                  {/* Recent Achievements */}
                  <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Award className="h-4 w-4 text-blue-400 mr-2" />
                      Recent Achievements
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="bg-yellow-500/20 rounded-full p-1.5 mr-3">
                          <Star className="h-3.5 w-3.5 text-yellow-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">First Drive Logged</p>
                          <p className="text-xs text-gray-400">April 2, 2025</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="bg-blue-500/20 rounded-full p-1.5 mr-3">
                          <Flag className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">100 Miles Driven</p>
                          <p className="text-xs text-gray-400">April 15, 2025</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="bg-green-500/20 rounded-full p-1.5 mr-3">
                          <Camera className="h-3.5 w-3.5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">First Photo Added</p>
                          <p className="text-xs text-gray-400">April 20, 2025</p>
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      to="/achievements" 
                      className="flex items-center justify-center w-full bg-blue-900/20 hover:bg-blue-900/30 border border-blue-900/40 rounded py-2 mt-3 text-sm text-blue-400 transition-colors"
                    >
                      See All Achievements
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
                
                {/* Recent Drives */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Recent Drives</h4>
                    <Link to="/drive-journal" className="text-sm text-blue-400 flex items-center">
                      View All
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </div>
                  
                  {profile?.drives && profile.drives.length > 0 ? (
                    <div className="space-y-3">
                      {profile.drives.slice(0, 3).map((drive, index) => (
                        <div key={index} className="bg-black/30 rounded-lg p-3 border border-gray-800 flex justify-between">
                          <div className="flex items-center">
                            <div className="bg-blue-900/30 p-2 rounded-md mr-3">
                              <MapPin className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium">{drive.title || "Drive"}</p>
                              <p className="text-sm text-gray-400">{drive.distance || 0} miles • {formatDate(drive.date)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{drive.duration || 0} minutes</p>
                            <p className="text-xs text-gray-400">{drive.vehicle?.make} {drive.vehicle?.model}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-black/30 rounded-lg p-6 border border-gray-800 text-center">
                      <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <h4 className="text-lg font-medium mb-2">No drives recorded yet</h4>
                      <p className="text-gray-400 mb-4">Start logging your drives to build your profile</p>
                      <Link 
                        to="/drive-journal" 
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Log Your First Drive
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === "vehicles" && (
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-medium">Your Vehicles</h3>
                  <Link 
                    to="/vehicle/add" 
                    className="flex items-center text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors"
                  >
                    <PlusCircle className="h-4 w-4 mr-1.5" />
                    Add Vehicle
                  </Link>
                </div>
                
                {vehicles && vehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicles.map((vehicle) => (
                      <div 
                        key={vehicle.id} 
                        className="bg-black/30 rounded-lg p-4 border border-gray-800"
                      >
                        <div className="flex">
                          <div className="h-20 w-20 bg-gray-800 rounded-md flex items-center justify-center mr-4 overflow-hidden">
                            {vehicle.vehicle_image ? (
                              <img 
                                src={vehicle.vehicle_image} 
                                alt={vehicle.make + ' ' + vehicle.model} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Car className="h-10 w-10 text-gray-400" />
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-medium">
                              {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                            </h4>
                            <p className="text-sm text-gray-400 mt-1">
                              {vehicle.mileage.toLocaleString()} miles
                            </p>
                            
                            <div className="flex items-center mt-2">
                              <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                              <span className="text-sm text-gray-300">{vehicle.status || 'Ready'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-800 flex space-x-2">
                          <Link 
                            to={`/vehicle/${vehicle.id}`} 
                            className="flex-1 text-center text-sm bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 py-1.5 rounded border border-blue-900/30 transition-colors"
                          >
                            Details
                          </Link>
                          
                          <Link 
                            to={`/maintenance/${vehicle.id}`} 
                            className="flex-1 text-center text-sm bg-gray-800/50 hover:bg-gray-800/80 text-gray-300 py-1.5 rounded border border-gray-700/30 transition-colors"
                          >
                            Service Log
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-black/30 rounded-lg p-6 border border-gray-800 text-center">
                    <Car className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <h4 className="text-lg font-medium mb-2">No vehicles added yet</h4>
                    <p className="text-gray-400 mb-4">Add your first vehicle to get started</p>
                    <Link 
                      to="/vehicle/add" 
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Your First Vehicle
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "drives" && (
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-medium">Drive History</h3>
                  <Link 
                    to="/drive-journal/new" 
                    className="flex items-center text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors"
                  >
                    <PlusCircle className="h-4 w-4 mr-1.5" />
                    Log New Drive
                  </Link>
                </div>
                
                {profile?.drives && profile.drives.length > 0 ? (
                  <div className="space-y-3">
                    {profile.drives.map((drive, index) => (
                      <div key={index} className="bg-black/30 rounded-lg p-4 border border-gray-800">
                        <div className="flex justify-between mb-3">
                          <h4 className="font-medium">{drive.title || "Drive"}</h4>
                          <span className="text-sm text-gray-400">{formatDate(drive.date)}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                          <div className="bg-black/40 px-3 py-2 rounded">
                            <p className="text-xs text-gray-500 mb-1">Distance</p>
                            <p className="text-sm">{drive.distance || 0} miles</p>
                          </div>
                          
                          <div className="bg-black/40 px-3 py-2 rounded">
                            <p className="text-xs text-gray-500 mb-1">Duration</p>
                            <p className="text-sm">{drive.duration || 0} minutes</p>
                          </div>
                          
                          <div className="bg-black/40 px-3 py-2 rounded">
                            <p className="text-xs text-gray-500 mb-1">Vehicle</p>
                            <p className="text-sm">{drive.vehicle?.make} {drive.vehicle?.model}</p>
                          </div>
                          
                          <div className="bg-black/40 px-3 py-2 rounded">
                            <p className="text-xs text-gray-500 mb-1">Weather</p>
                            <p className="text-sm">{drive.weather || "Clear"}</p>
                          </div>
                        </div>
                        
                        {drive.notes && (
                          <p className="text-sm text-gray-400 mb-3">{drive.notes}</p>
                        )}
                        
                        <div className="flex justify-end">
                          <Link 
                            to={`/drive-journal/${drive.id}`} 
                            className="text-sm text-blue-400 flex items-center"
                          >
                            View Details
                            <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-black/30 rounded-lg p-6 border border-gray-800 text-center">
                    <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <h4 className="text-lg font-medium mb-2">No drives recorded yet</h4>
                    <p className="text-gray-400 mb-4">Start logging your drives to build your profile</p>
                    <Link 
                      to="/drive-journal/new" 
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Log Your First Drive
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "gallery" && (
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-medium">Photo Gallery</h3>
                  <button className="flex items-center text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors">
                    <PlusCircle className="h-4 w-4 mr-1.5" />
                    Add Photos
                  </button>
                </div>
                
                {profile?.gallery && profile.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {profile.gallery.map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-800 relative group">
                        <img 
                          src={image.url} 
                          alt={image.description || "Gallery image"} 
                          className="h-full w-full object-cover"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 flex items-end p-3 transition-opacity">
                          <span className="text-sm text-white truncate">{image.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-black/30 rounded-lg p-6 border border-gray-800 text-center">
                    <Camera className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <h4 className="text-lg font-medium mb-2">No photos yet</h4>
                    <p className="text-gray-400 mb-4">Add photos of your vehicles and drives</p>
                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Your First Photo
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "achievements" && (
              <div>
                <h3 className="text-lg font-medium mb-5">Your Achievements</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-center">
                      <div className="bg-yellow-500/20 rounded-full p-3 mr-4">
                        <Star className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">First Drive Logged</h4>
                        <p className="text-sm text-gray-400">Complete your first drive entry</p>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-gray-800 pt-3 flex justify-between items-center">
                      <span className="text-xs text-gray-400">April 2, 2025</span>
                      <span className="px-2 py-0.5 bg-green-600/20 text-green-500 text-xs rounded">Achieved</span>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-center">
                      <div className="bg-blue-500/20 rounded-full p-3 mr-4">
                        <Flag className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">100 Miles Driven</h4>
                        <p className="text-sm text-gray-400">Record 100 miles in your drive journal</p>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-gray-800 pt-3 flex justify-between items-center">
                      <span className="text-xs text-gray-400">April 15, 2025</span>
                      <span className="px-2 py-0.5 bg-green-600/20 text-green-500 text-xs rounded">Achieved</span>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-center">
                      <div className="bg-green-500/20 rounded-full p-3 mr-4">
                        <Camera className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">First Photo Added</h4>
                        <p className="text-sm text-gray-400">Add your first photo to the gallery</p>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-gray-800 pt-3 flex justify-between items-center">
                      <span className="text-xs text-gray-400">April 20, 2025</span>
                      <span className="px-2 py-0.5 bg-green-600/20 text-green-500 text-xs rounded">Achieved</span>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-center">
                      <div className="bg-purple-500/20 rounded-full p-3 mr-4">
                        <Award className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Vehicle Expert</h4>
                        <p className="text-sm text-gray-400">Add 3 or more vehicles to your garage</p>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-gray-800 pt-3 flex justify-between items-center">
                      <span className="text-xs text-gray-400">{vehicles.length}/3 vehicles</span>
                      <span className="px-2 py-0.5 bg-gray-600/20 text-gray-400 text-xs rounded">In Progress</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            BETA • Build 2025.05.03
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProfilePage;