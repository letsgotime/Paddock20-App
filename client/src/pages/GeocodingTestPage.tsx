import React from 'react';
import { EnhancedLocationProvider } from '@/contexts/EnhancedLocationContext';
import GeocodeExplorer from '@/components/GeocodeExplorer';

const GeocodingTestPage: React.FC = () => {
  return (
    <EnhancedLocationProvider>
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">OpenCage Geocoding Explorer</h1>
            <p className="text-muted-foreground mt-2">
              Ultra-conservative implementation with 1 request/day limit and permanent caching
            </p>
          </div>
          
          <div className="border-b pb-2" />
          
          <GeocodeExplorer />
        </div>
      </div>
    </EnhancedLocationProvider>
  );
};

export default GeocodingTestPage;