import React, { useRef, useState, useEffect } from 'react';
import { Watch, Car, Check, Star, Shield, Tag, Search, Clock, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import ExportOptions from '../components/ExportOptions';
import TimepiVault from '../components/TimepiVault';
import TimepieceTelemetry from '../components/TimepieceTelemetry';
import timepieceDataService from '../services/timepieceDataService';
import { Battery, Droplet, Activity, Info } from 'lucide-react';

// Define interface for timepiece store state
interface TimepieceState {
  timepieces: any[];
  getActiveTimepiece: () => any;
  setActiveTimepiece: (id: string) => void;
}

const TiresTimepieces: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'timepiece-vault' | 'telemetry'>('overview');
  const [selectedTimepieceId, setSelectedTimepieceId] = useState<string | null>(null);
  
  // Access timepiece data from store
  const useTimepieceStore = timepieceDataService.useTimepieceStore;
  const timepieces = useTimepieceStore((state: TimepieceState) => state.timepieces);
  const activeTimepiece = useTimepieceStore((state: TimepieceState) => state.getActiveTimepiece());
  const setActiveTimepiece = useTimepieceStore((state: TimepieceState) => state.setActiveTimepiece);
  
  // Set initial active timepiece if not already set
  useEffect(() => {
    if (timepieces.length > 0 && !activeTimepiece) {
      setActiveTimepiece(timepieces[0].id);
      setSelectedTimepieceId(timepieces[0].id);
    }
  }, [timepieces, activeTimepiece, setActiveTimepiece]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Tabs Navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-1 bg-gray-900/50 p-1 rounded-lg border border-gray-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md text-sm ${
                activeTab === 'overview' 
                  ? 'bg-gradient-to-br from-blue-900/60 to-blue-800/20 text-blue-400' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="hidden md:inline">T&T</span> Overview
            </button>
            <button
              onClick={() => setActiveTab('timepiece-vault')}
              className={`px-4 py-2 rounded-md text-sm ${
                activeTab === 'timepiece-vault' 
                  ? 'bg-gradient-to-br from-purple-900/60 to-purple-800/20 text-purple-400' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Watch className="inline-block h-4 w-4 mr-1 md:mr-2" /> 
              <span className="hidden md:inline">Timepiece</span> Vault
            </button>
            <button
              onClick={() => {
                if (selectedTimepieceId || activeTimepiece) {
                  setSelectedTimepieceId(selectedTimepieceId || activeTimepiece?.id || null);
                  setActiveTab('telemetry');
                }
              }}
              className={`px-4 py-2 rounded-md text-sm ${
                activeTab === 'telemetry' 
                  ? 'bg-gradient-to-br from-green-900/60 to-green-800/20 text-green-400' 
                  : 'text-gray-400 hover:text-gray-200'
              } ${(!selectedTimepieceId && !activeTimepiece) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!selectedTimepieceId && !activeTimepiece}
            >
              <Activity className="inline-block h-4 w-4 mr-1 md:mr-2" /> 
              <span className="hidden md:inline">Timepiece</span> Telemetry
            </button>
          </div>
          
          <ExportOptions 
            contentRef={contentRef}
            title="Tires & Timepieces Brokerage"
            pageName="TiresTimepieces"
            data={{
              service: "Luxury Asset Brokerage",
              categories: ["Exotic Cars", "Luxury Watches", "Collectibles"],
              partners: ["Bennisson", "GoTime Motorsports"]
            }}
          />
        </div>
        
        {activeTab === 'timepiece-vault' && (
          <TimepiVault />
        )}
        
        {activeTab === 'telemetry' && selectedTimepieceId && (
          <div className="mb-6">
            <div className="flex justify-start mb-4">
              <button
                onClick={() => setActiveTab('timepiece-vault')}
                className="inline-flex items-center text-gray-400 hover:text-white"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back to Timepiece Vault
              </button>
            </div>
            <TimepieceTelemetry timepieceId={selectedTimepieceId} />
          </div>
        )}
        
        {activeTab === 'overview' && (
          <div ref={contentRef}>
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-5xl font-orbitron text-blue-500 mb-4">Tires & Timepieces™</h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Powered by GoTime Motorsports™
              </p>
              <div className="mt-6 text-lg text-gray-400 max-w-3xl mx-auto">
                "Where asset passion meets precision execution."
              </div>
              <p className="mt-6 text-gray-300 max-w-3xl mx-auto">
                We exist for the builders, the collectors, the flippers, and the dreamers who want their next exotic car or timepiece to mean something.<br />
                Not hype. Not algorithms. Real sourcing. Real strategy. Real movement.
              </p>
            </div>

          {/* What You Get */}
          <div className="mb-16">
            <h2 className="text-3xl font-orbitron text-blue-500 text-center mb-10">🚗💼 What You Get</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-3">Asset Match Orders</h3>
                <p className="text-gray-300">
                  Get paired with the right vehicle or timepiece—fast.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-3">Concierge Brokerage</h3>
                <p className="text-gray-300">
                  Buy, sell, or trade with full authentication, inspection, and protection.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-3">Flip Forecasts™</h3>
                <p className="text-gray-300">
                  Strategic resale guidance before you buy—so you move smarter, not slower.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-3">Vault Briefs™</h3>
                <p className="text-gray-300">
                  Curated asset match packs, complete with margin logic and readiness reports.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-3">Delivery Engineering</h3>
                <p className="text-gray-300">
                  White-glove shipping, presentation-grade handoffs, and concierge-level support.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-3">Exit Strategy Playbooks</h3>
                <p className="text-gray-300">
                  Resale and reinvestment pathways built before you even buy.
                </p>
              </div>
            </div>
          </div>
          
          {/* Services Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-8 rounded-xl border border-gray-800">
              <div className="bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Car className="h-8 w-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-orbitron text-blue-500 mb-4">Automotive Assets</h2>
              <p className="text-gray-300 mb-6">
                From exotic cars to collectible classics, we handle sourcing, authentication, and secure transactions with white-glove service.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-white">Exotic and supercar sourcing</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-white">Strategic flip guidance and market timing</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-white">White-glove delivery and presentation</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-white">Investment-grade collection management</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-8 rounded-xl border border-gray-800">
              <div className="bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Watch className="h-8 w-8 text-purple-500" />
              </div>
              <h2 className="text-2xl font-orbitron text-purple-500 mb-4">Timepiece Collection</h2>
              <p className="text-gray-300 mb-6">
                Partnered with Bennisson, we offer luxury watch brokerage, verification, and access to rare and limited timepieces with complete authenticity assurance.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-white">Rare and limited-edition sourcing</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-white">Authentication by master watchmakers</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-white">Strategic collection building and management</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-white">Secure escrow and insured transactions</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* How to Take Advantage */}
          <div className="mb-16">
            <h2 className="text-3xl font-orbitron text-blue-500 text-center mb-10">🤝 How to Take Advantage</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-3">Submit an Asset Match Order</h3>
                <p className="text-gray-300">
                  Whether you're flipping, flexing, gifting, or investing—start with clarity.
                </p>
              </div>
              
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-3">Browse Vault Briefs™</h3>
                <p className="text-gray-300">
                  See curated, margin-optimized assets without public-listing headaches.
                </p>
              </div>
              
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-3">Work with Bennisson</h3>
                <p className="text-gray-300">
                  Every timepiece sourced, inspected, or listed through Tires & Timepieces™ is authenticated by master watchmakers.
                </p>
              </div>
              
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-3">Use Flip Forecasts™</h3>
                <p className="text-gray-300">
                  Understand the real story behind every flip opportunity—before you sign.
                </p>
              </div>
              
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-3">Reinvest With Precision</h3>
                <p className="text-gray-300">
                  Flip. Upgrade. Repeat—with concierge logic behind every move.
                </p>
              </div>
            </div>
          </div>
          
          {/* About Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-orbitron text-blue-500 text-center mb-8">💎 About Tires & Timepieces™</h2>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-8 rounded-xl border border-gray-800 mb-8">
              <p className="text-gray-300 mb-4">
                We started Tires & Timepieces™ because the traditional dealership model is broken—and trust in asset transactions is rare.
              </p>
              <p className="text-gray-300 mb-4">
                We saw how many flips fell apart because the sourcing was sloppy, the paperwork was shady, or the margin wasn't protected.
              </p>
              <p className="text-gray-300 mb-6">
                T&T fixes that:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-900/70 p-4 rounded-lg text-center">
                  <p className="text-white font-semibold">Sourcing like insiders.</p>
                </div>
                <div className="bg-gray-900/70 p-4 rounded-lg text-center">
                  <p className="text-white font-semibold">Inspecting like owners.</p>
                </div>
                <div className="bg-gray-900/70 p-4 rounded-lg text-center">
                  <p className="text-white font-semibold">Protecting like brokers.</p>
                </div>
                <div className="bg-gray-900/70 p-4 rounded-lg text-center">
                  <p className="text-white font-semibold">Delivering like builders.</p>
                </div>
              </div>
              <p className="text-gray-300">
                Whether you're flipping an SF90, sourcing a Rolex Starbucks, or gifting a Patek, Tires & Timepieces™ is the strategic concierge in your corner.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-lg border border-blue-900/30 text-center">
              <p className="text-xl text-white font-medium mb-2">Sourced. Structured. Sealed.™</p>
              <p className="text-gray-300">That's our promise.</p>
            </div>
          </div>
          
          {/* Featured Listings Placeholder */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-orbitron text-blue-500">Featured Assets</h2>
              <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* This section will be populated with actual listings in the future */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-xl border border-gray-800 overflow-hidden">
                <div className="h-48 bg-gray-800 flex items-center justify-center">
                  <p className="text-gray-400">Asset Image Placeholder</p>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white">Ferrari F8 Tributo</h3>
                    <div className="bg-blue-900/60 px-2 py-1 rounded text-xs text-blue-300">Automotive</div>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">2023 • 1,200 miles • Rosso Corsa</p>
                  <div className="flex justify-between items-center">
                    <span className="text-green-500 font-semibold">$399,000</span>
                    <button className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-xl border border-gray-800 overflow-hidden">
                <div className="h-48 bg-gray-800 flex items-center justify-center">
                  <p className="text-gray-400">Asset Image Placeholder</p>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white">Patek Philippe Nautilus</h3>
                    <div className="bg-purple-900/60 px-2 py-1 rounded text-xs text-purple-300">Timepiece</div>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">Ref. 5711/1A • Full Set • Unworn</p>
                  <div className="flex justify-between items-center">
                    <span className="text-green-500 font-semibold">$179,500</span>
                    <button className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-xl border border-gray-800 overflow-hidden">
                <div className="h-48 bg-gray-800 flex items-center justify-center">
                  <p className="text-gray-400">Asset Image Placeholder</p>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white">Porsche 911 GT3</h3>
                    <div className="bg-blue-900/60 px-2 py-1 rounded text-xs text-blue-300">Automotive</div>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">2022 • 3,500 miles • Shark Blue</p>
                  <div className="flex justify-between items-center">
                    <span className="text-green-500 font-semibold">$249,000</span>
                    <button className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Final Word */}
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-xl border border-gray-800 mb-16">
            <h2 className="text-2xl font-orbitron text-blue-500 text-center mb-6">🔑 Final Word</h2>
            <p className="text-gray-300 text-center max-w-3xl mx-auto mb-8">
              This isn't about flexing louder.<br />
              It's about flipping smarter, sourcing tighter, and living bigger—one grail at a time.<br />
              When you're ready to move differently, Tires & Timepieces™ is built for you.
            </p>
            
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-lg border border-blue-900/30 mb-8">
              <h3 className="text-xl font-orbitron text-white text-center mb-3">🚀 Elevator Pitch</h3>
              <p className="text-gray-300 text-center">
                🏁 Tires & Timepieces™: Where Passion Meets Precision.<br />
                Powered by GoTime Motorsports™.<br />
                We don't just move inventory—we move dreams.<br />
                From exotic flips to grail watches, T&T is your strategic partner for sourcing, selling, flipping, and legacy-building.<br />
                Concierge moves. Curated margins. Concierge care.<br />
                Trust the standard. Move the market.™
              </p>
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-xl font-medium text-white mb-3">✍️ Our Promise</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700">
                  <p className="text-blue-400 font-medium">"Move Smarter. Flex Cleaner. Live Bigger."</p>
                </div>
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700">
                  <p className="text-blue-400 font-medium">"Where Assets Meet Ambition."</p>
                </div>
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700">
                  <p className="text-blue-400 font-medium">"Curated Dreams. Concierge Moves.™"</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Submit a Request
              </button>
              <button className="bg-transparent border border-blue-600 hover:bg-blue-900/20 text-blue-400 px-6 py-3 rounded-lg font-medium transition-colors">
                Schedule a Consultation
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default TiresTimepieces;