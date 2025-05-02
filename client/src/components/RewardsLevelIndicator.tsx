import React from 'react';
import { useRewards } from '../contexts/RewardsContext';
import { Zap, ChevronUp } from 'lucide-react';

interface RewardsLevelIndicatorProps {
  minimal?: boolean; // For compact display in headers
  showNextLevel?: boolean; // Show progress to next level
}

const RewardsLevelIndicator: React.FC<RewardsLevelIndicatorProps> = ({ 
  minimal = false,
  showNextLevel = true
}) => {
  const { userRewards, pointsToNextLevel, levelProgress } = useRewards();
  
  if (minimal) {
    // Minimal version for headers/top bars
    return (
      <div className="flex items-center space-x-1.5 px-2 py-1 bg-black/30 backdrop-blur-sm rounded border border-blue-900/30">
        <span className="text-xs font-bold text-white">{userRewards.level}</span>
        <Zap className="h-3.5 w-3.5 text-yellow-400" />
        <span className="text-xs font-mono text-blue-300">{userRewards.totalPoints}</span>
      </div>
    );
  }
  
  // Full version with progress bar
  return (
    <div className="bg-black/30 backdrop-blur-sm rounded border border-blue-900/30 p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 flex items-center justify-center bg-blue-900/30 rounded-full">
            <span className="font-bold text-white">{userRewards.level}</span>
          </div>
          <div className="ml-2">
            <p className="text-xs text-blue-300">Driver Level</p>
            <div className="flex items-center">
              <Zap className="h-3.5 w-3.5 text-yellow-400 mr-1" />
              <span className="text-sm font-mono text-white">{userRewards.totalPoints}</span>
              <span className="text-xs text-gray-500 ml-1">pts</span>
            </div>
          </div>
        </div>
        
        {showNextLevel && (
          <div className="text-right">
            <p className="text-xs text-gray-400 flex items-center justify-end">
              <ChevronUp className="h-3 w-3 text-blue-400 mr-1" />
              <span>Level {userRewards.level + 1}</span>
            </p>
            <p className="text-xs text-blue-300 font-mono">{pointsToNextLevel} pts needed</p>
          </div>
        )}
      </div>
      
      {showNextLevel && (
        <div className="mt-2">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsLevelIndicator;