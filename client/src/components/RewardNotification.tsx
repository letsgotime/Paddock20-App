import React, { useEffect, useState } from 'react';
import { X, Zap, Award, Star, Trophy } from 'lucide-react';
import { useRewards } from '../contexts/RewardsContext';
import { motion, AnimatePresence } from 'framer-motion';

const RewardNotification: React.FC = () => {
  const { recentReward, showRewardNotification, dismissRewardNotification } = useRewards();
  const [isVisible, setIsVisible] = useState(false);
  
  // Auto-dismiss after 7 seconds
  useEffect(() => {
    if (showRewardNotification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(dismissRewardNotification, 500); // Allow exit animation to complete
      }, 7000);
      
      return () => clearTimeout(timer);
    }
  }, [showRewardNotification, dismissRewardNotification]);
  
  if (!recentReward || !showRewardNotification) {
    return null;
  }
  
  // Determine level-appropriate colors and styles
  const levelColors = {
    bronze: 'from-amber-700 to-amber-600 border-amber-500',
    silver: 'from-slate-400 to-slate-300 border-slate-200',
    gold: 'from-yellow-500 to-amber-400 border-yellow-300',
    platinum: 'from-indigo-400 to-blue-300 border-indigo-200'
  };
  
  const levelGlow = {
    bronze: 'shadow-amber-500/40',
    silver: 'shadow-slate-300/50',
    gold: 'shadow-yellow-400/50',
    platinum: 'shadow-indigo-300/60'
  };
  
  // Get the appropriate badge icon based on reward level
  const getBadgeIcon = () => {
    switch (recentReward.level) {
      case 'gold':
        return <Trophy className="h-6 w-6 text-yellow-300" />;
      case 'platinum':
        return <Star className="h-6 w-6 text-indigo-200" />;
      case 'silver':
        return <Award className="h-6 w-6 text-slate-200" />;
      default:
        return <Award className="h-6 w-6 text-amber-400" />;
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed bottom-6 right-6 z-50 max-w-xs"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ 
            type: "spring",
            damping: 20,
            stiffness: 300
          }}
        >
          <div className={`rounded-lg p-0.5 bg-gradient-to-r ${levelColors[recentReward.level]} shadow-lg ${levelGlow[recentReward.level]} shadow-xl`}>
            <div className="bg-black/90 backdrop-blur-sm rounded-md p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 text-3xl">{recentReward.icon}</div>
                  {getBadgeIcon()}
                </div>
                <button 
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(dismissRewardNotification, 500);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="mt-2">
                <h3 className="text-lg font-orbitron text-blue-400">Reward Unlocked!</h3>
                <p className="font-medium text-white mt-1">{recentReward.title}</p>
                <p className="text-sm text-gray-300 mt-1">{recentReward.description}</p>
              </div>
              
              {recentReward.points > 0 && (
                <div className="mt-3 bg-blue-900/30 rounded px-3 py-2 flex items-center justify-between">
                  <span className="text-sm text-blue-300">Points Earned</span>
                  <span className="flex items-center text-blue-300 font-bold">
                    <Zap className="h-3.5 w-3.5 mr-1 text-yellow-400" />
                    +{recentReward.points}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RewardNotification;