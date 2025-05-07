import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { Loader2, Car, Calendar, Droplet, Clock, BarChart3, AlertTriangle, Star } from 'lucide-react';

// Dashboard widgets
import WeatherWidget from '../components/dashboard/WeatherWidget';
import VehicleSummaryWidget from '../components/dashboard/VehicleSummaryWidget';
import UpcomingEventsWidget from '../components/dashboard/UpcomingEventsWidget';
import MaintenanceRemindersWidget from '../components/dashboard/MaintenanceRemindersWidget';
import GlossTrackerWidget from '../components/dashboard/GlossTrackerWidget';
import RecentDrivesWidget from '../components/dashboard/RecentDrivesWidget';
import JuiceBoxFeaturedWidget from '../components/dashboard/JuiceBoxFeaturedWidget';
import DreamAssetWidget from '../components/dashboard/DreamAssetWidget';

const UserDashboardPage = () => {
  const { user, isLoading } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hours = new Date().getHours();
    let greetingText = '';
    
    if (hours < 12) {
      greetingText = 'Good Morning';
    } else if (hours < 18) {
      greetingText = 'Good Afternoon';
    } else {
      greetingText = 'Good Evening';
    }
    
    setGreeting(greetingText);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header with user welcome */}
      <header className="mb-10">
        <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] rounded-xl p-6 border border-gray-800">
          <h1 className="font-orbitron text-3xl text-blue-500 mb-2">
            {greeting}, {user?.username || 'Driver'}
          </h1>
          <p className="text-gray-400">
            Welcome to your Paddock20™ Dashboard. Here's your personalized overview.
          </p>
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <WeatherWidget />

        {/* Vehicle Summary Widget */}
        <VehicleSummaryWidget userId={user?.id} />

        {/* Maintenance Reminders */}
        <MaintenanceRemindersWidget userId={user?.id} />

        {/* Gloss Tracker Summary */}
        <GlossTrackerWidget userId={user?.id} />

        {/* Recent Drives */}
        <RecentDrivesWidget userId={user?.id} />

        {/* Upcoming Events */}
        <UpcomingEventsWidget />

        {/* JuiceBox Featured Products */}
        <JuiceBoxFeaturedWidget />

        {/* Dream Asset Tracker */}
        <DreamAssetWidget userId={user?.id} />
      </div>

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="font-orbitron text-xl text-blue-500 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-4">
          <Link to="/garage-vault" className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-all flex flex-col items-center text-center">
            <Car className="h-6 w-6 text-green-500 mb-2" />
            <span>Garage Vault</span>
          </Link>
          <Link to="/events" className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-all flex flex-col items-center text-center">
            <Calendar className="h-6 w-6 text-green-500 mb-2" />
            <span>Events</span>
          </Link>
          <Link to="/juicebox" className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-all flex flex-col items-center text-center">
            <Droplet className="h-6 w-6 text-green-500 mb-2" />
            <span>Juice Box</span>
          </Link>
          <Link to="/drive-journal" className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-all flex flex-col items-center text-center">
            <Clock className="h-6 w-6 text-green-500 mb-2" />
            <span>Drive Journal</span>
          </Link>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-10 mb-10">
        <h2 className="font-orbitron text-xl text-blue-500 mb-4">Performance Insights</h2>
        <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-gray-300 mb-1">Drive Consistency</h3>
              <p className="text-2xl font-semibold text-green-400">87%</p>
            </div>
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-gray-300 mb-1">Maintenance Score</h3>
              <p className="text-2xl font-semibold text-yellow-500">74%</p>
            </div>
            <div className="text-center">
              <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-gray-300 mb-1">Gloss Rating</h3>
              <p className="text-2xl font-semibold text-blue-500">93%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;