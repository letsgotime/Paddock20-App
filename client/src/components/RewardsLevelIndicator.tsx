import React from 'react';
import { Trophy, Medal, Star, Award, TrendingUp, Clock } from 'lucide-react';
import { useRewards } from '../contexts/RewardsContext';

// Type for the component props
interface RewardsLevelIndicatorProps {
  minimal?: boolean; // For compact display in headers
  showNextLevel?: boolean; // Show progress to next level
}

/**
 * A component to display the user's current rewards level and progress
 */
const RewardsLevelIndicator: React.FC<RewardsLevelIndicatorProps> = ({ 
  minimal = false,
  showNextLevel = true
}) => {
  const { state } = useRewards();
  const { userPoints, driverLevel, nextLevelPoints } = state;
  
  // Calculate progress percentage to next level
  const progressPercentage = nextLevelPoints > 0 
    ? Math.min((userPoints / nextLevelPoints) * 100, 100) 
    : 100;
  
  // Get appropriate level icon
  const getLevelIcon = () => {
    switch (true) {
      case driverLevel >= 20:
        return <Trophy className="text-yellow-400 h-5 w-5" />;
      case driverLevel >= 15:
        return <Award className="text-blue-400 h-5 w-5" />;
      case driverLevel >= 10:
        return <Medal className="text-green-400 h-5 w-5" />;
      case driverLevel >= 5:
        return <Star className="text-orange-400 h-5 w-5" />;
      default:
        return <TrendingUp className="text-gray-400 h-5 w-5" />;
    }
  };
  
  // Get level name based on number
  const getLevelName = () => {
    switch (true) {
      case driverLevel >= 20:
        return "Grand Champion";
      case driverLevel >= 15:
        return "Master Driver";
      case driverLevel >= 10:
        return "Elite Driver";
      case driverLevel >= 5:
        return "Senior Driver";
      default:
        return "Driver";
    }
  };
  
  // Minimal version for headers
  if (minimal) {
    return (
      <div className="flex items-center text-sm">
        {getLevelIcon()}
        <span className="ml-1 font-orbitron text-green-400">Level {driverLevel}</span>
        <div className="ml-2 w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-blue-500" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    );
  }
  
  // Full version with more details
  return (
    <div className="p-4 bg-gradient-to-b from-gray-900 to-black rounded-lg border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {getLevelIcon()}
          <h3 className="ml-2 font-orbitron text-green-400">Level {driverLevel} {getLevelName()}</h3>
        </div>
        <div className="flex items-center">
          <Star className="text-yellow-400 h-4 w-4 mr-1" />
          <span className="text-yellow-400 font-bold">{userPoints} points</span>
        </div>
      </div>
      
      {showNextLevel && (
        <>
          <div className="w-full bg-gray-800 rounded-full h-2.5 mb-1 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-blue-500" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Level {driverLevel}</span>
            <span>
              <Clock className="inline h-3 w-3 mr-1" />
              {Math.max(0, nextLevelPoints - userPoints)} points to Level {driverLevel + 1}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default RewardsLevelIndicator;