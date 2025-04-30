import React from 'react';
import { GlossEvent } from '../data/detailingData';

interface GlossHistoryProps {
  events: GlossEvent[];
}

function GlossHistory({ events }: GlossHistoryProps) {
  // Sort events by date, most recent first
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <div className="apex-card mb-8">
      <h2 className="apex-header-green mb-6 text-center">Gloss Evolution Tracking</h2>
      
      <div className="mb-8">
        <div className="bg-gray-900 p-5 rounded-lg mb-6">
          <h3 className="text-blue-400 font-orbitron text-lg mb-4">Gloss Performance Score</h3>
          
          <div className="relative h-12 bg-gray-800 rounded-lg overflow-hidden mb-2">
            {sortedEvents.map((event, index) => {
              // Calculate position based on date
              const latestDate = new Date(sortedEvents[0].date).getTime();
              const earliestDate = new Date(sortedEvents[sortedEvents.length - 1].date).getTime();
              const currentDate = new Date(event.date).getTime();
              const position = earliestDate === latestDate 
                ? 50 
                : 100 - (((currentDate - earliestDate) / (latestDate - earliestDate)) * 100);
              
              return (
                <div 
                  key={index}
                  className="absolute top-0 w-2 h-12 transform -translate-x-1/2"
                  style={{ 
                    left: `${position}%`, 
                    backgroundColor: getColorForScore(event.glossScore) 
                  }}
                >
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full mx-auto"></div>
                    <div className="text-xs text-gray-400 whitespace-nowrap">{formatDate(event.date)}</div>
                  </div>
                </div>
              );
            })}
            
            {/* Score grid lines */}
            <div className="absolute inset-0 flex justify-between items-center px-2">
              <div className="text-xs text-gray-400">70</div>
              <div className="text-xs text-gray-400">80</div>
              <div className="text-xs text-gray-400">90</div>
              <div className="text-xs text-gray-400">100</div>
            </div>
          </div>
          
          <div className="text-center text-white mt-8">
            Current Gloss Score: <span className="text-green-500 font-bold">{sortedEvents[0].glossScore}/100</span>
          </div>
        </div>
      </div>
      
      <h3 className="text-blue-400 font-orbitron text-lg mb-4">Gloss History Log</h3>
      
      <div className="space-y-4">
        {sortedEvents.map((event, index) => (
          <div key={index} className="bg-black p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-green-400 font-orbitron text-md">{event.event}</h4>
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: getColorForScore(event.glossScore) }}
                ></div>
                <span className="text-white">{event.glossScore}/100</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-2">{formatDate(event.date)}</p>
            <p className="text-white">{event.notes}</p>
          </div>
        ))}
      </div>
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

export default GlossHistory;