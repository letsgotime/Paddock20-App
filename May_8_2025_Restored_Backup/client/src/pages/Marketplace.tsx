import React from 'react';
import { Link } from 'react-router-dom';

function Marketplace() {
  return (
    <div className="p-10 bg-black min-h-screen">
      <h1 className="bts-header text-3xl mb-10 text-center">BTS™ Marketplace</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bts-card">
          <h2 className="bts-header-green mb-6">Car Parts & Accessories</h2>
          <p className="text-white mb-4">Coming soon - Browse performance parts and accessories from trusted partners.</p>
        </div>
        
        <div className="bts-card">
          <h2 className="bts-header-green mb-6">Track Day Tickets</h2>
          <p className="text-white mb-4">Coming soon - Find and book track days at circuits near you.</p>
        </div>
        
        <div className="bts-card">
          <h2 className="bts-header-green mb-6">Vehicle Listings</h2>
          <p className="text-white mb-4">Coming soon - Browse exclusive performance and collector vehicles.</p>
        </div>
        
        <div className="bts-card">
          <h2 className="bts-header-green mb-6">Juice Box™ System</h2>
          <p className="text-white mb-4">Access our premium detailing product collection and build your personal Juice Box.</p>
          <Link to="/juicebox" className="bts-button inline-block">
            Open Juice Box™
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Marketplace;