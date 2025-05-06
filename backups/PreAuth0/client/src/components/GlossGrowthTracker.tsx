import React, { useState, useEffect } from 'react';

interface GlossEvent {
  date: string;
  event: string;
  glossScore: number;
  notes: string;
}

function GlossGrowthTracker() {
  const [glossEvents, setGlossEvents] = useState<GlossEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGlossGrowth() {
      try {
        setIsLoading(true);
        const response = await fetch('/data/GlossGrowthTracker.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch Gloss Growth data: ${response.status}`);
        }
        const data = await response.json();
        setGlossEvents(data);
        setError(null);
      } catch (err) {
        console.error('Error loading Gloss Growth data:', err);
        setError('Could not load the Gloss Growth Tracker. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchGlossGrowth();
  }, []);

  // Sort by date descending (most recent first)
  const sortedEvents = [...glossEvents].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="apex-card">
      <h2 className="apex-header-green mb-6 text-center">Gloss Growth Timeline</h2>

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading Gloss Growth data...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <p className="text-gray-400 mt-2">
            The Gloss Growth data will be available soon. In the meantime, you can browse our other sections.
          </p>
        </div>
      )}

      {!isLoading && !error && sortedEvents.length > 0 && (
        <div className="space-y-6">
          {/* Overall progress - current score */}
          {sortedEvents.length > 0 && (
            <div className="mb-8 bg-gray-900 p-6 rounded-lg">
              <h3 className="text-blue-400 font-orbitron text-lg mb-4">Current Gloss Status</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white">Starting Score: {sortedEvents[sortedEvents.length-1].glossScore}%</span>
                <span className="text-white">Current Score: {sortedEvents[0].glossScore}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-green-500 h-4 rounded-full" 
                  style={{ width: `${sortedEvents[0].glossScore}%` }}
                ></div>
              </div>
              <p className="text-gray-400 mt-4">
                {sortedEvents[0].glossScore > sortedEvents[sortedEvents.length-1].glossScore 
                  ? `Improvement: +${sortedEvents[0].glossScore - sortedEvents[sortedEvents.length-1].glossScore}%` 
                  : `Change: ${sortedEvents[0].glossScore - sortedEvents[sortedEvents.length-1].glossScore}%`
                }
              </p>
            </div>
          )}

          {/* Events timeline */}
          {sortedEvents.map((entry, index) => (
            <div key={index} className="mb-6 bg-black p-6 rounded-lg shadow-md">
              <h3 className="text-blue-400 font-orbitron text-lg mb-2">{formatDate(entry.date)} — {entry.event}</h3>
              <div className="flex items-center space-x-4 mb-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getColorForScore(entry.glossScore) }}
                ></div>
                <p className="text-white">Gloss Score: {entry.glossScore}%</p>
              </div>
              <p className="text-gray-400">{entry.notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getColorForScore(score: number): string {
  if (score >= 95) return '#10B981'; // Green
  if (score >= 90) return '#0EA5E9'; // Blue
  if (score >= 80) return '#F59E0B'; // Yellow/Orange
  if (score >= 70) return '#EF4444'; // Red
  return '#6B7280'; // Gray
}

export default GlossGrowthTracker;