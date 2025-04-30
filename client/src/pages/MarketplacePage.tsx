import React from 'react';
import { ShoppingCart, Package, Search } from 'lucide-react';

const MarketplacePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Marketplace</h1>
            <p className="text-gray-400 mt-2">
              Shop for products with the JuiceBox™ system for your vehicle needs
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="bg-gray-900 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
            </div>
            
            <button className="relative bg-blue-600 p-2.5 rounded-lg text-white">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>
        
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-3">Marketplace Coming Soon</h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Our product marketplace with JuiceBox™ system integration is under development.
            Check back soon for detailing products, tools, and accessories for your vehicles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;