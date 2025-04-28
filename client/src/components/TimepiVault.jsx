import React, { useState, useEffect } from 'react';
import { 
  Watch, ChevronRight, ChevronLeft, Clock, Calendar, Settings, 
  Sparkles, Shield, AlertTriangle, CheckCircle, DollarSign, 
  PlusCircle, RefreshCw, ArrowUpRight, Search
} from 'lucide-react';
import timepieceDataService from '../services/timepieceDataService';
import ProgressSparkline from './ProgressSparkline';
import progressDataService from '../services/progressDataService';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * TimepiVault Component
 * A comprehensive dashboard for managing and displaying luxury timepiece collections
 */
function TimepiVault() {
  // Access timepiece data from the store
  const useTimepieceStore = timepieceDataService.useTimepieceStore;
  const { timepieces, isLoading, setActiveTimepiece } = useTimepieceStore(state => ({
    timepieces: state.timepieces,
    isLoading: state.isLoading,
    setActiveTimepiece: state.setActiveTimepiece
  }));
  
  // Access progress metrics from the progress store
  const useProgressStore = progressDataService.useProgressStore;
  const dreamWatchProgress = useProgressStore(state => 
    state.getMetricByKey('dreamWatchProgress')
  );
  
  // Local state
  const [selectedTimepiece, setSelectedTimepiece] = useState(null);
  const [view, setView] = useState('collection'); // collection, details, acquisitions, market
  const [marketTrend, setMarketTrend] = useState('up'); // up, down, stable
  const [marketData, setMarketData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter timepieces 
  const ownedTimepieces = timepieces.filter(t => t.isOwned);
  const dreamTimepieces = timepieces.filter(t => !t.isOwned);
  
  // Filter by search query
  const filteredOwnedTimepieces = ownedTimepieces.filter(t => 
    searchQuery === '' || 
    `${t.brand} ${t.model} ${t.reference}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredDreamTimepieces = dreamTimepieces.filter(t => 
    searchQuery === '' || 
    `${t.brand} ${t.model} ${t.reference}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle timepiece selection
  const handleSelectTimepiece = (timepiece) => {
    setSelectedTimepiece(timepiece);
    setActiveTimepiece(timepiece.id);
    setView('details');
  };
  
  // Generate market data for display
  useEffect(() => {
    // Create historical price data
    const now = new Date();
    const data = [];
    
    // Create 12 months of data
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      
      // Base value and direction
      let value = 30000;
      if (marketTrend === 'up') {
        value = 30000 + (i * 800) + (Math.random() * 1000 - 500);
      } else if (marketTrend === 'down') {
        value = 30000 - (i * 500) + (Math.random() * 1000 - 500);
      } else {
        value = 30000 + (Math.random() * 2000 - 1000);
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, Math.round(value))
      });
    }
    
    setMarketData(data);
  }, [marketTrend]);
  
  // Display loading state
  if (isLoading) {
    return (
      <div className="apex-card p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Collection View
  if (view === 'collection') {
    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="apex-card p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="font-orbitron text-2xl text-blue-400 mb-1 flex items-center">
                <Watch className="mr-2" /> TimepiVault™
              </h2>
              <p className="text-gray-400 text-sm">
                Your personal timepiece collection and acquisition tracker
              </p>
            </div>
            
            <div className="flex space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search collection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/40 border border-gray-700 rounded-lg px-8 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-60"
                />
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              </div>
              
              <button 
                onClick={() => setView('market')}
                className="bg-black/40 hover:bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-blue-400 flex items-center"
              >
                <DollarSign className="h-4 w-4 mr-1" /> Market
              </button>
              
              <button 
                onClick={() => setView('acquisitions')}
                className="bg-black/40 hover:bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-green-400 flex items-center"
              >
                <PlusCircle className="h-4 w-4 mr-1" /> Add
              </button>
            </div>
          </div>
        </div>
        
        {/* Collection Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="apex-card p-6 flex items-center bg-gradient-to-br from-gray-900 to-gray-900/40">
            <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center mr-4">
              <Watch className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <div className="text-gray-400 text-xs">Collection Size</div>
              <div className="text-white text-xl font-medium">{ownedTimepieces.length} Timepieces</div>
            </div>
          </div>
          
          <div className="apex-card p-6 flex items-center bg-gradient-to-br from-gray-900 to-gray-900/40">
            <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center mr-4">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <div className="text-gray-400 text-xs">Collection Value</div>
              <div className="text-white text-xl font-medium">
                {formatCurrency(ownedTimepieces.reduce((sum, t) => sum + (t.marketValue || 0), 0))}
              </div>
            </div>
          </div>
          
          <div className="apex-card p-6 flex items-center bg-gradient-to-br from-gray-900 to-gray-900/40">
            <div className="w-12 h-12 rounded-full bg-yellow-900/30 flex items-center justify-center mr-4">
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-gray-400 text-xs">Dream List</div>
              <div className="text-white text-xl font-medium">{dreamTimepieces.length} Watches</div>
            </div>
          </div>
          
          <div className="apex-card p-6 flex items-center bg-gradient-to-br from-gray-900 to-gray-900/40">
            <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center mr-4">
              <Shield className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <div className="text-gray-400 text-xs">Service Due</div>
              <div className="text-white text-xl font-medium">
                {ownedTimepieces.filter(t => {
                  if (!t.lastService) return false;
                  const lastServiceDate = new Date(t.lastService);
                  const today = new Date();
                  const yearsSinceService = (today - lastServiceDate) / (1000 * 60 * 60 * 24 * 365);
                  return yearsSinceService > 5;
                }).length} Watches
              </div>
            </div>
          </div>
        </div>
        
        {/* Collection Grid */}
        <div className="flex flex-col space-y-6">
          {/* Owned Collection */}
          <div className="apex-card p-6">
            <h3 className="font-orbitron text-lg text-blue-400 mb-4 flex items-center">
              <Watch className="mr-2 h-5 w-5" /> Your Collection
            </h3>
            
            {filteredOwnedTimepieces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOwnedTimepieces.map(timepiece => (
                  <div 
                    key={timepiece.id}
                    className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-800 hover:border-blue-500 transition-all cursor-pointer"
                    onClick={() => handleSelectTimepiece(timepiece)}
                  >
                    <div className="aspect-w-16 aspect-h-9 bg-black/50 overflow-hidden">
                      {timepiece.image ? (
                        <img 
                          src={timepiece.image} 
                          alt={`${timepiece.brand} ${timepiece.model}`}
                          className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Watch className="h-10 w-10 text-gray-700" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-medium truncate">{timepiece.brand}</h4>
                          <p className="text-gray-400 truncate">{timepiece.model}</p>
                        </div>
                        
                        <div className="bg-black/40 px-2 py-1 rounded-full border border-gray-800">
                          <span className="text-xs text-blue-400">{timepiece.year}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t border-gray-800 flex justify-between">
                        <div className="text-xs text-gray-500">Reference: {timepiece.reference}</div>
                        
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 text-blue-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add New Watch Card */}
                <div 
                  className="bg-gray-900/20 rounded-lg overflow-hidden border border-dashed border-gray-700 hover:border-green-500 transition-all cursor-pointer flex flex-col items-center justify-center p-8"
                  onClick={() => setView('acquisitions')}
                >
                  <PlusCircle className="h-10 w-10 text-green-500 mb-3" />
                  <p className="text-green-400 font-medium">Add Timepiece</p>
                  <p className="text-gray-500 text-sm mt-1">Track a new acquisition</p>
                </div>
              </div>
            ) : (
              <div className="bg-black/20 rounded-lg p-8 text-center">
                <Watch className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No timepieces in your collection yet</p>
                <button 
                  onClick={() => setView('acquisitions')}
                  className="mt-4 inline-flex items-center px-3 py-2 border border-gray-700 bg-black/30 rounded-lg text-blue-400 hover:bg-black/50 transition-colors"
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Your First Timepiece
                </button>
              </div>
            )}
          </div>
          
          {/* Dream Timepieces Section */}
          <div className="apex-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-orbitron text-lg text-yellow-400 flex items-center">
                <Sparkles className="mr-2 h-5 w-5" /> Dream Timepieces
              </h3>
              
              <div className="flex items-center">
                <div className="text-xs text-gray-400 mr-2">Overall Progress:</div>
                <div className="text-sm text-white">{dreamWatchProgress?.current || 0}%</div>
              </div>
            </div>
            
            {filteredDreamTimepieces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDreamTimepieces.map(timepiece => (
                  <div 
                    key={timepiece.id}
                    className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-800 hover:border-yellow-500 transition-all cursor-pointer"
                    onClick={() => handleSelectTimepiece(timepiece)}
                  >
                    <div className="aspect-w-16 aspect-h-9 bg-black/50 overflow-hidden">
                      {timepiece.image ? (
                        <img 
                          src={timepiece.image} 
                          alt={`${timepiece.brand} ${timepiece.model}`}
                          className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Watch className="h-10 w-10 text-gray-700" />
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-white">{timepiece.progressToGoal || 0}% to goal</div>
                          <div className="text-xs text-yellow-400">Dream Watch</div>
                        </div>
                        <div className="w-full h-1 bg-black/60 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full bg-yellow-500" 
                            style={{ width: `${timepiece.progressToGoal || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-medium truncate">{timepiece.brand}</h4>
                          <p className="text-gray-400 truncate">{timepiece.model}</p>
                        </div>
                        
                        <div className="bg-black/40 px-2 py-1 rounded-full border border-gray-800">
                          <span className="text-xs text-yellow-400">{timepiece.year}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t border-gray-800 flex justify-between">
                        <div className="text-xs text-gray-500">Reference: {timepiece.reference}</div>
                        
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 text-yellow-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add New Dream Watch Card */}
                <div 
                  className="bg-gray-900/20 rounded-lg overflow-hidden border border-dashed border-gray-700 hover:border-yellow-500 transition-all cursor-pointer flex flex-col items-center justify-center p-8"
                  onClick={() => setView('acquisitions')}
                >
                  <PlusCircle className="h-10 w-10 text-yellow-400 mb-3" />
                  <p className="text-yellow-400 font-medium">Add Dream Timepiece</p>
                  <p className="text-gray-500 text-sm mt-1">Start tracking your next goal</p>
                </div>
              </div>
            ) : (
              <div className="bg-black/20 rounded-lg p-8 text-center">
                <Sparkles className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No dream timepieces added yet</p>
                <button 
                  onClick={() => setView('acquisitions')}
                  className="mt-4 inline-flex items-center px-3 py-2 border border-gray-700 bg-black/30 rounded-lg text-yellow-400 hover:bg-black/50 transition-colors"
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Dream Timepiece
                </button>
              </div>
            )}
          </div>
          
          {/* Market Trends Teaser */}
          <div className="apex-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-orbitron text-lg text-green-400 flex items-center">
                <DollarSign className="mr-2 h-5 w-5" /> Market Pulse
              </h3>
              
              <button 
                onClick={() => setView('market')}
                className="text-sm text-green-400 flex items-center"
              >
                View Full Market Data <ArrowUpRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm text-white">Patek Philippe Index</h4>
                  <div className="text-green-400 text-sm">+3.2%</div>
                </div>
                <ProgressSparkline 
                  data={marketData}
                  dataKey="value"
                  height={60}
                  type="area"
                  color="#22c55e"
                />
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm text-white">Rolex Index</h4>
                  <div className="text-green-400 text-sm">+8.7%</div>
                </div>
                <ProgressSparkline 
                  data={marketData.map(item => ({ 
                    date: item.date, 
                    value: item.value * 1.1 + Math.random() * 1000
                  }))}
                  dataKey="value"
                  height={60}
                  type="area"
                  color="#22c55e"
                />
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm text-white">Omega Index</h4>
                  <div className="text-red-400 text-sm">-1.3%</div>
                </div>
                <ProgressSparkline 
                  data={marketData.map(item => ({ 
                    date: item.date, 
                    value: item.value * 0.95 - Math.random() * 500
                  }))}
                  dataKey="value"
                  height={60}
                  type="area"
                  color="#ef4444"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Timepiece Detail View
  if (view === 'details' && selectedTimepiece) {
    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="apex-card p-6 mb-6">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setView('collection')}
              className="flex items-center text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Back to Collection
            </button>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setView('acquisitions')}
                className="bg-black/40 hover:bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-blue-400 flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Update
              </button>
              
              <button 
                className="bg-black/40 hover:bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-green-400 flex items-center"
              >
                <Clock className="h-4 w-4 mr-1" /> Log Service
              </button>
            </div>
          </div>
        </div>
        
        {/* Timepiece Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Image and Basic Info */}
          <div className="lg:col-span-1">
            <div className="apex-card p-6 mb-6">
              <div className="relative aspect-w-1 aspect-h-1 bg-black/50 rounded-lg overflow-hidden mb-4">
                {selectedTimepiece.image ? (
                  <img 
                    src={selectedTimepiece.image} 
                    alt={`${selectedTimepiece.brand} ${selectedTimepiece.model}`}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Watch className="h-20 w-20 text-gray-700" />
                  </div>
                )}
                
                {!selectedTimepiece.isOwned && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                    DREAM WATCH
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-orbitron text-blue-400 mb-1">
                {selectedTimepiece.brand}
              </h2>
              <h3 className="text-lg text-white mb-3">
                {selectedTimepiece.model} <span className="text-gray-400">{selectedTimepiece.reference}</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-black/30 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Case Size</div>
                  <div className="text-white">{selectedTimepiece.caseSize}</div>
                </div>
                
                <div className="bg-black/30 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Year</div>
                  <div className="text-white">{selectedTimepiece.year}</div>
                </div>
                
                <div className="bg-black/30 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Movement</div>
                  <div className="text-white">{selectedTimepiece.movement}</div>
                </div>
                
                <div className="bg-black/30 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Water Resistance</div>
                  <div className="text-white">{selectedTimepiece.waterResistance}</div>
                </div>
              </div>
              
              {/* Display Progress if Dream Timepiece */}
              {!selectedTimepiece.isOwned && (
                <div className="mt-6 pt-4 border-t border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-400">Progress toward ownership</div>
                    <div className="text-white font-medium">{selectedTimepiece.progressToGoal || 0}%</div>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500"
                      style={{ width: `${selectedTimepiece.progressToGoal || 0}%` }}
                    ></div>
                  </div>
                  
                  <button className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 rounded-lg transition">
                    Update Progress
                  </button>
                </div>
              )}
            </div>
            
            {/* Market Value Card for owned watches */}
            {selectedTimepiece.isOwned && (
              <div className="apex-card p-6">
                <h3 className="font-orbitron text-lg text-green-400 mb-3 flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" /> Market Value
                </h3>
                
                <div className="text-3xl font-medium text-white mb-4">
                  {formatCurrency(selectedTimepiece.marketValue || 35000)}
                </div>
                
                <div className="mb-2 text-sm text-gray-400">
                  Value Trend (12 months)
                </div>
                
                <ProgressSparkline 
                  data={marketData}
                  dataKey="value"
                  height={100}
                  type="area"
                  interactive={true}
                  showTooltip={true}
                  tooltipValueFormat={(value) => formatCurrency(value)}
                  tooltipLabelFormat={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                />
                
                <div className="flex justify-between items-center mt-4 text-sm">
                  <div className="text-gray-400">Purchase Price</div>
                  <div className="text-white">{formatCurrency(selectedTimepiece.purchasePrice || 32000)}</div>
                </div>
                
                <div className="flex justify-between items-center mt-2 text-sm">
                  <div className="text-gray-400">Value Change</div>
                  <div className="text-green-400">+{formatCurrency((selectedTimepiece.marketValue || 35000) - (selectedTimepiece.purchasePrice || 32000))}</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Specs and Telemetry */}
          <div className="lg:col-span-2">
            <div className="apex-card p-6 mb-6">
              <h3 className="font-orbitron text-lg text-blue-400 mb-4 flex items-center">
                <Settings className="mr-2 h-5 w-5" /> Specifications
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/30 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Case Material</div>
                  <div className="text-white">{selectedTimepiece.caseMaterial}</div>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Dial Color</div>
                  <div className="text-white">{selectedTimepiece.dialColor}</div>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Bracelet Material</div>
                  <div className="text-white">{selectedTimepiece.braceletMaterial}</div>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Movement Type</div>
                  <div className="text-white">{selectedTimepiece.type}</div>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Power Reserve</div>
                  <div className="text-white">{selectedTimepiece.powerReserve}</div>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Movement Caliber</div>
                  <div className="text-white">{selectedTimepiece.movement}</div>
                </div>
              </div>
            </div>
            
            {/* Ownership & Service History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Ownership Info */}
              <div className="apex-card p-6">
                <h3 className="font-orbitron text-lg text-blue-400 mb-4 flex items-center">
                  <Shield className="mr-2 h-5 w-5" /> Ownership
                </h3>
                
                {selectedTimepiece.isOwned ? (
                  <div className="space-y-4">
                    <div className="bg-black/30 p-4 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Purchase Date</div>
                      <div className="text-white">
                        {selectedTimepiece.purchaseDate ? 
                          new Date(selectedTimepiece.purchaseDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Not recorded'}
                      </div>
                    </div>
                    
                    <div className="bg-black/30 p-4 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Serial Number</div>
                      <div className="text-white">{selectedTimepiece.serialNumber || 'Not recorded'}</div>
                    </div>
                    
                    <div className="bg-black/30 p-4 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Purchase Location</div>
                      <div className="text-white">{selectedTimepiece.purchaseLocation || 'Not recorded'}</div>
                    </div>
                    
                    <div className="bg-black/30 p-4 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Condition</div>
                      <div className="text-white">{selectedTimepiece.condition || 'Excellent'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-black/20 rounded-lg">
                    <Sparkles className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
                    <p className="text-gray-300 mb-2">Dream Timepiece</p>
                    <p className="text-gray-500 text-sm mb-4">Track your progress to acquire this piece</p>
                    <button className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium">
                      Set Target Price
                    </button>
                  </div>
                )}
              </div>
              
              {/* Service History */}
              <div className="apex-card p-6">
                <h3 className="font-orbitron text-lg text-blue-400 mb-4 flex items-center">
                  <Clock className="mr-2 h-5 w-5" /> Service History
                </h3>
                
                {selectedTimepiece.isOwned ? (
                  <div>
                    {selectedTimepiece.lastService ? (
                      <div className="space-y-4">
                        <div className="bg-black/30 p-4 rounded-lg flex justify-between items-center">
                          <div>
                            <div className="text-xs text-gray-500">Last Service</div>
                            <div className="text-white">
                              {new Date(selectedTimepiece.lastService).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <CheckCircle className="text-green-500 h-5 w-5" />
                          </div>
                        </div>
                        
                        <div className="bg-black/30 p-4 rounded-lg flex justify-between items-center">
                          <div>
                            <div className="text-xs text-gray-500">Service Interval</div>
                            <div className="text-white">5-7 years recommended</div>
                          </div>
                          
                          <div className="flex items-center text-xs px-2 py-1 rounded-full bg-green-900/20 text-green-400">
                            On Schedule
                          </div>
                        </div>
                        
                        <div className="bg-black/30 p-4 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Next Service Due</div>
                          <div className="text-white">
                            {selectedTimepiece.nextService ? 
                              new Date(selectedTimepiece.nextService).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long'
                              }) : 'Not scheduled'}
                          </div>
                        </div>
                        
                        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition mt-2">
                          View Full Service Records
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-black/20 rounded-lg">
                        <AlertTriangle className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
                        <p className="text-gray-300 mb-2">No Service History</p>
                        <p className="text-gray-500 text-sm mb-4">Add service records to track maintenance</p>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium">
                          Add Service Record
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-black/20 rounded-lg text-center">
                    <p className="text-gray-400">Service history will be available after acquisition</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Authentication & Documentation */}
            <div className="apex-card p-6">
              <h3 className="font-orbitron text-lg text-blue-400 mb-4 flex items-center">
                <Shield className="mr-2 h-5 w-5" /> Authentication & Documentation
              </h3>
              
              {selectedTimepiece.isOwned ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/30 p-4 rounded-lg flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-900/20 flex items-center justify-center mr-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Box</div>
                      <div className="text-xs text-gray-400">Original box</div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-900/20 flex items-center justify-center mr-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Papers</div>
                      <div className="text-xs text-gray-400">Original papers</div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg flex items-center">
                    <div className="w-10 h-10 rounded-full bg-yellow-900/20 flex items-center justify-center mr-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Certificate</div>
                      <div className="text-xs text-gray-400">Authentication pending</div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-3">
                    <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-lg transition mt-2 flex items-center justify-center">
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Documentation Photos
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-black/20 rounded-lg text-center">
                  <p className="text-gray-400">Documentation tracking will be available after acquisition</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Acquisitions View (Form for adding new timepieces)
  if (view === 'acquisitions') {
    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="apex-card p-6 mb-6">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setView('collection')}
              className="flex items-center text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Back to Collection
            </button>
            
            <h2 className="font-orbitron text-xl text-blue-400">
              {selectedTimepiece ? 'Update Timepiece' : 'Add New Timepiece'}
            </h2>
          </div>
        </div>
        
        {/* Acquisition Form */}
        <div className="apex-card p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Upload Image */}
            <div className="lg:col-span-1">
              <div className="bg-black/30 p-6 rounded-lg flex flex-col items-center justify-center">
                <div className="w-full aspect-w-1 aspect-h-1 bg-black/50 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                  <Watch className="h-20 w-20 text-gray-700" />
                </div>
                
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition mt-2">
                  Upload Image
                </button>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  High-quality images help with accurate market valuation
                </p>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center mb-4">
                  <input 
                    type="checkbox" 
                    id="isDreamWatch" 
                    className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-700 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="isDreamWatch" className="ml-2 text-gray-300">
                    This is a Dream Timepiece (not owned yet)
                  </label>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg" id="dreamWatchSection">
                  <h4 className="text-yellow-400 font-medium mb-3">Dream Timepiece Settings</h4>
                  
                  <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-1">Target Price</label>
                    <input 
                      type="text"
                      placeholder="30,000"
                      className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-1">Current Progress (%)</label>
                    <input 
                      type="number"
                      placeholder="25"
                      min="0"
                      max="100"
                      className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-1">Target Acquisition Date</label>
                    <input 
                      type="date"
                      className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Timepiece Details Form */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-1">Brand *</label>
                  <input 
                    type="text"
                    placeholder="Patek Philippe"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-1">Model *</label>
                  <input 
                    type="text"
                    placeholder="Nautilus"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-1">Reference Number *</label>
                  <input 
                    type="text"
                    placeholder="5711/1A-014"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-1">Year *</label>
                  <input 
                    type="number"
                    placeholder="2021"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-1">Type</label>
                  <select className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select Type</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual Wind</option>
                    <option value="Quartz">Quartz</option>
                    <option value="Chronograph">Automatic Chronograph</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-1">Case Size</label>
                  <input 
                    type="text"
                    placeholder="40mm"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-1">Case Material</label>
                  <select className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select Material</option>
                    <option value="Stainless Steel">Stainless Steel</option>
                    <option value="Yellow Gold">Yellow Gold</option>
                    <option value="White Gold">White Gold</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Titanium">Titanium</option>
                    <option value="Ceramic">Ceramic</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-1">Dial Color</label>
                  <input 
                    type="text"
                    placeholder="Olive Green"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-1">Bracelet Material</label>
                  <select className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select Material</option>
                    <option value="Stainless Steel">Stainless Steel</option>
                    <option value="Yellow Gold">Yellow Gold</option>
                    <option value="White Gold">White Gold</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Titanium">Titanium</option>
                    <option value="Leather">Leather</option>
                    <option value="Rubber">Rubber</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-1">Movement</label>
                  <input 
                    type="text"
                    placeholder="Caliber 26‑330 S C"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-1">Water Resistance</label>
                  <input 
                    type="text"
                    placeholder="120m"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-1">Power Reserve</label>
                  <input 
                    type="text"
                    placeholder="35-45 hours"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-1">Purchase Date</label>
                  <input 
                    type="date"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-1">Serial Number</label>
                  <input 
                    type="text"
                    placeholder="12345678"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-1">Purchase Price</label>
                  <input 
                    type="text"
                    placeholder="32,000"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-1">Current Market Value</label>
                  <input 
                    type="text"
                    placeholder="35,000"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4 md:col-span-2">
                  <label className="block text-gray-400 text-sm mb-1">Notes</label>
                  <textarea 
                    rows="4"
                    placeholder="Additional details about this timepiece..."
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => setView('collection')}
                  className="px-6 py-2 border border-gray-700 rounded-lg text-gray-400 mr-3 hover:bg-gray-900 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setView('collection')}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Save Timepiece
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Market View (Trends and marketplace data)
  if (view === 'market') {
    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="apex-card p-6 mb-6">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setView('collection')}
              className="flex items-center text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Back to Collection
            </button>
            
            <h2 className="font-orbitron text-xl text-green-400">
              <DollarSign className="inline-block mr-1 h-5 w-5" /> Timepiece Market Pulse
            </h2>
          </div>
        </div>
        
        {/* Market Controls */}
        <div className="apex-card p-6 mb-6">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex space-x-2">
              <button 
                onClick={() => setMarketTrend('up')}
                className={`px-3 py-1 rounded-md ${marketTrend === 'up' 
                  ? 'bg-green-500 text-black font-medium' 
                  : 'bg-black/30 text-gray-400 border border-gray-800'}`}
              >
                Rising Markets
              </button>
              <button 
                onClick={() => setMarketTrend('down')}
                className={`px-3 py-1 rounded-md ${marketTrend === 'down' 
                  ? 'bg-red-500 text-black font-medium' 
                  : 'bg-black/30 text-gray-400 border border-gray-800'}`}
              >
                Declining Markets
              </button>
              <button 
                onClick={() => setMarketTrend('stable')}
                className={`px-3 py-1 rounded-md ${marketTrend === 'stable' 
                  ? 'bg-blue-500 text-black font-medium' 
                  : 'bg-black/30 text-gray-400 border border-gray-800'}`}
              >
                Stable Markets
              </button>
            </div>
            
            <div className="flex items-center">
              <div className="text-gray-400 mr-3">Last updated:</div>
              <div className="text-white">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
        
        {/* Market Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="apex-card p-6">
            <h3 className="font-orbitron text-lg text-green-400 mb-4">Patek Philippe</h3>
            <div className="text-3xl font-medium text-white mb-2">
              {formatCurrency(marketData[marketData.length - 1]?.value || 0)}
            </div>
            <div className="text-green-400 text-sm mb-4">+3.2% (12 months)</div>
            
            <ProgressSparkline 
              data={marketData}
              dataKey="value"
              height={150}
              type="area"
              color="#22c55e"
              interactive={true}
              showTooltip={true}
              tooltipValueFormat={(value) => formatCurrency(value)}
            />
            
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">All-time high</span>
                <span className="text-white">{formatCurrency(Math.max(...marketData.map(d => d.value)))}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-400">All-time low</span>
                <span className="text-white">{formatCurrency(Math.min(...marketData.map(d => d.value)))}</span>
              </div>
            </div>
          </div>
          
          <div className="apex-card p-6">
            <h3 className="font-orbitron text-lg text-green-400 mb-4">Rolex</h3>
            <div className="text-3xl font-medium text-white mb-2">
              {formatCurrency((marketData[marketData.length - 1]?.value || 0) * 1.1)}
            </div>
            <div className="text-green-400 text-sm mb-4">+8.7% (12 months)</div>
            
            <ProgressSparkline 
              data={marketData.map(item => ({ 
                date: item.date, 
                value: item.value * 1.1 + Math.random() * 1000
              }))}
              dataKey="value"
              height={150}
              type="area"
              color="#22c55e"
              interactive={true}
              showTooltip={true}
              tooltipValueFormat={(value) => formatCurrency(value)}
            />
            
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Daytona Average</span>
                <span className="text-white">{formatCurrency(45000)}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-400">Submariner Average</span>
                <span className="text-white">{formatCurrency(15000)}</span>
              </div>
            </div>
          </div>
          
          <div className="apex-card p-6">
            <h3 className="font-orbitron text-lg text-red-400 mb-4">Omega</h3>
            <div className="text-3xl font-medium text-white mb-2">
              {formatCurrency((marketData[marketData.length - 1]?.value || 0) * 0.95)}
            </div>
            <div className="text-red-400 text-sm mb-4">-1.3% (12 months)</div>
            
            <ProgressSparkline 
              data={marketData.map(item => ({ 
                date: item.date, 
                value: item.value * 0.95 - Math.random() * 500
              }))}
              dataKey="value"
              height={150}
              type="area"
              color="#ef4444"
              interactive={true}
              showTooltip={true}
              tooltipValueFormat={(value) => formatCurrency(value)}
            />
            
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Speedmaster Average</span>
                <span className="text-white">{formatCurrency(7500)}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-400">Seamaster Average</span>
                <span className="text-white">{formatCurrency(6200)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Market Insights */}
        <div className="apex-card p-6">
          <h3 className="font-orbitron text-lg text-blue-400 mb-4">Market Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h4 className="text-white mb-2">Limited Edition Premiums</h4>
              <p className="text-gray-400 text-sm mb-3">
                Limited editions continue to command significant premiums over standard production models,
                particularly for Patek Philippe and Audemars Piguet special releases.
              </p>
              <div className="mt-2 pt-2 border-t border-gray-800">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Average Premium</span>
                  <span className="text-green-400">+35%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h4 className="text-white mb-2">Condition Impact</h4>
              <p className="text-gray-400 text-sm mb-3">
                Mint condition pieces with full box and papers can command 15-25% higher prices compared to 
                comparable watches without original documentation.
              </p>
              <div className="mt-2 pt-2 border-t border-gray-800">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Full Set Premium</span>
                  <span className="text-green-400">+20%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h4 className="text-white mb-2">Rising Stars</h4>
              <p className="text-gray-400 text-sm mb-3">
                Independent watchmakers like F.P. Journe and H. Moser & Cie have seen significant appreciation 
                as collectors seek distinctive alternatives to established brands.
              </p>
              <div className="mt-2 pt-2 border-t border-gray-800">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">YoY Growth</span>
                  <span className="text-green-400">+18.5%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <h4 className="text-white mb-2">Vintage Performance</h4>
              <p className="text-gray-400 text-sm mb-3">
                Vintage sports watches from the 1960s-1970s continue to outperform newer models in 
                terms of investment returns, particularly rare Rolex and Heuer chronographs.
              </p>
              <div className="mt-2 pt-2 border-t border-gray-800">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">5-Year Growth</span>
                  <span className="text-green-400">+65%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Fallback view
  return (
    <div className="apex-card p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-400">Loading TimepiVault...</p>
    </div>
  );
}

export default TimepiVault;