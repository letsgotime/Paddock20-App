import React from 'react';
import GlossGrowthTracker from '../components/GlossGrowthTracker';

function GlossGrowthPage() {
  return (
    <div className="p-10 bg-black min-h-screen">
      <h1 className="apex-header text-3xl mb-6 text-center">
        ApexVault™ Gloss Growth Tracker
      </h1>
      
      <p className="text-white text-center mb-8">
        Monitor your vehicle's paint gloss progress over time.
      </p>
      
      <GlossGrowthTracker />
    </div>
  );
}

export default GlossGrowthPage;