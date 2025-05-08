import React, { useState } from 'react';
import { useRewards } from '../contexts/RewardsContext';
import { Zap, Award, Trophy, ChevronsUp, Filter } from 'lucide-react';

type RewardCategory = 'all' | 'engagement' | 'maintenance' | 'driving' | 'community' | 'learning';

const RewardsPanel: React.FC = () => {
  const { userRewards, pointsToNextLevel, levelProgress } = useRewards();
  const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard'>('badges');
  const [categoryFilter, setCategoryFilter] = useState<RewardCategory>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get rewards sorted by achievement date (most recent first)
  const sortedRewards = [...userRewards.rewards].sort((a, b) => {
    if (!a.dateAchieved) return 1;
    if (!b.dateAchieved) return -1;
    return new Date(b.dateAchieved).getTime() - new Date(a.dateAchieved).getTime();
  });
  
  // Filter rewards by category
  const filteredRewards = categoryFilter === 'all' 
    ? sortedRewards 
    : sortedRewards.filter(reward => reward.category === categoryFilter);
  
  // Calculate stats for the rewards dashboard
  const stats = {
    earnedBadges: userRewards.rewards.length,
    bronze: userRewards.rewards.filter(r => r.level === 'bronze').length,
    silver: userRewards.rewards.filter(r => r.level === 'silver').length,
    gold: userRewards.rewards.filter(r => r.level === 'gold').length,
    platinum: userRewards.rewards.filter(r => r.level === 'platinum').length,
  };
  
  // Format time elapsed since achievement
  const formatTimeElapsed = (dateString: string) => {
    if (!dateString) return '';
    
    const achievedDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - achievedDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-black to-gray-900 rounded-xl border border-blue-900/30 overflow-hidden shadow-xl">
      {/* Header with Points and Level Progress */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/20 backdrop-blur-sm p-4 border-b border-blue-800/30">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-orbitron text-blue-400 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
              Driver Rewards
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Earn points and unlock achievements
            </p>
          </div>
          
          <div className="flex items-center bg-black/40 rounded-md px-3 py-1.5 border border-blue-700/30">
            <Zap className="h-4 w-4 text-yellow-400 mr-1.5" />
            <span className="font-mono font-bold text-white">{userRewards.totalPoints}</span>
            <span className="text-blue-300 text-sm ml-1.5">PTS</span>
          </div>
        </div>
        
        {/* Level Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <div className="flex items-center">
              <ChevronsUp className="h-3.5 w-3.5 text-blue-500 mr-1" />
              <span className="text-blue-300">Level {userRewards.level}</span>
            </div>
            <div>
              <span className="text-white">{pointsToNextLevel}</span> points to Level {userRewards.level + 1}
            </div>
          </div>
          
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="flex border-b border-gray-800">
        <button
          className={`flex-1 py-2.5 text-sm font-medium ${
            activeTab === 'badges' 
              ? 'text-blue-400 border-b-2 border-blue-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('badges')}
        >
          Rewards & Badges
        </button>
        <button
          className={`flex-1 py-2.5 text-sm font-medium ${
            activeTab === 'leaderboard' 
              ? 'text-blue-400 border-b-2 border-blue-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
      </div>
      
      {/* Content area */}
      <div className="p-4">
        {activeTab === 'badges' && (
          <>
            {/* Stats summary */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="flex flex-col items-center justify-center bg-black/30 rounded py-2 border border-gray-800">
                <span className="text-sm text-gray-400">Badges</span>
                <span className="text-lg text-white font-medium">{stats.earnedBadges}</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-black/30 rounded py-2 border border-gray-800">
                <span className="flex items-center text-sm text-amber-700">
                  <Award className="h-3 w-3 mr-1" />
                  Bronze
                </span>
                <span className="text-lg text-white font-medium">{stats.bronze}</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-black/30 rounded py-2 border border-gray-800">
                <span className="flex items-center text-sm text-slate-400">
                  <Award className="h-3 w-3 mr-1" />
                  Silver
                </span>
                <span className="text-lg text-white font-medium">{stats.silver}</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-black/30 rounded py-2 border border-gray-800">
                <span className="flex items-center text-sm text-yellow-500">
                  <Trophy className="h-3 w-3 mr-1" />
                  Gold
                </span>
                <span className="text-lg text-white font-medium">{stats.gold}</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-black/30 rounded py-2 border border-gray-800">
                <span className="flex items-center text-sm text-indigo-400">
                  <Trophy className="h-3 w-3 mr-1" />
                  Platinum
                </span>
                <span className="text-lg text-white font-medium">{stats.platinum}</span>
              </div>
            </div>
            
            {/* Filter controls */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-blue-300 font-medium">Your Achievements</h3>
              <button
                className="text-gray-400 hover:text-white transition-colors flex items-center text-xs"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-3.5 w-3.5 mr-1" />
                Filter
              </button>
            </div>
            
            {showFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  className={`text-xs px-2.5 py-1 rounded ${
                    categoryFilter === 'all'
                      ? 'bg-blue-600/40 text-blue-200'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setCategoryFilter('all')}
                >
                  All
                </button>
                <button
                  className={`text-xs px-2.5 py-1 rounded ${
                    categoryFilter === 'engagement'
                      ? 'bg-blue-600/40 text-blue-200'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setCategoryFilter('engagement')}
                >
                  Engagement
                </button>
                <button
                  className={`text-xs px-2.5 py-1 rounded ${
                    categoryFilter === 'maintenance'
                      ? 'bg-blue-600/40 text-blue-200'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setCategoryFilter('maintenance')}
                >
                  Maintenance
                </button>
                <button
                  className={`text-xs px-2.5 py-1 rounded ${
                    categoryFilter === 'driving'
                      ? 'bg-blue-600/40 text-blue-200'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setCategoryFilter('driving')}
                >
                  Driving
                </button>
                <button
                  className={`text-xs px-2.5 py-1 rounded ${
                    categoryFilter === 'community'
                      ? 'bg-blue-600/40 text-blue-200'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setCategoryFilter('community')}
                >
                  Community
                </button>
                <button
                  className={`text-xs px-2.5 py-1 rounded ${
                    categoryFilter === 'learning'
                      ? 'bg-blue-600/40 text-blue-200'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setCategoryFilter('learning')}
                >
                  Learning
                </button>
              </div>
            )}
            
            {/* Achievements list */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-blue-800">
              {filteredRewards.length === 0 ? (
                <div className="bg-black/30 rounded-lg p-4 text-center border border-gray-800">
                  <p className="text-gray-400">No badges earned yet in this category</p>
                  <p className="text-sm text-gray-500 mt-1">Keep engaging with Paddock20 to earn rewards!</p>
                </div>
              ) : (
                filteredRewards.map(reward => (
                  <div key={reward.id} className="bg-black/30 rounded-lg p-3 border border-gray-800 hover:border-blue-800/40 transition-colors">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 text-3xl mr-3">{reward.icon}</div>
                      <div className="flex-grow">
                        <h4 className="text-white font-medium">{reward.title}</h4>
                        <p className="text-sm text-gray-400">{reward.description}</p>
                        <div className="flex justify-between items-center mt-1">
                          <div className="flex items-center">
                            <Zap className="h-3.5 w-3.5 text-yellow-400 mr-1" />
                            <span className="text-xs text-blue-300">+{reward.points} points</span>
                          </div>
                          {reward.dateAchieved && (
                            <span className="text-xs text-gray-500">{formatTimeElapsed(reward.dateAchieved)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        
        {activeTab === 'leaderboard' && (
          <div className="bg-black/30 rounded-lg p-4 text-center border border-gray-800 h-64 flex items-center justify-center">
            <div>
              <Trophy className="h-10 w-10 text-yellow-500 mx-auto mb-2 opacity-50" />
              <h3 className="text-gray-300 text-lg font-medium">Leaderboard Coming Soon</h3>
              <p className="text-sm text-gray-500 mt-1">
                Compare your progress with other drivers in the Paddock20 community
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsPanel;