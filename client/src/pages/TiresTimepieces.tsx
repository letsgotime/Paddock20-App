import React, { useRef, useState, useEffect } from 'react';
import { 
  Watch, Car, Check, Star, Shield, Tag, Search, Clock, 
  ArrowRight, ChevronRight, ChevronLeft, Battery, Droplet, 
  Activity, Info, BarChart, LayoutDashboard, GitCompare,
  CloudOff, Database, Award, BarChart2, BarChart3,
  ArrowUpDown, Zap, PieChart, MoveHorizontal, History, Hammer,
  Fingerprint, Globe, Filter, DollarSign, ShoppingBag
} from 'lucide-react';
import ExportOptions from '../components/ExportOptions';
import TimepiVault from '../components/TimepiVault';
import TimepieceTelemetry from '../components/TimepieceTelemetry';
import TimepieceModelViewer from '../components/TimepieceModelViewer';
import VehicleTelemetry from '../components/VehicleTelemetry';
import timepieceDataService from '../services/timepieceDataService';
import marketplaceService from '../services/marketplaceService';
import MarketplaceListing from '../components/MarketplaceListing';
import MarketplaceManager from '../components/MarketplaceManager';

// Define interface for timepiece store state
interface TimepieceState {
  timepieces: any[];
  getActiveTimepiece: () => any;
  setActiveTimepiece: (id: string) => void;
}

const TiresTimepieces: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'timepiece-vault' | 'telemetry' | 'compare' | 'provenance' | 'analytics' | 'certification' | 'marketplace'>('overview');
  const [selectedTimepieceId, setSelectedTimepieceId] = useState<string | null>(null);
  
  // For comparison functionality
  const [compareItems, setCompareItems] = useState<string[]>([]);
  const [compareView, setCompareView] = useState<'specs' | 'market' | 'timeline'>('specs');
  
  // For analytics functionality
  const [analyticsView, setAnalyticsView] = useState<'market' | 'collection' | 'growth' | 'rarity'>('market');
  const [showCertificationDetails, setShowCertificationDetails] = useState(false);
  
  // For marketplace functionality
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [activeListingType, setActiveListingType] = useState<'all' | 'timepiece' | 'vehicle'>('all');
  const useMarketplaceStore = marketplaceService.useMarketplaceStore;
  const listings = useMarketplaceStore((state: any) => state.listings);
  const addListing = useMarketplaceStore((state: any) => state.addListing);
  const updateListing = useMarketplaceStore((state: any) => state.updateListing);
  const removeListing = useMarketplaceStore((state: any) => state.removeListing);
  const markAsSold = useMarketplaceStore((state: any) => state.markAsSold);
  const setAdminStatus = useMarketplaceStore((state: any) => state.setAdminStatus);
  
  // For collection and trading metrics
  const [portfolioMetrics, setPortfolioMetrics] = useState({
    totalValue: 0,
    annualAppreciation: 8.4,
    totalItems: 0,
    rarityScore: 8.7,
    liquidityScore: 7.2,
    topPerformer: '',
    topPerformerGrowth: 12.3
  });
  
  // Access timepiece data from store
  const useTimepieceStore = timepieceDataService.useTimepieceStore;
  const timepieces = useTimepieceStore((state: TimepieceState) => state.timepieces);
  const activeTimepiece = useTimepieceStore((state: TimepieceState) => state.getActiveTimepiece());
  const setActiveTimepiece = useTimepieceStore((state: TimepieceState) => state.setActiveTimepiece);
  
  // Set initial active timepiece if not already set - only on first render
  useEffect(() => {
    if (timepieces.length > 0 && !activeTimepiece && !selectedTimepieceId) {
      setActiveTimepiece(timepieces[0].id);
      setSelectedTimepieceId(timepieces[0].id);
    }
  }, []);
  
  // Update admin status in store when admin mode changes
  useEffect(() => {
    setAdminStatus(isAdminMode);
  }, [isAdminMode, setAdminStatus]);
  
  // Toggle admin mode for marketplace management
  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
  };
  
  // Get filtered listings based on active type
  const getFilteredListings = () => {
    if (activeListingType === 'all') {
      return listings;
    }
    return listings.filter((listing: any) => listing.type === activeListingType && !listing.sold);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Tabs Navigation - Enhanced for more prominence */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="w-full md:w-auto">
            <div className="flex flex-wrap w-full bg-gradient-to-r from-gray-900 to-black p-2 rounded-xl border-2 border-gray-800 shadow-lg">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center justify-center flex-1 px-5 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  activeTab === 'overview' 
                    ? 'bg-gradient-to-br from-blue-900 to-blue-800/70 text-blue-100 shadow-inner border border-blue-700' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="flex items-center">
                  <Car className="h-5 w-5 mr-2" />
                  <span className="hidden md:inline">T&T</span> Overview
                </span>
              </button>
              <button
                onClick={() => setActiveTab('timepiece-vault')}
                className={`flex items-center justify-center flex-1 px-5 py-3 rounded-lg text-base font-medium mx-2 transition-all duration-200 ${
                  activeTab === 'timepiece-vault' 
                    ? 'bg-gradient-to-br from-purple-900 to-purple-800/70 text-purple-100 shadow-inner border border-purple-700' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="flex items-center">
                  <Watch className="h-5 w-5 mr-2" /> 
                  <span className="hidden md:inline">Timepiece</span> Vault
                </span>
              </button>
              <button
                onClick={() => {
                  if (selectedTimepieceId || activeTimepiece) {
                    setSelectedTimepieceId(selectedTimepieceId || activeTimepiece?.id || null);
                    setActiveTab('telemetry');
                  }
                }}
                className={`flex items-center justify-center flex-1 px-5 py-3 rounded-lg text-base font-medium mx-2 transition-all duration-200 ${
                  activeTab === 'telemetry' 
                    ? 'bg-gradient-to-br from-green-900 to-green-800/70 text-green-100 shadow-inner border border-green-700' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                } ${(!selectedTimepieceId && !activeTimepiece) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!selectedTimepieceId && !activeTimepiece}
              >
                <span className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" /> 
                  <span className="hidden md:inline">Timepiece</span> Telemetry
                </span>
              </button>
              <button
                onClick={() => setActiveTab('compare')}
                className={`flex items-center justify-center flex-1 px-5 py-3 rounded-lg text-base font-medium mx-0 md:ml-2 mt-2 md:mt-0 transition-all duration-200 ${
                  activeTab === 'compare' 
                    ? 'bg-gradient-to-br from-amber-900 to-amber-800/70 text-amber-100 shadow-inner border border-amber-700' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2" /> 
                  <span className="hidden md:inline">Compare</span> Models
                </span>
              </button>
              <button
                onClick={() => setActiveTab('provenance')}
                className={`flex items-center justify-center flex-1 px-5 py-3 rounded-lg text-base font-medium ml-2 mt-2 md:mt-0 transition-all duration-200 ${
                  activeTab === 'provenance' 
                    ? 'bg-gradient-to-br from-rose-900 to-rose-800/70 text-rose-100 shadow-inner border border-rose-700' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" /> 
                  <span className="hidden md:inline">Authenticity</span> Check
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center justify-center flex-1 px-5 py-3 rounded-lg text-base font-medium ml-2 mt-2 md:mt-0 transition-all duration-200 ${
                  activeTab === 'analytics' 
                    ? 'bg-gradient-to-br from-indigo-900 to-indigo-800/70 text-indigo-100 shadow-inner border border-indigo-700' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2" /> 
                  <span className="hidden md:inline">Market</span> Analytics
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('certification')}
                className={`flex items-center justify-center flex-1 px-5 py-3 rounded-lg text-base font-medium ml-2 mt-2 md:mt-0 transition-all duration-200 ${
                  activeTab === 'certification' 
                    ? 'bg-gradient-to-br from-teal-900 to-teal-800/70 text-teal-100 shadow-inner border border-teal-700' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="flex items-center">
                  <Award className="h-5 w-5 mr-2" /> 
                  <span className="hidden md:inline">Official</span> Certification
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`flex items-center justify-center flex-1 px-5 py-3 rounded-lg text-base font-medium ml-2 mt-2 md:mt-0 transition-all duration-200 ${
                  activeTab === 'marketplace' 
                    ? 'bg-gradient-to-br from-amber-900 to-amber-800/70 text-amber-100 shadow-inner border border-amber-700' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="flex items-center">
                  <Tag className="h-5 w-5 mr-2" /> 
                  <span className="hidden md:inline">Private</span> Marketplace
                </span>
              </button>
            </div>
          </div>
          
          <div className="w-full md:w-auto flex justify-end mt-2 md:mt-0">
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
        
        {activeTab === 'marketplace' && (
          <div className="mb-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-orbitron text-amber-500 mb-3">Private Marketplace</h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Explore curated luxury timepieces and exotic vehicles available exclusively through Paddock20 for members.
              </p>
            </div>
            
            <MarketplaceManager 
              isAdmin={isAdminMode} 
              onAddListing={addListing} 
              onToggleAdmin={toggleAdminMode} 
            />
            
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center justify-between mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400">Filter by:</div>
                <div className="flex">
                  <button
                    onClick={() => setActiveListingType('all')}
                    className={`px-4 py-2 text-sm rounded-l-lg ${
                      activeListingType === 'all' 
                        ? 'bg-blue-900 text-blue-100' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveListingType('timepiece')}
                    className={`px-4 py-2 text-sm flex items-center ${
                      activeListingType === 'timepiece' 
                        ? 'bg-purple-900 text-purple-100' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <Watch className="h-4 w-4 mr-1" />
                    Watches
                  </button>
                  <button
                    onClick={() => setActiveListingType('vehicle')}
                    className={`px-4 py-2 text-sm rounded-r-lg flex items-center ${
                      activeListingType === 'vehicle' 
                        ? 'bg-green-900 text-green-100' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <Car className="h-4 w-4 mr-1" />
                    Vehicles
                  </button>
                </div>
              </div>
              <div className="flex items-center mt-2 md:mt-0">
                <div className="text-sm text-gray-400 mr-2">Sort by:</div>
                <select 
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                </select>
              </div>
            </div>
            
            {/* Marketplace Listings */}
            <div className="space-y-6">
              {getFilteredListings().length > 0 ? (
                getFilteredListings().map((listing: any) => (
                  <MarketplaceListing 
                    key={listing.id} 
                    listing={listing} 
                    isAdmin={isAdminMode}
                    onEdit={(listing) => {
                      // In a real implementation, open edit form with listing data
                      console.log('Edit listing:', listing);
                    }}
                    onDelete={(id) => {
                      if (window.confirm('Are you sure you want to remove this listing?')) {
                        removeListing(id);
                      }
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-gray-800">
                  <ShoppingBag className="h-12 w-12 text-gray-600 mb-4 mx-auto" />
                  <h3 className="text-xl font-medium text-gray-400 mb-2">No listings found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {isAdminMode 
                      ? 'Add a new listing using the form above.' 
                      : 'There are no listings available for the selected filter.'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Services and Expert Support */}
            <div className="mt-12">
              <h3 className="text-xl font-medium text-white mb-6 border-b border-gray-800 pb-2">Premium Marketplace Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800">
                  <div className="w-12 h-12 bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-amber-500" />
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">Timepiece Presentation Service</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Complete authentication and inspection by Bennisson watchmakers. Includes detailed photography and condition report.
                  </p>
                  <div className="text-amber-400 font-medium">$200</div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800">
                  <div className="w-12 h-12 bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                    <DollarSign className="h-6 w-6 text-blue-500" />
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">Escrow Service</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Secure third-party escrow service for high-value transactions. Includes authentication and transfer verification.
                  </p>
                  <div className="text-blue-400 font-medium">$75</div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800">
                  <div className="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-green-500" />
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">WTA Trader Special</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Comprehensive package including presentation service, escrow options, and full appraisal for insurance and resale.
                  </p>
                  <div className="text-green-400 font-medium">$360</div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800 md:col-span-3">
                  <div className="flex flex-col md:flex-row items-start md:items-center">
                    <div className="flex-grow">
                      <h4 className="text-lg font-medium text-white mb-2">Insured Worldwide Shipping</h4>
                      <p className="text-gray-400 text-sm">
                        Secure your high-value shipments with our specialized insurance coverage protecting against loss, damage, or theft during transit. Exclusive partnership with FedEx and Wexler Insurance Agency.
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6">
                      <button className="px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors">
                        Request Quote
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'provenance' && (
          <div className="mb-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-orbitron text-rose-500 mb-3">Timepiece Authenticity Verification</h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Complete provenance tracking, authentication certificates, and ownership history for your collection.
              </p>
            </div>
            
            {/* Authentication Verification Center */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-xl border border-gray-800 p-6 flex flex-col">
                <div className="w-14 h-14 bg-rose-900/20 rounded-full flex items-center justify-center mb-4">
                  <Fingerprint className="h-6 w-6 text-rose-500" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Authenticity Verification</h3>
                <p className="text-gray-400 mb-4 text-sm flex-grow">
                  Verify your timepiece authenticity through serial number validation and technical inspection reports.
                </p>
                <button className="w-full py-2 mt-2 bg-rose-900/50 text-rose-300 rounded-lg border border-rose-800 hover:bg-rose-800/50">
                  Start Verification
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-xl border border-gray-800 p-6 flex flex-col">
                <div className="w-14 h-14 bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Provenance Tracking</h3>
                <p className="text-gray-400 mb-4 text-sm flex-grow">
                  Track the complete ownership history, service records, and exhibition appearances of your timepiece.
                </p>
                <button className="w-full py-2 mt-2 bg-blue-900/50 text-blue-300 rounded-lg border border-blue-800 hover:bg-blue-800/50">
                  View Provenance
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-xl border border-gray-800 p-6 flex flex-col">
                <div className="w-14 h-14 bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Digital Certificates</h3>
                <p className="text-gray-400 mb-4 text-sm flex-grow">
                  Store and display digital certificates of authenticity, appraisal documents, and purchase proof.
                </p>
                <button className="w-full py-2 mt-2 bg-green-900/50 text-green-300 rounded-lg border border-green-800 hover:bg-green-800/50">
                  Manage Certificates
                </button>
              </div>
            </div>
            
            {/* Recent Authentication Activity */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-xl border border-gray-800 mb-8">
              <div className="p-6 border-b border-gray-800">
                <h3 className="text-xl font-medium text-white">Recent Authentication Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {timepieces.slice(0, 3).map((timepiece: any) => (
                    <div key={timepiece.id} className="bg-black/30 rounded-lg border border-gray-800 p-4">
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-rose-900/30 border border-rose-800 flex items-center justify-center mr-3 flex-shrink-0">
                          <Watch className="h-5 w-5 text-rose-400" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                            <div className="font-medium text-white">{timepiece.brand} {timepiece.model}</div>
                            <div className="text-sm text-rose-400">{new Date().toLocaleDateString()}</div>
                          </div>
                          <div className="text-sm text-gray-400 mb-2">Serial: {timepiece.serialNumber || 'xxxxxxxx'}</div>
                          <div className="flex items-center">
                            <div className="px-2 py-0.5 bg-green-900/30 border border-green-800 rounded text-green-400 text-xs">
                              Verified Authentic
                            </div>
                            <button className="ml-auto text-gray-400 hover:text-white text-sm">View Report</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Authentication Certificate Example */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-xl border border-gray-800">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-medium text-white">Certificate of Authenticity</h3>
                <div className="flex space-x-2">
                  <button className="p-2 bg-black/30 rounded-md border border-gray-700 text-gray-400">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-8">
                <div className="bg-white/5 backdrop-blur-sm border-2 border-gray-700 rounded-lg overflow-hidden">
                  <div className="p-8 text-center relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/certificate-bg.png')] opacity-10 mix-blend-overlay"></div>
                    
                    <div className="relative">
                      <div className="mb-8">
                        <div className="flex justify-center mb-2">
                          <div className="w-20 h-20 rounded-full bg-rose-900/30 border-2 border-rose-500 flex items-center justify-center">
                            <Shield className="h-8 w-8 text-rose-400" />
                          </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-1">Certificate of Authenticity</h2>
                        <p className="text-gray-400">Verified by Bennisson & GoTime Motorsports™</p>
                      </div>
                      
                      <div className="mb-8 mx-auto max-w-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="text-left">
                            <div className="text-gray-500 uppercase text-xs tracking-wider mb-1">Timepiece</div>
                            <div className="text-white font-medium">Patek Philippe Nautilus</div>
                            <div className="text-sm text-gray-400">Ref. 5711/1A-014</div>
                          </div>
                          
                          <div className="text-left">
                            <div className="text-gray-500 uppercase text-xs tracking-wider mb-1">Serial Number</div>
                            <div className="text-white font-medium">P9735XX2</div>
                            <div className="text-sm text-gray-400">Olive Green Dial</div>
                          </div>
                          
                          <div className="text-left">
                            <div className="text-gray-500 uppercase text-xs tracking-wider mb-1">Verification Date</div>
                            <div className="text-white font-medium">April 15, 2025</div>
                            <div className="text-sm text-gray-400">Valid for 5 years</div>
                          </div>
                          
                          <div className="text-left">
                            <div className="text-gray-500 uppercase text-xs tracking-wider mb-1">Authentication Method</div>
                            <div className="text-white font-medium">Full Technical Inspection</div>
                            <div className="text-sm text-gray-400">Movement & Case Verified</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-700 pt-6 mb-6 mx-auto max-w-xl">
                        <div className="text-left">
                          <div className="text-gray-500 uppercase text-xs tracking-wider mb-2">Expert Notes</div>
                          <div className="text-sm text-gray-300 mb-4">
                            This Patek Philippe Nautilus 5711/1A-014 with olive green dial has been thoroughly examined 
                            by our team of horological experts. All components are authentic, with matching serial numbers 
                            on the case and movement. The timepiece exhibits excellent condition consistent with its age and 
                            maintains chronometric performance within manufacturer specifications.
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mx-auto max-w-xl">
                        <div className="text-left">
                          <div className="text-gray-500 uppercase text-xs tracking-wider mb-1">Certificate ID</div>
                          <div className="text-white text-sm">BTM-25-58772-PP</div>
                        </div>
                        
                        <div className="w-20 h-20 rounded-lg bg-gray-900/50 border border-gray-700 flex items-center justify-center">
                          <div className="text-xs text-gray-400">QR Code</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'compare' && (
          <div className="mb-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-orbitron text-amber-500 mb-3">Timepiece Comparison Suite</h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Compare specifications, investment potential, and historical performance across multiple timepieces.
              </p>
            </div>
            
            {/* Compare Selection Panel */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h3 className="text-xl font-medium text-white mb-3 md:mb-0">Select Timepieces to Compare</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCompareView('specs')}
                    className={`px-3 py-1.5 rounded-md ${compareView === 'specs' 
                      ? 'bg-gradient-to-r from-amber-700 to-amber-900 text-white border border-amber-500' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                    <span className="flex items-center">
                      <Database className="h-4 w-4 mr-1" />
                      Specifications
                    </span>
                  </button>
                  <button
                    onClick={() => setCompareView('market')}
                    className={`px-3 py-1.5 rounded-md ${compareView === 'market' 
                      ? 'bg-gradient-to-r from-green-700 to-green-900 text-white border border-green-500' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                    <span className="flex items-center">
                      <BarChart2 className="h-4 w-4 mr-1" />
                      Market Analysis
                    </span>
                  </button>
                  <button
                    onClick={() => setCompareView('timeline')}
                    className={`px-3 py-1.5 rounded-md ${compareView === 'timeline' 
                      ? 'bg-gradient-to-r from-blue-700 to-blue-900 text-white border border-blue-500' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  >
                    <span className="flex items-center">
                      <History className="h-4 w-4 mr-1" />
                      Timeline
                    </span>
                  </button>
                </div>
              </div>
              
              {/* Timepiece Selection */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {timepieces.slice(0, 4).map((timepiece: any) => (
                  <div 
                    key={timepiece.id} 
                    className={`bg-black/30 rounded-lg border p-3 cursor-pointer transition-all ${
                      compareItems.includes(timepiece.id) 
                        ? 'border-amber-500 bg-amber-900/20' 
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => {
                      // Toggle selection
                      if (compareItems.includes(timepiece.id)) {
                        setCompareItems(compareItems.filter(id => id !== timepiece.id));
                      } else if (compareItems.length < 3) {
                        setCompareItems([...compareItems, timepiece.id]);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-amber-900/30 border border-amber-800 flex items-center justify-center mr-3">
                        <Watch className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{timepiece.brand}</div>
                        <div className="text-sm text-gray-400">{timepiece.model}</div>
                      </div>
                      {compareItems.includes(timepiece.id) && (
                        <div className="ml-auto">
                          <div className="w-6 h-6 rounded-full bg-amber-900/50 border border-amber-500 flex items-center justify-center">
                            <Check className="h-3 w-3 text-amber-300" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <div className="text-gray-500 text-sm mb-2">
                  {compareItems.length === 0 
                    ? 'Select up to 3 timepieces to compare' 
                    : compareItems.length === 1
                      ? 'Add 2 more timepieces to compare'
                      : compareItems.length === 2
                        ? 'Add 1 more timepiece to compare'
                        : '3 timepieces selected'}
                </div>
                {compareItems.length > 0 && (
                  <button
                    className="text-amber-400 underline text-sm"
                    onClick={() => setCompareItems([])}
                  >
                    Clear selection
                  </button>
                )}
              </div>
            </div>
            
            {/* Comparison Content */}
            {compareItems.length > 0 ? (
              <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-6 rounded-xl border border-gray-800">
                {/* Comparison Header */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="flex flex-col justify-end">
                    <div className="p-4 bg-black/40 rounded-lg border border-gray-800">
                      <h4 className="text-white text-lg mb-2">Comparison Criteria</h4>
                      <p className="text-gray-400 text-sm">
                        {compareView === 'specs' && 'Key specifications and features'}
                        {compareView === 'market' && 'Market trends and investment metrics'}
                        {compareView === 'timeline' && 'Historical timeline and events'}
                      </p>
                    </div>
                  </div>
                  
                  {compareItems.map(id => {
                    const timepiece = timepieces.find((t: any) => t.id === id);
                    return timepiece ? (
                      <div key={id} className="relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="px-3 py-1 bg-amber-900/70 border border-amber-600 rounded-full">
                            <span className="text-xs text-amber-200 font-medium">
                              {compareItems.indexOf(id) === 0 ? 'Primary' : 
                               compareItems.indexOf(id) === 1 ? 'Secondary' : 'Tertiary'}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 bg-amber-900/10 rounded-lg border border-amber-900/30 h-full">
                          <div className="font-bold text-amber-400 text-xl mb-1">{timepiece.brand}</div>
                          <div className="text-lg text-white mb-2">{timepiece.model}</div>
                          <div className="text-gray-400 text-sm">Ref. {timepiece.reference}</div>
                          <div className="mt-2 text-amber-300">${timepiece.marketValue?.toLocaleString() || 'N/A'}</div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
                
                {/* Comparison Content Based on View */}
                {compareView === 'specs' && (
                  <div className="space-y-8">
                    <div className="rounded-lg border border-gray-800 overflow-hidden">
                      <div className="bg-gray-900 p-4 border-b border-gray-800">
                        <h4 className="text-amber-400 font-medium">Core Specifications</h4>
                      </div>
                      <div className="divide-y divide-gray-800">
                        {/* Movement Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                          <div className="p-4 bg-black/20">
                            <div className="text-white font-medium">Movement</div>
                            <div className="text-sm text-gray-400">Type and specifications</div>
                          </div>
                          
                          {compareItems.map(id => {
                            const timepiece = timepieces.find((t: any) => t.id === id);
                            return timepiece ? (
                              <div key={id} className="p-4">
                                <div className="text-white">{timepiece.movement}</div>
                                <div className="text-sm text-gray-500 mt-1">Caliber {timepiece.caliber || '—'}</div>
                              </div>
                            ) : <div key={id} className="p-4 text-gray-500">—</div>;
                          })}
                        </div>
                        
                        {/* Case Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                          <div className="p-4 bg-black/20">
                            <div className="text-white font-medium">Case</div>
                            <div className="text-sm text-gray-400">Material and dimensions</div>
                          </div>
                          
                          {compareItems.map(id => {
                            const timepiece = timepieces.find((t: any) => t.id === id);
                            return timepiece ? (
                              <div key={id} className="p-4">
                                <div className="text-white">{timepiece.caseMaterial || '—'}</div>
                                <div className="text-sm text-gray-500 mt-1">{timepiece.caseDiameter || '—'} mm</div>
                              </div>
                            ) : <div key={id} className="p-4 text-gray-500">—</div>;
                          })}
                        </div>
                        
                        {/* Water Resistance Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                          <div className="p-4 bg-black/20">
                            <div className="text-white font-medium">Water Resistance</div>
                            <div className="text-sm text-gray-400">Depth rating</div>
                          </div>
                          
                          {compareItems.map(id => {
                            const timepiece = timepieces.find((t: any) => t.id === id);
                            return timepiece ? (
                              <div key={id} className="p-4">
                                <div className="text-white">{timepiece.waterResistance || '—'}</div>
                              </div>
                            ) : <div key={id} className="p-4 text-gray-500">—</div>;
                          })}
                        </div>
                        
                        {/* Power Reserve Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                          <div className="p-4 bg-black/20">
                            <div className="text-white font-medium">Power Reserve</div>
                            <div className="text-sm text-gray-400">Run time when fully wound</div>
                          </div>
                          
                          {compareItems.map(id => {
                            const timepiece = timepieces.find((t: any) => t.id === id);
                            return timepiece ? (
                              <div key={id} className="p-4">
                                <div className="text-white">{timepiece.powerReserve || '—'}</div>
                                <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden mt-2">
                                  <div 
                                    className="absolute top-0 left-0 h-full bg-amber-500"
                                    style={{ 
                                      width: timepiece.powerReserveHours ? 
                                        `${Math.min(100, (parseInt(timepiece.powerReserveHours) / 80) * 100)}%` : 
                                        '50%' 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ) : <div key={id} className="p-4 text-gray-500">—</div>;
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {/* More comparison sections */}
                    <div className="rounded-lg border border-gray-800 overflow-hidden">
                      <div className="bg-gray-900 p-4 border-b border-gray-800">
                        <h4 className="text-amber-400 font-medium">Performance Metrics</h4>
                      </div>
                      <div className="divide-y divide-gray-800">
                        {/* Accuracy Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                          <div className="p-4 bg-black/20">
                            <div className="text-white font-medium">Accuracy</div>
                            <div className="text-sm text-gray-400">Daily rate variation</div>
                          </div>
                          
                          {compareItems.map(id => {
                            const timepiece = timepieces.find((t: any) => t.id === id);
                            return timepiece ? (
                              <div key={id} className="p-4">
                                <div className="text-white">{timepiece.dailyRateVariation || '+/- 2 seconds/day'}</div>
                                <div className="flex items-center mt-2">
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    timepiece.accuracyScore > 90 ? 'bg-green-500' :
                                    timepiece.accuracyScore > 75 ? 'bg-blue-500' :
                                    timepiece.accuracyScore > 60 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}></div>
                                  <span className="text-sm text-gray-400">
                                    {timepiece.accuracyScore > 90 ? 'Excellent' :
                                     timepiece.accuracyScore > 75 ? 'Very Good' :
                                     timepiece.accuracyScore > 60 ? 'Good' : 'Fair'}
                                  </span>
                                </div>
                              </div>
                            ) : <div key={id} className="p-4 text-gray-500">—</div>;
                          })}
                        </div>
                        
                        {/* Service Status */}
                        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                          <div className="p-4 bg-black/20">
                            <div className="text-white font-medium">Service Status</div>
                            <div className="text-sm text-gray-400">Maintenance condition</div>
                          </div>
                          
                          {compareItems.map(id => {
                            const timepiece = timepieces.find((t: any) => t.id === id);
                            return timepiece ? (
                              <div key={id} className="p-4">
                                <div className={`text-${
                                  timepiece.serviceStatus === 'excellent' ? 'green' :
                                  timepiece.serviceStatus === 'good' ? 'blue' :
                                  timepiece.serviceStatus === 'due soon' ? 'amber' :
                                  timepiece.serviceStatus === 'overdue' ? 'red' : 'gray'
                                }-400 capitalize`}>
                                  {timepiece.serviceStatus || 'Unknown'}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {timepiece.lastService ? 
                                    `Last service: ${new Date(timepiece.lastService).toLocaleDateString()}` : 
                                    'No service history'
                                  }
                                </div>
                              </div>
                            ) : <div key={id} className="p-4 text-gray-500">—</div>;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {compareView === 'market' && (
                  <div className="space-y-8">
                    <div className="rounded-lg border border-gray-800 overflow-hidden">
                      <div className="bg-gray-900 p-4 border-b border-gray-800">
                        <h4 className="text-green-400 font-medium">Investment Metrics</h4>
                      </div>
                      <div className="divide-y divide-gray-800">
                        {/* Market Value */}
                        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                          <div className="p-4 bg-black/20">
                            <div className="text-white font-medium">Market Value</div>
                            <div className="text-sm text-gray-400">Current retail value</div>
                          </div>
                          
                          {compareItems.map(id => {
                            const timepiece = timepieces.find((t: any) => t.id === id);
                            return timepiece ? (
                              <div key={id} className="p-4">
                                <div className="text-lg font-medium text-white">
                                  ${timepiece.marketValue?.toLocaleString() || 'N/A'}
                                </div>
                                <div className="flex items-center mt-2">
                                  {timepiece.marketTrend === 'up' ? (
                                    <ArrowUpDown className="h-4 w-4 text-green-500 mr-2" />
                                  ) : timepiece.marketTrend === 'down' ? (
                                    <ArrowUpDown className="h-4 w-4 text-red-500 mr-2" />
                                  ) : (
                                    <ArrowUpDown className="h-4 w-4 text-amber-500 mr-2" />
                                  )}
                                  <span className="text-sm text-gray-400">
                                    {timepiece.marketTrendValue || '2.5%'} in past year
                                  </span>
                                </div>
                              </div>
                            ) : <div key={id} className="p-4 text-gray-500">—</div>;
                          })}
                        </div>
                        
                        {/* Rarity & Limited Edition */}
                        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                          <div className="p-4 bg-black/20">
                            <div className="text-white font-medium">Rarity Index</div>
                            <div className="text-sm text-gray-400">Production volume & availability</div>
                          </div>
                          
                          {compareItems.map(id => {
                            const timepiece = timepieces.find((t: any) => t.id === id);
                            return timepiece ? (
                              <div key={id} className="p-4">
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={16}
                                      className={`mr-0.5 ${
                                        timepiece.rarityScore >= star
                                          ? 'text-amber-400 fill-amber-400'
                                          : 'text-gray-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <div className="text-sm text-gray-400 mt-2">
                                  {timepiece.limitedEdition 
                                    ? `Limited to ${timepiece.limitedEditionNumber || '---'} pieces` 
                                    : 'Standard production'}
                                </div>
                              </div>
                            ) : <div key={id} className="p-4 text-gray-500">—</div>;
                          })}
                        </div>
                        
                        {/* Market Liquidity */}
                        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                          <div className="p-4 bg-black/20">
                            <div className="text-white font-medium">Market Liquidity</div>
                            <div className="text-sm text-gray-400">Ease of selling</div>
                          </div>
                          
                          {compareItems.map(id => {
                            const timepiece = timepieces.find((t: any) => t.id === id);
                            return timepiece ? (
                              <div key={id} className="p-4">
                                <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                  <div 
                                    className="absolute top-0 left-0 h-full bg-blue-500"
                                    style={{ width: `${timepiece.liquidityScore || 75}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between mt-2">
                                  <span className="text-xs text-gray-500">Low</span>
                                  <span className="text-xs text-gray-500">High</span>
                                </div>
                                <div className="text-sm text-gray-400 mt-1">
                                  {timepiece.liquidityScore > 80 ? 'Excellent demand' : 
                                   timepiece.liquidityScore > 60 ? 'Strong demand' : 
                                   timepiece.liquidityScore > 40 ? 'Moderate demand' : 'Limited demand'}
                                </div>
                              </div>
                            ) : <div key={id} className="p-4 text-gray-500">—</div>;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {compareView === 'timeline' && (
                  <div className="space-y-6">
                    <div className="rounded-lg border border-gray-800 overflow-hidden">
                      <div className="bg-gray-900 p-4 border-b border-gray-800">
                        <h4 className="text-blue-400 font-medium">Historical Timeline</h4>
                      </div>
                      <div className="p-6">
                        {/* Timeline content */}
                        <div className="flex items-start space-x-8 overflow-x-auto pb-4">
                          {compareItems.map(id => {
                            const timepiece = timepieces.find((t: any) => t.id === id);
                            if (!timepiece) return null;
                            
                            return (
                              <div key={id} className="min-w-[280px] flex-shrink-0">
                                <div className="bg-blue-900/20 rounded-lg border border-blue-900/30 p-4 mb-4">
                                  <div className="font-bold text-blue-400">{timepiece.brand} {timepiece.model}</div>
                                  <div className="text-white text-sm">Ref. {timepiece.reference}</div>
                                </div>
                                
                                {/* Timeline */}
                                <div className="relative pl-6 border-l-2 border-blue-800/50 space-y-6">
                                  {/* Model Release */}
                                  <div className="relative">
                                    <div className="absolute -left-[25px] mt-1">
                                      <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-gray-900"></div>
                                    </div>
                                    <div className="pb-4">
                                      <div className="text-blue-400 font-medium">Model Release</div>
                                      <div className="text-white">{timepiece.releaseYear || timepiece.year || '—'}</div>
                                      <div className="text-sm text-gray-400 mt-1">
                                        Original MSRP: ${timepiece.originalMSRP?.toLocaleString() || 'Unknown'}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Purchase Date */}
                                  <div className="relative">
                                    <div className="absolute -left-[25px] mt-1">
                                      <div className="w-5 h-5 rounded-full bg-green-600 border-2 border-gray-900"></div>
                                    </div>
                                    <div className="pb-4">
                                      <div className="text-green-400 font-medium">Purchase Date</div>
                                      <div className="text-white">
                                        {timepiece.purchaseDate ? 
                                          new Date(timepiece.purchaseDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                          }) : '—'
                                        }
                                      </div>
                                      <div className="text-sm text-gray-400 mt-1">
                                        Purchase price: ${timepiece.purchasePrice?.toLocaleString() || 'Unknown'}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Last Service */}
                                  <div className="relative">
                                    <div className="absolute -left-[25px] mt-1">
                                      <div className="w-5 h-5 rounded-full bg-purple-600 border-2 border-gray-900"></div>
                                    </div>
                                    <div className="pb-4">
                                      <div className="text-purple-400 font-medium">Last Service</div>
                                      <div className="text-white">
                                        {timepiece.lastService ? 
                                          new Date(timepiece.lastService).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                          }) : 'No service record'
                                        }
                                      </div>
                                      <div className="text-sm text-gray-400 mt-1">
                                        {timepiece.serviceProvider || 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Current Value */}
                                  <div className="relative">
                                    <div className="absolute -left-[25px] mt-1">
                                      <div className="w-5 h-5 rounded-full bg-amber-600 border-2 border-gray-900"></div>
                                    </div>
                                    <div>
                                      <div className="text-amber-400 font-medium">Current Value</div>
                                      <div className="text-white text-lg">
                                        ${timepiece.marketValue?.toLocaleString() || 'Unknown'}
                                      </div>
                                      <div className="text-sm text-gray-400 mt-1">
                                        As of {new Date().toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'long'
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 p-10 rounded-xl border border-gray-800 text-center">
                <div className="w-20 h-20 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GitCompare className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-2xl font-medium text-white mb-3">Select Timepieces to Compare</h3>
                <p className="text-gray-400 max-w-xl mx-auto mb-6">
                  Choose timepieces from your collection above to see detailed comparisons of specifications, market performance, and history.
                </p>
                <button
                  onClick={() => setActiveTab('timepiece-vault')}
                  className="px-4 py-2 bg-amber-900/50 text-amber-300 rounded-lg border border-amber-800 hover:bg-amber-800/50"
                >
                  Browse Timepiece Vault
                </button>
              </div>
            )}
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