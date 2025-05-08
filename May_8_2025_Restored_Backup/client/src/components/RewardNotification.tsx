import React, { useEffect, useState } from 'react';
import { X, Zap, Trophy, Flag } from 'lucide-react';
import { useRewards, Reward } from '../contexts/RewardsContext';
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
  
  // Get level-appropriate color
  const getLevelColor = (level: Reward['level']) => {
    switch (level) {
      case 'bronze': return 'from-amber-700 to-amber-600';
      case 'silver': return 'from-slate-400 to-slate-300';
      case 'gold': return 'from-yellow-500 to-amber-400';
      case 'platinum': return 'from-indigo-400 to-blue-300';
      case 'diamond': return 'from-purple-500 to-pink-400';
      default: return 'from-blue-600 to-blue-500';
    }
  };
  
  // Get rarity label
  const getRarityLabel = (rarity: Reward['rarity']) => {
    switch (rarity) {
      case 'common': return 'Standard';
      case 'uncommon': return 'Uncommon';
      case 'rare': return 'Rare';
      case 'epic': return 'Epic';
      case 'legendary': return 'Legendary';
      default: return 'Standard';
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed bottom-6 right-6 z-50 max-w-xs pointer-events-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className={`rounded-lg p-0.5 bg-gradient-to-r ${getLevelColor(recentReward.level)} shadow-lg`}>
            <div className="bg-black/90 backdrop-blur-sm rounded-md p-4">
              <div className="flex items-start justify-between">
                <div className="flex-shrink-0 text-3xl">{recentReward.icon}</div>
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
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-blue-400" />
                  <h3 className="text-lg font-orbitron text-blue-400">Podium Pursuit</h3>
                </div>
                <p className="font-medium text-white mt-1">{recentReward.title}</p>
                <p className="text-sm text-gray-300 mt-1">{recentReward.description}</p>
                <div className="mt-1 flex items-center">
                  <Flag className="h-3 w-3 mr-1 text-blue-400" />
                  <span className="text-xs text-blue-300">{getRarityLabel(recentReward.rarity)} achievement</span>
                </div>
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