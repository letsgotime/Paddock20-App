import React from 'react';
import { 
  Settings, User, Shield, Bell, Map, Smartphone, 
  Languages, Monitor, Database, Lock, LogOut 
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-2">
            Manage your account preferences and application settings
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">User Name</div>
                    <div className="text-sm text-gray-400">user@example.com</div>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <button className="w-full text-left p-3 rounded-lg flex items-center text-white bg-blue-900/20 mb-1">
                  <User className="h-5 w-5 mr-3 text-blue-400" />
                  Account
                </button>
                
                <button className="w-full text-left p-3 rounded-lg flex items-center text-gray-400 hover:bg-gray-800 hover:text-white mb-1">
                  <Shield className="h-5 w-5 mr-3" />
                  Privacy & Security
                </button>
                
                <button className="w-full text-left p-3 rounded-lg flex items-center text-gray-400 hover:bg-gray-800 hover:text-white mb-1">
                  <Bell className="h-5 w-5 mr-3" />
                  Notifications
                </button>
                
                <button className="w-full text-left p-3 rounded-lg flex items-center text-gray-400 hover:bg-gray-800 hover:text-white mb-1">
                  <Map className="h-5 w-5 mr-3" />
                  Location & Maps
                </button>
                
                <button className="w-full text-left p-3 rounded-lg flex items-center text-gray-400 hover:bg-gray-800 hover:text-white mb-1">
                  <Database className="h-5 w-5 mr-3" />
                  Data & Storage
                </button>
                
                <button className="w-full text-left p-3 rounded-lg flex items-center text-gray-400 hover:bg-gray-800 hover:text-white mb-1">
                  <Smartphone className="h-5 w-5 mr-3" />
                  Devices
                </button>
                
                <button className="w-full text-left p-3 rounded-lg flex items-center text-gray-400 hover:bg-gray-800 hover:text-white">
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-3">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-400" />
                Account Settings
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                    value="User Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your email"
                    value="user@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Password
                  </label>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </button>
                </div>
                
                <div className="pt-4 border-t border-gray-800">
                  <h3 className="text-lg font-medium text-white mb-4">Preferences</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-300">Temperature Units</div>
                        <div className="text-sm text-gray-500">Choose your preferred temperature unit</div>
                      </div>
                      <select className="bg-gray-800 border border-gray-700 rounded-lg py-1.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>Celsius (°C)</option>
                        <option>Fahrenheit (°F)</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-300">Distance Units</div>
                        <div className="text-sm text-gray-500">Choose your preferred distance unit</div>
                      </div>
                      <select className="bg-gray-800 border border-gray-700 rounded-lg py-1.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>Miles (mi)</option>
                        <option>Kilometers (km)</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-300">Pressure Units</div>
                        <div className="text-sm text-gray-500">Choose your preferred pressure unit</div>
                      </div>
                      <select className="bg-gray-800 border border-gray-700 rounded-lg py-1.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>PSI</option>
                        <option>Bar</option>
                        <option>kPa</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;