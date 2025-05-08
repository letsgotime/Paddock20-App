/**
 * EngagementRewardsModal.tsx
 * 
 * A comprehensive modal for displaying detailed reward statistics,
 * achievement progress, and activity history using the F1-inspired design language.
 * 
 * Design by: Replit AI & GoTime Motorsports Engineering Team
 * Last updated: May 2025
 */

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { 
  Trophy, 
  X, 
  Award, 
  Activity, 
  Star, 
  BarChart3, 
  Clock,
  AlignLeft,
  Car,
  Settings,
  Zap,
  Layers,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import EngagementRewardsService, { 
  AchievementCategory, 
  Achievement, 
  RewardActivity, 
  ActivityType 
} from '../services/engagementRewardsService';

interface EngagementRewardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Activity icon mapping (more detailed than the panel version)
const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  drive_logged: <Car className="h-5 w-5 text-blue-400" />,
  maintenance_logged: <Settings className="h-5 w-5 text-purple-400" />,
  detail_session: <Zap className="h-5 w-5 text-yellow-400" />,
  mod_installed: <Layers className="h-5 w-5 text-orange-400" />,
  photo_uploaded: <Star className="h-5 w-5 text-pink-400" />,
  profile_updated: <Activity className="h-5 w-5 text-gray-400" />,
  weather_checked: <BarChart3 className="h-5 w-5 text-teal-400" />,
  vehicle_added: <Car className="h-5 w-5 text-green-400" />,
  route_planned: <Calendar className="h-5 w-5 text-indigo-400" />,
  juicebox_used: <Star className="h-5 w-5 text-amber-400" />,
  feature_explored: <Activity className="h-5 w-5 text-blue-300" />,
  goal_achieved: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
  goal_created: <Star className="h-5 w-5 text-violet-400" />,
  sale_completed: <Car className="h-5 w-5 text-red-400" />
};

// Category icon mapping
const CATEGORY_ICONS: Record<AchievementCategory, React.ReactNode> = {
  driving: <Car className="h-5 w-5" />,
  maintenance: <Settings className="h-5 w-5" />,
  detailing: <Zap className="h-5 w-5" />,
  modification: <Layers className="h-5 w-5" />,
  community: <Activity className="h-5 w-5" />,
  exploration: <BarChart3 className="h-5 w-5" />,
  collection: <Star className="h-5 w-5" />,
  mastery: <Trophy className="h-5 w-5" />
};

export default function EngagementRewardsModal({ open, onOpenChange }: EngagementRewardsModalProps) {
  const [rewardsData, setRewardsData] = useState(EngagementRewardsService.getRewardsProgress());
  const [levelProgress, setLevelProgress] = useState(EngagementRewardsService.getLevelProgress());
  const [recentActivities, setRecentActivities] = useState<RewardActivity[]>([]);
  const [achievementsByCategory, setAchievementsByCategory] = useState<Record<AchievementCategory, Achievement[]>>({
    driving: [],
    maintenance: [],
    detailing: [],
    modification: [],
    community: [],
    exploration: [],
    collection: [],
    mastery: []
  });
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>('driving');
  
  // Update rewards data
  useEffect(() => {
    if (!open) return;
    
    const updateData = () => {
      const data = EngagementRewardsService.getRewardsProgress();
      setRewardsData(data);
      setLevelProgress(EngagementRewardsService.getLevelProgress());
      setRecentActivities(EngagementRewardsService.getRecentActivities(30));
      
      // Group achievements by category
      const categories: AchievementCategory[] = [
        'driving', 'maintenance', 'detailing', 'modification', 
        'community', 'exploration', 'collection', 'mastery'
      ];
      
      const grouped = categories.reduce((acc, category) => {
        acc[category] = EngagementRewardsService.getAchievementsByCategory(category);
        return acc;
      }, {} as Record<AchievementCategory, Achievement[]>);
      
      setAchievementsByCategory(grouped);
    };
    
    updateData();
    
    // Listen for updates while modal is open
    const handleRewardsUpdate = () => {
      updateData();
    };
    
    window.addEventListener('rewards-update', handleRewardsUpdate);
    
    return () => {
      window.removeEventListener('rewards-update', handleRewardsUpdate);
    };
  }, [open]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (!rewardsData) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] p-0 bg-black border border-[#222] rounded-xl shadow-xl">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#08c519]/30 to-blue-700/30 flex items-center justify-center">
                <Trophy className="h-7 w-7 text-[#08c519]" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">Performance Rewards</DialogTitle>
                <p className="text-gray-400 text-sm">Track your achievements and engagement</p>
              </div>
            </div>
            <button 
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full bg-[#222] flex items-center justify-center hover:bg-[#333] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>
        
        {/* Level Progress Bar */}
        <div className="px-6 py-4">
          <div className="bg-[#111] rounded-xl p-4 border border-[#222]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div>
                <h3 className="text-xl font-bold text-[#08c519]">Level {levelProgress.currentLevel}</h3>
                <p className="text-sm text-gray-400">Total Points: {rewardsData.totalPoints}</p>
              </div>
              <div className="flex items-center gap-2 bg-[#222] px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-400">Next Level:</span>
                <span className="font-bold">{levelProgress.pointsToNextLevel} points needed</span>
              </div>
            </div>
            
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-[#08c519]" 
                style={{ width: `${levelProgress.progressPercentage}%` }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-gray-400 text-right">
              {levelProgress.progressPercentage}% complete
            </div>
          </div>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="achievements" className="px-6">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="achievements" className="data-[state=active]:bg-[#08c519]/20">
              <Award className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="activities" className="data-[state=active]:bg-[#08c519]/20">
              <Activity className="h-4 w-4 mr-2" />
              Activity History
            </TabsTrigger>
          </TabsList>
          
          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(achievementsByCategory).map(([category, achievements]) => (
                achievements.length > 0 && (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category as AchievementCategory)}
                    className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                      selectedCategory === category 
                        ? 'bg-[#08c519]/20 border border-[#08c519]/30' 
                        : 'bg-[#222] hover:bg-[#333] border border-[#333]'
                    }`}
                  >
                    {CATEGORY_ICONS[category as AchievementCategory]}
                    <span className="capitalize">{category}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-black/40">
                      {achievements.filter(a => a.unlocked).length}/{achievements.length}
                    </span>
                  </button>
                )
              ))}
            </div>
            
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievementsByCategory[selectedCategory]?.map(achievement => (
                  <div 
                    key={achievement.id} 
                    className={`p-4 rounded-xl flex items-center gap-4 ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-br from-[#08c519]/10 to-blue-700/10 border border-[#08c519]/20' 
                        : 'bg-[#111] border border-[#222] opacity-70'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-br from-[#08c519]/30 to-blue-700/30' 
                        : 'bg-gray-800/50'
                    }`}>
                      <Award className={`h-8 w-8 ${
                        achievement.unlocked ? 'text-yellow-500' : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-bold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                          {achievement.title}
                        </h3>
                        {achievement.unlocked && (
                          <span className="text-xs text-gray-400">
                            {formatDate(achievement.dateUnlocked || '')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>
                      
                      {/* Level indicator */}
                      {achievement.level > 1 && (
                        <span className="text-xs px-2 py-0.5 bg-[#222] rounded-full mt-2 inline-block">
                          Level {achievement.level}
                        </span>
                      )}
                      
                      {/* Next level info */}
                      {achievement.unlocked && achievement.nextLevel && (
                        <div className="mt-2 text-xs text-gray-400">
                          <span>Next: {achievement.nextLevel.title} ({achievement.nextLevel.requiredPoints - achievement.requiredPoints} more points)</span>
                        </div>
                      )}
                      
                      {/* Locked info */}
                      {!achievement.unlocked && (
                        <div className="mt-2 text-xs flex items-center gap-1">
                          <Lock className="h-3 w-3 text-gray-500" />
                          <span className="text-gray-500">Requires {achievement.requiredPoints} points</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Empty state */}
              {(!achievementsByCategory[selectedCategory] || achievementsByCategory[selectedCategory].length === 0) && (
                <div className="text-center py-10">
                  <div className="mx-auto w-16 h-16 rounded-full bg-[#222] flex items-center justify-center mb-4">
                    <Trophy className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">No achievements yet</h3>
                  <p className="text-gray-400">
                    Keep engaging with the app to unlock achievements in this category.
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          {/* Activities Tab */}
          <TabsContent value="activities">
            <ScrollArea className="h-[460px] pr-4">
              <div className="space-y-3">
                {recentActivities.map(activity => (
                  <div 
                    key={activity.id} 
                    className="bg-[#111] border border-[#222] rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center flex-shrink-0">
                      {ACTIVITY_ICONS[activity.type] || <Star className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-1">
                        <h3 className="font-medium">{activity.description}</h3>
                        <div className="text-[#08c519] font-bold text-base flex items-center gap-1">
                          <span>+{activity.pointsEarned}</span>
                          <span className="text-xs">pts</span>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-gray-400 gap-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(activity.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlignLeft className="h-3 w-3" />
                          <span className="capitalize">{activity.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty state */}
                {recentActivities.length === 0 && (
                  <div className="text-center py-10">
                    <div className="mx-auto w-16 h-16 rounded-full bg-[#222] flex items-center justify-center mb-4">
                      <Activity className="h-8 w-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">No activity yet</h3>
                    <p className="text-gray-400">
                      Start interacting with features to earn points and track your activity.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        {/* Footer */}
        <div className="p-4 border-t border-[#222] mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-400">
            Keep engaging with Paddock20 to earn more rewards
          </span>
          <div className="flex items-center text-[#08c519]">
            <Star className="h-4 w-4 mr-1" />
            <span className="font-bold">{rewardsData.totalPoints} total points</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}