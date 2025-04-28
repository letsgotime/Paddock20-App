import React, { useRef } from 'react';
import { Watch, Car, Check, Star, Shield, Tag, Search, Clock, ArrowRight } from 'lucide-react';
import ExportOptions from '../components/ExportOptions';

const TiresTimepieces: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Export Options */}
        <div className="flex justify-end mb-6">
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
        
        <div ref={contentRef}>
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-orbitron text-blue-500 mb-4">Tires & Timepieces™</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Full-Service Luxury Asset Brokerage
            </p>
            <div className="mt-6 text-lg text-gray-400 max-w-3xl mx-auto">
              From exotic cars to fine timepieces, we handle every aspect of buying, selling, and trading within our trusted network of verified partners.
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
                Our expert automotive brokers source, authenticate, and facilitate transactions for rare and high-value vehicles, from modern exotics to vintage classics.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-white">Exotic and supercar sourcing</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-white">Private seller representation</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-white">Secure global shipping and transport</span>
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
                Partnered with Bennisson, we offer full-service luxury watch brokerage, authenticity verification, and worldwide access to rare and limited timepieces.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-white">Rare and limited-edition sourcing</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-white">Authentication and appraisal services</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-white">Global watchmaker and repair network</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-white">Secure escrow and insured transactions</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-orbitron text-blue-500 text-center mb-10">How Our Brokerage Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <div className="bg-blue-900/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">1. Request & Search</h3>
                <p className="text-gray-300">
                  Submit your specific requirements or browse our private inventory of available assets not listed on public markets.
                </p>
              </div>
              
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <div className="bg-blue-900/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">2. Verification</h3>
                <p className="text-gray-300">
                  Our experts authenticate, inspect, and verify the condition, provenance, and value of each asset before proceeding.
                </p>
              </div>
              
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <div className="bg-blue-900/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Tag className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">3. Secure Transaction</h3>
                <p className="text-gray-300">
                  We handle all paperwork, payment, logistics, and secure transfers, with optional escrow services for complete peace of mind.
                </p>
              </div>
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
          
          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/20 p-8 rounded-xl border border-blue-900/40 text-center mb-16">
            <h2 className="text-2xl font-orbitron text-blue-400 mb-4">Ready to Buy, Sell, or Trade?</h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-6">
              Whether you're looking to acquire your dream car, sell a timepiece, or trade up to something new, our concierge team is ready to assist you every step of the way.
            </p>
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
      </div>
    </div>
  );
};

export default TiresTimepieces;