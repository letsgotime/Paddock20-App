import React from "react";
import { Helmet } from "react-helmet";

const NotificationsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12">
      <Helmet>
        <title>Notifications | Paddock20</title>
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-orbitron text-3xl text-blue-400 mb-2 flex items-center">
            <span className="inline-block w-1.5 h-8 bg-green-500 mr-3"></span>
            Notifications
          </h1>
          <p className="text-gray-400 max-w-3xl">
            Stay updated with all the latest alerts, event notifications, and updates from the Paddock20 community.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 shadow-xl border border-gray-800 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-orbitron text-xl text-blue-400">Notification Center</h2>
            <div className="flex space-x-2">
              <button className="bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors px-3 py-1 text-sm rounded">
                Mark All Read
              </button>
              <button className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors px-3 py-1 text-sm rounded">
                Settings
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* No notifications message */}
            <div className="text-center py-12 border border-dashed border-gray-700 rounded-lg bg-black/20">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 mx-auto text-gray-500 mb-4" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <h3 className="text-lg font-orbitron text-gray-400 mb-2">No Notifications</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                You're all caught up! Check back later for new alerts, event updates, 
                and messages from the GoTime Motorsports team.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 shadow-xl border border-gray-800">
          <div className="mb-4">
            <h2 className="font-orbitron text-xl text-blue-400 mb-2">Notification Preferences</h2>
            <p className="text-gray-400 text-sm">
              Customize what types of notifications you receive and how you receive them.
            </p>
          </div>

          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between p-3 border border-gray-800 rounded-lg bg-black/30">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-full">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-green-500" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-200">Event Notifications</p>
                  <p className="text-xs text-gray-400">Get notified about upcoming events and meetups</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-800 rounded-lg bg-black/30">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-full">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-blue-500" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                    <line x1="4" y1="22" x2="4" y2="15"></line>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-200">Maintenance Reminders</p>
                  <p className="text-xs text-gray-400">Receive reminders for upcoming vehicle maintenance</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-800 rounded-lg bg-black/30">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-full">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-purple-500" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M14 9a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2h3v5h6z"></path>
                    <path d="M18 9a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-3v-5h-6v-.8"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-200">Community Updates</p>
                  <p className="text-xs text-gray-400">Stay updated with the latest Paddock20 community news</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end">
            <button className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 rounded hover:from-blue-700 hover:to-green-700 transition-all">
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;