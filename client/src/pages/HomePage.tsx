import React from 'react';
import { Link } from 'react-router-dom';
import SupportChatbot from '../components/SupportChatbot';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-orbitron text-blue-500 mb-6">
            Welcome to Paddock20
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-300">
            Your exclusive motorsport community and resource hub
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {/* Feature Card 1 */}
          <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 border border-gray-800 shadow-xl">
            <div className="text-green-500 text-4xl mb-4">☁️</div>
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Weather Center</h3>
            <p className="text-gray-300 mb-4">
              Real-time weather data and track conditions for your driving adventures.
            </p>
            <Link to="/weather-center" className="text-green-500 hover:text-green-400">
              Check conditions →
            </Link>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 border border-gray-800 shadow-xl">
            <div className="text-green-500 text-4xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Garage Vault</h3>
            <p className="text-gray-300 mb-4">
              Track, manage, and optimize your vehicle collection in one place.
            </p>
            <Link to="/garage-vault" className="text-green-500 hover:text-green-400">
              Enter garage →
            </Link>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 border border-gray-800 shadow-xl">
            <div className="text-green-500 text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Events & Meetups</h3>
            <p className="text-gray-300 mb-4">
              Connect with the community at exclusive track days and gatherings.
            </p>
            <Link to="/events" className="text-green-500 hover:text-green-400">
              View calendar →
            </Link>
          </div>

          {/* Feature Card 4 */}
          <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 border border-gray-800 shadow-xl">
            <div className="text-green-500 text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Hustle Planner</h3>
            <p className="text-gray-300 mb-4">
              Set goals and track your progress toward your automotive aspirations.
            </p>
            <Link to="/hustle-planner" className="text-green-500 hover:text-green-400">
              Plan your moves →
            </Link>
          </div>

          {/* Feature Card 5 */}
          <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 border border-gray-800 shadow-xl">
            <div className="text-green-500 text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Member Chat</h3>
            <p className="text-gray-300 mb-4">
              Connect with fellow enthusiasts in our exclusive community chat.
            </p>
            <Link to="/chat-feed" className="text-green-500 hover:text-green-400">
              Join chat →
            </Link>
          </div>

          {/* Feature Card 6 */}
          <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 border border-gray-800 shadow-xl">
            <div className="text-green-500 text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2 text-blue-400">AI Support</h3>
            <p className="text-gray-300 mb-4">
              Get instant answers to your automotive questions with our AI assistant.
            </p>
            <button 
              className="text-green-500 hover:text-green-400"
              onClick={() => {
                // This is just a placeholder - the actual chatbot is available globally
                alert("The AI support chatbot is available through the chat icon in the bottom-right corner.");
              }}
            >
              Ask a question →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;