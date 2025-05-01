import React from "react";
import { Link } from "react-router-dom";
import EventsPreview from '../components/EventsPreview';
import OneTapWeatherSnapshot from '../components/OneTapWeatherSnapshot';
import { useWeather } from '../contexts/WeatherContext';

const Paddock20HomePage: React.FC = () => {
  const { weatherData, automotiveWeatherData } = useWeather();
  return (
    <div
      className="min-h-screen bg-black bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/images/f1-stadium-sunset.png')",
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(0,0,0,0.7)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-blue-400 font-orbitron text-5xl mb-6">Paddock20™</h1>
        <p className="text-white font-openSans text-xl mb-4">Paddock20™ isn't just an app.</p>
        <p className="text-gray-300 font-openSans text-base">
          It's where enthusiasts level up. It's where lifestyle becomes legacy. It's where every mile moves the story forward.
        </p>
        <p className="text-gray-300 font-openSans text-base mt-2">
          Join the operators who don't chase. They build.
        </p>
      </section>

      {/* Live Weather Station - Driver-Oriented Weather Dashboard */}
      <section className="mb-8">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4">Live Drive Intelligence</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weather Snapshot */}
          <div className="lg:col-span-1">
            <OneTapWeatherSnapshot className="h-full" />
          </div>
          
          {/* Driver-Oriented Weather Metrics */}
          <div className="lg:col-span-2 bg-gradient-to-r from-black/90 to-gray-900/80 rounded-xl p-4 border border-blue-900/30 shadow-lg backdrop-blur-sm">
            <h3 className="text-blue-400 font-semibold text-sm uppercase tracking-wider mb-3">Driver Conditions</h3>
            
            <div id="weather-snapshot-capture-area" className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* These metrics will be captured along with the weather snapshot */}
              <div className="bg-black/40 p-3 rounded-lg border border-blue-900/20">
                <div className="text-blue-400/70 text-xs mb-1">Surface Temp</div>
                <div className="text-white text-xl font-mono font-semibold">
                  {(weatherData?.main?.temp || 0).toFixed(1)}°F
                </div>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-blue-900/20">
                <div className="text-blue-400/70 text-xs mb-1">Humidity</div>
                <div className="text-white text-xl font-mono font-semibold">
                  {weatherData?.main?.humidity || 0}%
                </div>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-blue-900/20">
                <div className="text-blue-400/70 text-xs mb-1">Wind Speed</div>
                <div className="text-white text-xl font-mono font-semibold">
                  {weatherData?.wind?.speed || 0} mph
                </div>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-blue-900/20">
                <div className="text-blue-400/70 text-xs mb-1">Feels Like</div>
                <div className="text-white text-xl font-mono font-semibold">
                  {(weatherData?.main?.feels_like || 0).toFixed(1)}°F
                </div>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-blue-900/20">
                <div className="text-blue-400/70 text-xs mb-1">UV Index</div>
                <div className="text-white text-xl font-mono font-semibold">
                  {automotiveWeatherData?.uvi?.toFixed(1) || "N/A"}
                </div>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-blue-900/20">
                <div className="text-blue-400/70 text-xs mb-1">Visibility</div>
                <div className="text-white text-xl font-mono font-semibold">
                  {weatherData?.visibility ? (weatherData.visibility / 1609).toFixed(1) : "N/A"} mi
                </div>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-blue-900/20">
                <div className="text-blue-400/70 text-xs mb-1">Dew Point</div>
                <div className="text-white text-xl font-mono font-semibold">
                  {(automotiveWeatherData?.dew_point || 0).toFixed(1)}°F
                </div>
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-blue-900/20">
                <div className="text-blue-400/70 text-xs mb-1">Pressure</div>
                <div className="text-white text-xl font-mono font-semibold">
                  {weatherData?.main?.pressure || 0} hPa
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-900/10 rounded-lg text-sm text-blue-300">
              <p>All metrics are real-time and critical for driving decisions. For detailed forecast and track conditions, visit the <Link to="/new-weather-center" className="text-blue-400 hover:underline">Weather Center</Link>.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Motorsports Events Preview */}
      <section className="mb-8">
        <EventsPreview />
      </section>

      {/* GoTime Event Gallery */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-orbitron text-blue-400 text-2xl">
            GoTime Event Gallery
          </h2>
          <a 
            href="https://www.instagram.com/gotimemotorsports/" 
            target="_blank"
            rel="noopener noreferrer" 
            className="text-green-500 hover:text-green-400 flex items-center gap-2 text-sm transition-colors"
          >
            <span>Follow @gotimemotorsports</span>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </div>
        
        <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-6">
          <p className="text-blue-400 text-sm mb-4">
            Connect directly with the latest events and activities from the GoTime Motorsports community.
          </p>
          
          {/* Instagram Feed Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* These Instagram post previews link directly to the posts on Instagram */}
            <a 
              href="https://www.instagram.com/gotimemotorsports/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block aspect-square bg-black rounded-lg overflow-hidden border border-gray-800 hover:border-blue-500 transition-colors"
            >
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <span className="text-4xl">🏎️</span>
              </div>
            </a>
            <a 
              href="https://www.instagram.com/gotimemotorsports/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block aspect-square bg-black rounded-lg overflow-hidden border border-gray-800 hover:border-blue-500 transition-colors"
            >
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <span className="text-4xl">💨</span>
              </div>
            </a>
            <a 
              href="https://www.instagram.com/gotimemotorsports/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block aspect-square bg-black rounded-lg overflow-hidden border border-gray-800 hover:border-blue-500 transition-colors"
            >
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <span className="text-4xl">🔧</span>
              </div>
            </a>
            <a 
              href="https://www.instagram.com/gotimemotorsports/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block aspect-square bg-black rounded-lg overflow-hidden border border-gray-800 hover:border-blue-500 transition-colors"
            >
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <span className="text-4xl">⚡</span>
              </div>
            </a>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
            <p className="text-gray-400 text-sm">
              To view our full gallery of events, races, and builds, visit our Instagram profile.
            </p>
            <a 
              href="https://www.instagram.com/gotimemotorsports/" 
              target="_blank"
              rel="noopener noreferrer" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-4 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              View Instagram
            </a>
          </div>
        </div>
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
          <Link to="/weather" className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg hover:border-green-500 transition-colors">
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
          <Link to="/motorsports-events" className="bg-black p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
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
        <h2 className="text-blue-400 font-orbitron text-3xl mb-4">Drive Life. Document Legacy.</h2>
        <p className="text-white font-openSans text-lg mb-6">
          Built for the serious. Designed for the seamless.
        </p>
      </section>
      </div>
    </div>
  );
};

export default Paddock20HomePage;