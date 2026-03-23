import React from 'react';
import GlossResetChecklist from '../components/GlossResetChecklist';

function GlossResetPage() {
  return (
    <div className="p-10 bg-black min-h-screen">
      <h1 className="apex-header text-3xl mb-6 text-center">
        ApexVault™ Gloss Reset Protocol
      </h1>
      
      <p className="text-white text-center mb-8">
        Track and maintain your vehicle's gloss restoration with our step-by-step protocol.
      </p>
      
      <GlossResetChecklist />
    </div>
  );
}

export default GlossResetPage;