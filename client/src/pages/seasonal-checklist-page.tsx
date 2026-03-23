import React from 'react';
import SeasonalChecklist from '../components/SeasonalChecklist';

function SeasonalChecklistPage() {
  return (
    <div className="p-10 bg-black min-h-screen">
      <h1 className="apex-header text-3xl mb-10 text-center">
        Seasonal Adaptation Checklist
      </h1>
      <SeasonalChecklist />
    </div>
  );
}

export default SeasonalChecklistPage;