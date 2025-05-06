import React from 'react';
import { Calendar, Clock, DollarSign, Layers, Target, Trophy } from 'lucide-react';
import { Goal } from '../../types/manifestation';

interface GoalTileGridProps {
  goals: Goal[];
  onSelectGoal: (goalId: number) => void;
  activeGoal: Goal | null;
  type: 'active' | 'completed';
}

const GoalTileGrid: React.FC<GoalTileGridProps> = ({ 
  goals, 
  onSelectGoal, 
  activeGoal, 
  type 
}) => {
  // Filter goals based on type
  const filteredGoals = goals.filter(goal => 
    type === 'active' 
      ? goal.manifestStatus === 'in_progress' 
      : goal.manifestStatus === 'complete' || goal.manifestStatus === 'completed'
  );

  if (filteredGoals.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        {type === 'active' 
          ? "No active goals found. Create a new goal to get started!" 
          : "You haven't completed any goals yet. Keep going!"}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredGoals.map(goal => {
        // Get the first image from the media gallery, if available
        const coverImage = goal.mediaGallery && goal.mediaGallery.length > 0
          ? goal.mediaGallery.find(media => media.type === 'image')?.url
          : null;
        
        // Calculate days remaining or days since completion
        const targetDate = new Date(goal.targetDate);
        const today = new Date();
        const daysDiff = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        const isActive = activeGoal?.id === goal.id;
        
        return (
          <div 
            key={goal.id}
            onClick={() => onSelectGoal(goal.id)}
            className={`
              bg-gray-900 rounded-xl overflow-hidden transition-all duration-200 shadow-lg border-2
              ${isActive 
                ? 'border-blue-400 transform scale-[1.02]' 
                : 'border-gray-800 hover:border-gray-700'}
              cursor-pointer
            `}
          >
            {/* Goal Cover Image */}
            <div 
              className="h-44 bg-cover bg-center"
              style={{
                backgroundImage: coverImage 
                  ? `url(${coverImage})` 
                  : 'linear-gradient(135deg, rgb(59, 130, 246, 0.6), rgb(16, 24, 39, 0.8))'
              }}
            >
              <div className="w-full h-full bg-gradient-to-t from-gray-900 via-transparent flex items-end p-4">
                <div>
                  <div className="inline-flex items-center text-xs bg-black bg-opacity-70 text-blue-400 rounded-full px-3 py-1 mb-2">
                    {goal.goalType}
                  </div>
                  <h3 className="text-xl font-bold text-white">{goal.goalName}</h3>
                </div>
              </div>
            </div>
            
            {/* Goal Details */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                {/* Progress Percentage */}
                <div className="inline-flex items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white font-bold text-xs">
                    {goal.progressPercentage}%
                  </div>
                  <div className="ml-2">
                    <div className="text-xs text-gray-400">Progress</div>
                    <div className="h-2 w-24 bg-gray-800 rounded-full mt-1">
                      <div 
                        className="h-2 rounded-full bg-blue-500" 
                        style={{ width: `${goal.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Financial Details */}
                <div className="text-right">
                  <div className="flex items-center justify-end text-gray-400 text-xs">
                    <DollarSign className="h-3 w-3 mr-1" />
                    <span>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0
                      }).format(goal.currentAmount)} / {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0
                      }).format(goal.targetAmount)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Goal Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {type === 'active' ? (
                  <>
                    <div className="flex items-center text-gray-400">
                      <Calendar className="h-3 w-3 mr-1.5" />
                      <span>{daysDiff > 0 ? `${daysDiff} days left` : 'Due soon'}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Target className="h-3 w-3 mr-1.5" />
                      <span>{goal.targetDate}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center text-green-400">
                      <Trophy className="h-3 w-3 mr-1.5" />
                      <span>Completed</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Clock className="h-3 w-3 mr-1.5" />
                      <span>{Math.abs(daysDiff)} days ago</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Description Preview */}
              <div className="mt-3 text-xs text-gray-400 line-clamp-2">
                {goal.description}
              </div>
            </div>
            
            {/* Action Footer */}
            <div className="px-4 pb-4 pt-1 flex justify-between">
              {type === 'active' ? (
                <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
                  <Layers className="h-3 w-3 mr-1.5" />
                  Hustle Planner
                </button>
              ) : (
                <button className="text-xs text-green-400 hover:text-green-300 flex items-center">
                  <Trophy className="h-3 w-3 mr-1.5" />
                  View Achievement
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GoalTileGrid;