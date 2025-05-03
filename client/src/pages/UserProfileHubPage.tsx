import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Settings, Mail, 
  Zap, ArrowRight, UserPlus, 
  Clock, Calendar, Map 
} from 'lucide-react';
import UserProfileHub from '../components/UserProfileHub';

const UserProfileHubPage: React.FC = () => {
  useEffect(() => {
    // Update the page title
    document.title = 'ApexVault - User Profile Hub | Paddock20';
  }, []);

  return (
    <div className="min-h-screen pt-4 pb-20">
      
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-orbitron text-[#4B9CD3]">
            ApexVault <span className="text-sm bg-[#08c519]/20 text-[#08c519] px-1 py-0.5 rounded-sm ml-2">BETA</span>
          </h1>
          <div>
            <Link 
              to="/settings" 
              className="bg-black/50 text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-md border border-blue-900/30 text-sm inline-flex items-center"
            >
              <Settings className="h-4 w-4 mr-1.5" />
              Settings
            </Link>
          </div>
        </div>
        <p className="text-gray-400 mt-1">
          Your centralized driver profile hub for comprehensive identity and data management
        </p>
      </div>
      
      {/* Main Profile Hub */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <UserProfileHub />
      </div>
      
      {/* Additional Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Quick Links Section */}
        <div className="bg-gradient-to-r from-gray-900 to-black border border-blue-900/30 rounded-xl p-4">
          <h2 className="text-[#4B9CD3] font-orbitron text-lg mb-3 pb-2 border-b border-blue-900/30 flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Quick Links
          </h2>
          
          <div className="grid grid-cols-1 gap-3">
            <Link 
              to="/personalized-dashboard" 
              className="bg-black/40 hover:bg-black/60 transition-colors rounded-md p-3 border border-blue-900/20 flex justify-between items-center"
            >
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-white">Driver Dashboard</span>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-400" />
            </Link>
            
            <Link 
              to="/weather-paddock" 
              className="bg-black/40 hover:bg-black/60 transition-colors rounded-md p-3 border border-blue-900/20 flex justify-between items-center"
            >
              <div className="flex items-center">
                <Map className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-white">Weather Paddock</span>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-400" />
            </Link>
            
            <Link 
              to="/drive-journal" 
              className="bg-black/40 hover:bg-black/60 transition-colors rounded-md p-3 border border-blue-900/20 flex justify-between items-center"
            >
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-white">Drive Journal</span>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-400" />
            </Link>
            
            <Link 
              to="/garage-vault" 
              className="bg-black/40 hover:bg-black/60 transition-colors rounded-md p-3 border border-blue-900/20 flex justify-between items-center"
            >
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-white">Garage Vault</span>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-400" />
            </Link>
          </div>
        </div>
        
        {/* Recent Updates Section */}
        <div className="bg-gradient-to-r from-gray-900 to-black border border-blue-900/30 rounded-xl p-4">
          <h2 className="text-[#4B9CD3] font-orbitron text-lg mb-3 pb-2 border-b border-blue-900/30 flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            System Updates
          </h2>
          
          <div className="space-y-4">
            <div className="bg-black/40 rounded-md p-3 border border-green-900/20">
              <div className="flex items-center mb-1">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                <h3 className="text-green-400 font-medium">ApexVault Launch</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Welcome to the new ApexVault User Profile Hub. Your centralized hub for identity and data management.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Posted: {new Date().toLocaleDateString()}
              </p>
            </div>
            
            <div className="bg-black/40 rounded-md p-3 border border-blue-900/20">
              <div className="flex items-center mb-1">
                <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                <h3 className="text-blue-400 font-medium">Paddock20 Platform Update</h3>
              </div>
              <p className="text-gray-300 text-sm">
                New F1-inspired telemetry dashboard added to all weather and vehicle screens.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Posted: {new Date(Date.now() - 604800000).toLocaleDateString()}
              </p>
            </div>
            
            <div className="bg-black/40 rounded-md p-3 border border-blue-900/20">
              <div className="flex items-center mb-1">
                <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                <h3 className="text-blue-400 font-medium">Vehicle Data Integration</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Enhanced vehicle data pivoting across all modules for seamless experience.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Posted: {new Date(Date.now() - 1209600000).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Invite Friends Banner */}
      <div className="bg-gradient-to-r from-[#08c519]/10 to-black border border-[#08c519]/30 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h3 className="text-[#08c519] font-orbitron text-lg mb-1">
            Invite Friends to Paddock20
          </h3>
          <p className="text-gray-400 text-sm">
            Share the Paddock20 experience with your car enthusiast friends
          </p>
        </div>
        
        <button className="mt-3 md:mt-0 bg-[#08c519]/20 hover:bg-[#08c519]/30 text-[#08c519] transition-colors px-4 py-2 rounded-md border border-[#08c519]/40 flex items-center">
          <UserPlus className="h-4 w-4 mr-2" />
          Send Invites
        </button>
      </div>
    </div>
  );
};

export default UserProfileHubPage;