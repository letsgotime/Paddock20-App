import React from "react";
import { Link } from "react-router-dom";
import SimpleWeatherStation from '../components/SimpleWeatherStation';

const Paddock20HomePage = () => {
  return (
    <div className="bg-black min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-blue-400 font-orbitron text-5xl mb-6">Paddock20™</h1>
        <p className="text-white font-openSans text-xl mb-4">Drive Life. Document Legacy.</p>
        <p className="text-gray-300 font-openSans text-base">
          Built for the serious. Designed for the seamless.
        </p>
      </section>

      {/* Weather Station Section */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4">Today's Drive Conditions</h2>
        <SimpleWeatherStation />
      </section>

      {/* Why Paddock20 */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-8 mb-12">
        <h2 className="text-blue-400 font-orbitron text-3xl mb-6">Why Paddock20™? Why Now?</h2>
        
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1">
            <h3 className="text-green-500 font-orbitron text-xl mb-3">The Paddock Concept</h3>
            <p className="text-white font-openSans text-base leading-relaxed mb-4">
              In motorsports, the paddock is the secured area where teams prepare, service, and manage their race cars.
              It's where the real work happens — where strategy becomes reality.
            </p>
            <p className="text-white font-openSans text-base leading-relaxed">
              Having "paddock access" means you're part of the team, part of the action, not just spectating.
            </p>
          </div>
          
          <div className="flex-1">
            <h3 className="text-green-500 font-orbitron text-xl mb-3">Paddock20™ Vision</h3>
            <p className="text-white font-openSans text-base leading-relaxed mb-4">
              Because real enthusiasts deserve real systems. Because parking lot dreams deserve pit lane execution. 
              Because knowing when to drive is as important as knowing how.
            </p>
            <p className="text-white font-openSans text-base leading-relaxed">
              No noise. No fake flex. Just pure data, pure drive, pure community. 
              Built by operators who care about discipline more than downloads.
            </p>
          </div>
        </div>
        
        <blockquote className="border-l-4 border-green-500 pl-4 italic text-gray-300 font-openSans">
          "The paddock isn't where you show off. It's where you get ready to win. 
          Paddock20™ was built for that same mindset."
        </blockquote>
      </section>

      {/* Core Features */}
      <section className="mb-12">
        <h2 className="text-blue-400 font-orbitron text-3xl mb-8 text-center">Your Command Center</h2>
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Weather Center */}
          <Link to="/weather-center" className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg hover:border-green-500 transition-colors">
            <h3 className="text-blue-400 font-orbitron text-2xl mb-4">☁️ Weather Center</h3>
            <p className="text-white font-openSans text-base leading-relaxed">
              Live conditions. Surface temps. Tire readiness. Torque specs. All in one glance.
              Precision starts before the ignition turns.
            </p>
          </Link>

          {/* Route Planner */}
          <Link to="/route-planner" className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg hover:border-green-500 transition-colors">
            <h3 className="text-blue-400 font-orbitron text-2xl mb-4">🛣️ Route Planner</h3>
            <p className="text-white font-openSans text-base leading-relaxed">
              Find your next run. Map your line. Plan like a pro. Perfect drives aren't accidents.
              They're calculated moves.
            </p>
          </Link>

          {/* Garage Vault */}
          <Link to="/garage-vault" className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg hover:border-green-500 transition-colors">
            <h3 className="text-blue-400 font-orbitron text-2xl mb-4">🚗 Garage Vault</h3>
            <p className="text-white font-openSans text-base leading-relaxed">
              Your vehicles. Your mods. Your finish history. Fully tracked. Fully owned.
            </p>
          </Link>

          {/* Juice Box */}
          <Link to="/juicebox" className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg hover:border-green-500 transition-colors">
            <h3 className="text-blue-400 font-orbitron text-2xl mb-4">🧼 Juice Box</h3>
            <p className="text-white font-openSans text-base leading-relaxed">
              Elite detailing guides, products, and systems. Built for gloss. Built for margin.
            </p>
          </Link>

        </div>
      </section>

      {/* Quick Access Links */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4">Quick Access Launchpad</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link to="/events" className="bg-black p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
            <span className="text-2xl block mb-2">🏎️</span>
            <span className="text-white font-openSans hover:text-green-400">Find Motorsport Events</span>
          </Link>
          <Link to="/drive-journal" className="bg-black p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
            <span className="text-2xl block mb-2">📝</span>
            <span className="text-white font-openSans hover:text-green-400">Your Drive Journal</span>
          </Link>
          <Link to="/gloss-growth" className="bg-black p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
            <span className="text-2xl block mb-2">✨</span>
            <span className="text-white font-openSans hover:text-green-400">Gloss Growth</span>
          </Link>
          <Link to="/hustle-planner" className="bg-black p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
            <span className="text-2xl block mb-2">🧠</span>
            <span className="text-white font-openSans hover:text-green-400">Hustle Planner</span>
          </Link>
          <Link to="/ebooks" className="bg-black p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
            <span className="text-2xl block mb-2">📚</span>
            <span className="text-white font-openSans hover:text-green-400">GoTime eBooks</span>
          </Link>
        </div>
      </section>

      {/* Final Hook */}
      <section className="text-center mt-16">
        <h2 className="text-blue-400 font-orbitron text-3xl mb-4">Paddock20™ isn't just an app.</h2>
        <p className="text-white font-openSans text-lg mb-6">
          It's where enthusiasts level up. It's where lifestyle becomes legacy. 
          It's where every mile moves the story forward.
        </p>
        <p className="text-gray-300 font-openSans text-sm">
          Join the operators who don't chase. They build.
        </p>
      </section>
    </div>
  );
};

export default Paddock20HomePage;