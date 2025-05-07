/**
 * EngagementRewardsPanel.tsx
 * 
 * Displays the user's engagement rewards, achievements, and progress
 * toward the next level in a gamified F1-inspired dashboard panel.
 * 
 * Design by: Replit AI & GoTime Motorsports Engineering Team
 * Last updated: May 2025
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Trophy, 
  Star, 
  Zap, 
  Activity, 
  Layers, 
  BarChart3, 
  Car, 
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import EngagementRewardsService, { 
  Achievement, 
  RewardActivity, 
  ActivityType 
} from '../services/engagementRewardsService';

interface EngagementRewardsPanelProps {
  compact?: boolean;
  showActivities?: boolean;
  showAchievements?: boolean;
  limit?: number;
}

// Activity icon mapping
const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  drive_logged: <Car className="h-4 w-4" />,
  maintenance_logged: <Layers className="h-4 w-4" />,
  detail_session: <Zap className="h-4 w-4" />,
  mod_installed: <Layers className="h-4 w-4" />,
  photo_uploaded: <Star className="h-4 w-4" />,
  profile_updated: <Activity className="h-4 w-4" />,
  weather_checked: <BarChart3 className="h-4 w-4" />,
  vehicle_added: <Car className="h-4 w-4" />,
  route_planned: <Calendar className="h-4 w-4" />,
  juicebox_used: <Star className="h-4 w-4" />,
  feature_explored: <Activity className="h-4 w-4" />,
  goal_achieved: <CheckCircle2 className="h-4 w-4" />,
  goal_created: <Star className="h-4 w-4" />,
  sale_completed: <Car className="h-4 w-4" />
};

export default function EngagementRewardsPanel({
  compact = false,
  showActivities = true,
  showAchievements = true,
  limit = 5
}: EngagementRewardsPanelProps) {
  const [rewardsData, setRewardsData] = useState(EngagementRewardsService.getRewardsProgress());
  const [levelProgress, setLevelProgress] = useState(EngagementRewardsService.getLevelProgress());
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [recentActivities, setRecentActivities] = useState<RewardActivity[]>([]);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  
  // Update rewards data when rewards are updated
  useEffect(() => {
    const handleRewardsUpdate = () => {
      const newRewardsData = EngagementRewardsService.getRewardsProgress();
      setRewardsData(newRewardsData);
      setLevelProgress(EngagementRewardsService.getLevelProgress());
      setUnlockedAchievements(EngagementRewardsService.getUnlockedAchievements());
      setRecentActivities(EngagementRewardsService.getRecentActivities(limit));
    };
    
    // Initialize data
    handleRewardsUpdate();
    
    // Listen for achievement unlocks
    const handleAchievementUnlocked = (event: CustomEvent) => {
      const { achievement } = event.detail;
      setNewAchievement(achievement);
      setTimeout(() => setNewAchievement(null), 5000);
      handleRewardsUpdate();
    };
    
    // Add event listeners
    window.addEventListener('rewards-update', handleRewardsUpdate);
    window.addEventListener('achievement-unlocked', handleAchievementUnlocked as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('rewards-update', handleRewardsUpdate);
      window.removeEventListener('achievement-unlocked', handleAchievementUnlocked as EventListener);
    };
  }, [limit]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (!rewardsData) {
    return (
      <div className="rounded-xl bg-black/50 p-4 border border-[#222] shadow-md animate-pulse">
        <div className="h-20 bg-gray-800/30 rounded-md"></div>
      </div>
    );
  }
  
  return (
    <>
      <div className="rounded-xl bg-black/50 p-4 border border-[#222] shadow-md">
        {/* Title and Level */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[#08c519]" />
            <h2 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}>
              {compact ? 'Rewards' : 'Performance Rewards'}
            </h2>
          </div>
          <div 
            className="flex items-center gap-1 bg-[#111] rounded-full px-3 py-1 cursor-pointer hover:bg-[#222] transition-colors"
            onClick={() => setShowRewardsModal(true)}
          >
            <span className="text-[#08c519] font-bold">Level {levelProgress.currentLevel}</span>
            {!compact && (
              <span className="text-xs text-gray-400">
                ({rewardsData.totalPoints} pts)
              </span>
            )}
          </div>
        </div>
        
        {/* Level Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress to Level {levelProgress.currentLevel + 1}</span>
            <span>{levelProgress.progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-[#08c519]" 
              style={{ width: `${levelProgress.progressPercentage}%` }}
            ></div>
          </div>
          <div className="mt-1 text-xs text-gray-400 text-right">
            {levelProgress.pointsToNextLevel} points to next level
          </div>
        </div>
        
        {/* Recent Achievements (Compact) */}
        {compact && showAchievements && unlockedAchievements.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <h3 className="text-xs font-bold">Latest Achievements</h3>
            </div>
            <div className="flex gap-2 overflow-x-auto py-1">
              {unlockedAchievements.slice(0, 3).map(achievement => (
                <div 
                  key={achievement.id} 
                  className="flex-shrink-0 bg-gray-800 rounded-lg p-2 w-24 flex flex-col items-center"
                  title={achievement.description}
                >
                  <Award className="h-6 w-6 text-yellow-500 mb-1" />
                  <span className="text-xs text-center truncate w-full">{achievement.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Recent Activities (Compact) */}
        {compact && showActivities && recentActivities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-blue-400" />
              <h3 className="text-xs font-bold">Recent Activity</h3>
            </div>
            <div className="space-y-2">
              {recentActivities.slice(0, 2).map(activity => (
                <div key={activity.id} className="flex items-center text-xs gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-900/50 flex items-center justify-center">
                    {ACTIVITY_ICONS[activity.type] || <Star className="h-3 w-3" />}
                  </div>
                  <span className="flex-1 truncate">{activity.description}</span>
                  <span className="text-[#08c519]">+{activity.pointsEarned}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Full Achievement Section */}
        {!compact && showAchievements && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-5 w-5 text-yellow-500" />
              <h3 className="text-sm font-bold">Achievements</h3>
              <span className="text-xs text-gray-400">
                ({unlockedAchievements.length}/{rewardsData.achievements?.length || 0})
              </span>
            </div>
            
            {unlockedAchievements.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {unlockedAchievements.slice(0, 4).map(achievement => (
                  <div 
                    key={achievement.id} 
                    className="bg-gray-800/50 rounded-lg p-2 flex items-center gap-2 border border-gray-700/50"
                  >
                    <Award className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <h4 className="font-medium text-sm truncate">{achievement.title}</h4>
                      <p className="text-xs text-gray-400 truncate">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400 text-center py-2">
                No achievements unlocked yet. Keep exploring!
              </div>
            )}
          </div>
        )}
        
        {/* Full Activity Section */}
        {!compact && showActivities && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-5 w-5 text-blue-400" />
              <h3 className="text-sm font-bold">Recent Activity</h3>
            </div>
            
            {recentActivities.length > 0 ? (
              <div className="space-y-2">
                {recentActivities.slice(0, 5).map(activity => (
                  <div 
                    key={activity.id} 
                    className="flex items-center text-sm gap-3 bg-gray-800/30 p-2 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                      {ACTIVITY_ICONS[activity.type] || <Star className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{activity.description}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDate(activity.timestamp)}
                      </p>
                    </div>
                    <div className="text-[#08c519] font-bold flex items-center gap-1">
                      <span>+{activity.pointsEarned}</span>
                      <span className="text-xs">pts</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400 text-center py-2">
                No activity recorded yet. Start interacting with the app!
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Achievement Unlocked Toast */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="fixed bottom-10 right-10 bg-black/90 border border-yellow-500/50 rounded-lg p-4 shadow-lg shadow-yellow-500/20 max-w-xs z-50 flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Trophy className="h-7 w-7 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-bold text-yellow-300">Achievement Unlocked!</h3>
              <p className="font-medium">{newAchievement.title}</p>
              <p className="text-sm text-gray-300">{newAchievement.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}