import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

// Types for clock entries
interface ClockEntry {
  id: string;
  label: string;
  timezone: string;
  notes?: string;
  isPrimary?: boolean;
}

// Props definition
interface WorldClockPanelProps {
  className?: string;
  compact?: boolean;
}

const WorldClockPanel: React.FC<WorldClockPanelProps> = ({ className = "", compact = false }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clocks, setClocks] = useState<ClockEntry[]>([
    { 
      id: "local", 
      label: "Local", 
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, 
      isPrimary: true,
      notes: "Home Base" 
    },
    { 
      id: "utc", 
      label: "GMT/UTC", 
      timezone: "GMT",
      notes: "Reference" 
    },
    { 
      id: "motorsports-europe", 
      label: "CET", 
      timezone: "Europe/Berlin",
      notes: "Maranello" 
    }
  ]);

  // Update clocks every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date, timezone: string): string => {
    return date.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: compact ? undefined : "2-digit"
    });
  };
  
  const formatDate = (date: Date, timezone: string): string => {
    return date.toLocaleDateString("en-US", {
      timeZone: timezone,
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className={`world-clock-panel ${className}`}>
      {compact ? (
        // Compact display for limited space
        <div className="grid grid-cols-2 gap-2">
          {clocks.map((clock) => (
            <div 
              key={clock.id}
              className={`rounded-lg p-2 ${
                clock.isPrimary 
                  ? "bg-black/60 border border-blue-900/30" 
                  : "bg-black/40 border border-blue-900/20"
              }`}
            >
              <div className="text-xs text-gray-400 uppercase">{clock.label}</div>
              <div className={`font-mono ${clock.isPrimary ? "text-lg font-bold text-white" : "text-sm text-gray-300"}`}>
                {formatTime(currentTime, clock.timezone)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Standard display with more details
        <div className="space-y-3">
          {clocks.map((clock) => (
            <div 
              key={clock.id}
              className={`rounded-lg p-3 border ${
                clock.isPrimary 
                  ? "bg-black/60 border-blue-900/30" 
                  : "bg-black/40 border-blue-900/20"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className={`text-xs uppercase ${clock.isPrimary ? "text-blue-400" : "text-gray-400"}`}>
                    {clock.label}
                  </div>
                  <div className={`font-mono ${clock.isPrimary ? "text-xl font-bold" : "text-lg"}`}>
                    {formatTime(currentTime, clock.timezone)}
                  </div>
                  {!compact && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(currentTime, clock.timezone)}
                    </div>
                  )}
                </div>
                {clock.notes && (
                  <div className={`text-xs px-2 py-1 rounded ${
                    clock.isPrimary 
                      ? "bg-blue-900/30 text-blue-300" 
                      : "text-gray-500"
                  }`}>
                    {clock.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorldClockPanel;