import React, { useState } from 'react';
import { Trophy, Users, MapPin, Calendar } from 'lucide-react';

interface EventsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

/**
 * Events Tabs Component
 * 
 * Provides tabbed navigation for different event categories
 */
const EventsTabs: React.FC<EventsTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'community', label: 'Community Events', icon: <Users size={18} /> },
    { id: 'motorsports', label: 'Motorsports Events', icon: <Trophy size={18} /> },
    // Future tabs can be added here
  ];

  return (
    <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg mb-8">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center px-6 py-4 focus:outline-none whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EventsTabs;